# Chiến lược mã hoá số liệu BE → FE

## 1. Bối cảnh & Vấn đề

Hiện tại BE ẩn số liệu trước khi trả về API (set `null` hoặc `0` dựa theo quyền).  
Hệ quả: FE nhận về số liệu đã bị ẩn → công thức tính toán cho ra kết quả sai.

**Mục tiêu:**
- BE luôn trả về **toàn bộ số liệu** nhưng ở dạng đã mã hoá.
- FE giải mã rồi áp dụng logic phân quyền ẩn/hiện tại tầng hiển thị.
- Không lộ key hoặc dữ liệu gốc qua network nếu channel không an toàn.

---

## 2. Lựa chọn thuật toán

### So sánh các phương án

| Phương án | Ưu điểm | Nhược điểm |
|---|---|---|
| **AES-256-GCM** (recommend) | Chuẩn công nghiệp, có integrity check (AEAD), nhanh, hỗ trợ tốt ở cả Java & JS | Cần quản lý key an toàn |
| AES-256-CBC | Phổ biến, đơn giản | Không có integrity check, dễ bị padding oracle nếu implement sai |
| RSA | Không cần chia sẻ secret key | Chậm, không phù hợp cho data lớn, key lớn |
| Base64/XOR | Cực nhanh | **Không phải mã hoá** — bị decode trivially, không chấp nhận được |

### ✅ Chọn: AES-256-GCM

- **Key**: 256 bit (32 bytes), sinh ra và lưu ở config server (không commit vào code).
- **IV (Initialization Vector)**: 96 bit (12 bytes), sinh ngẫu nhiên mỗi lần encrypt.
- **Auth Tag**: 128 bit, tự động validate integrity khi decrypt.
- **Output format**: `base64(IV) + "." + base64(ciphertext + authTag)` — dễ parse ở FE.

---

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│  BE (Java Spring)                                       │
│                                                         │
│  DB → raw numbers → AES-256-GCM encrypt → JSON API     │
│                            ↑                            │
│                    secret key (env var)                  │
└─────────────────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│  FE (React)                                             │
│                                                         │
│  JSON API → AES-256-GCM decrypt → raw numbers          │
│                   ↑                    ↓                │
│           same secret key      permission filter        │
│           (env var VITE_*)      (ẩn/hiện tại FE)       │
└─────────────────────────────────────────────────────────┘
```

**Lưu ý bảo mật:**  
- Key phải được truyền cho FE qua một kênh an toàn (e.g., inject vào HTML server-side sau khi auth, hoặc lấy qua một endpoint `/api/session-key` được bảo vệ bằng JWT).  
- Không hardcode key vào bundle JS.
- Chỉ mã hoá `value` của từng cell, không mã hoá toàn bộ payload (giữ metadata như `columnKey`, `rowKey` để FE vẫn map được).

---

## 4. Cấu trúc JSON

### Trước (BE ẩn số):
```json
{ "columnKey": "SALE", "rowKey": "REVENUES_TOTAL", "value": null }
```

### Sau (encrypt value):
```json
{ "columnKey": "SALE", "rowKey": "REVENUES_TOTAL", "encryptedValue": "abc123IV.xyz456Cipher" }
```

Nếu `value` là `null` (row không có data thực), giữ nguyên `null`, không encrypt.

---

## 5. Code BE — Java Spring

### 5.1 Dependency (pom.xml)

> Không cần thêm dependency — `javax.crypto` / `jakarta.crypto` có sẵn trong Java 8+.

### 5.2 AesGcmEncryptionService.java

```java
package com.cmc.businessplan.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AesGcmEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;   // 96 bits
    private static final int GCM_TAG_LENGTH = 128;  // bits

    private final SecretKey secretKey;

    public AesGcmEncryptionService(@Value("${encryption.aes.key}") String base64Key) {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException("AES key must be 256 bits (32 bytes)");
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * Encrypt a numeric value.
     * Returns null if value is null (preserve null semantics).
     * Output format: base64(IV) + "." + base64(ciphertext+authTag)
     */
    public String encryptNumber(Number value) {
        if (value == null) return null;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] plaintext = value.toString().getBytes("UTF-8");
            byte[] ciphertext = cipher.doFinal(plaintext);

            String ivB64 = Base64.getEncoder().encodeToString(iv);
            String cipherB64 = Base64.getEncoder().encodeToString(ciphertext);
            return ivB64 + "." + cipherB64;
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypt back to original string (parse to Number on caller side).
     */
    public String decryptToString(String encryptedValue) {
        if (encryptedValue == null) return null;
        try {
            String[] parts = encryptedValue.split("\\.");
            if (parts.length != 2) throw new IllegalArgumentException("Invalid encrypted format");

            byte[] iv = Base64.getDecoder().decode(parts[0]);
            byte[] ciphertext = Base64.getDecoder().decode(parts[1]);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_LENGTH, iv));

            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, "UTF-8");
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
```

### 5.3 Tích hợp vào DTO

```java
package com.cmc.businessplan.dto;

import com.cmc.businessplan.security.AesGcmEncryptionService;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class BusinessPlanItemDto {

    private String columnKey;
    private String rowKey;
    private String sectionKey;
    private String compareKey;

    // Raw value chỉ dùng nội bộ, KHÔNG serialize ra JSON
    private transient Number rawValue;

    // Đây là field được serialize ra JSON
    private String encryptedValue;

    public static BusinessPlanItemDto from(
            BusinessPlanItem entity,
            AesGcmEncryptionService encryptionService
    ) {
        BusinessPlanItemDto dto = new BusinessPlanItemDto();
        dto.columnKey = entity.getColumnKey();
        dto.rowKey = entity.getRowKey();
        dto.sectionKey = entity.getSectionKey();
        dto.compareKey = entity.getCompareKey();
        dto.encryptedValue = encryptionService.encryptNumber(entity.getValue());
        return dto;
    }

    // getters...
}
```

### 5.4 Cấu hình key trong application.yml

```yaml
encryption:
  aes:
    key: ${AES_ENCRYPTION_KEY}  # inject từ env var, không hardcode
```

### 5.5 Tạo key ngẫu nhiên (chạy 1 lần, lưu vào env)

```java
// Utility main để generate key — chạy local, copy output vào env var
import javax.crypto.KeyGenerator;
import java.util.Base64;

public class GenerateAesKey {
    public static void main(String[] args) throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES");
        kg.init(256);
        String key = Base64.getEncoder().encodeToString(kg.generateKey().getEncoded());
        System.out.println("AES_ENCRYPTION_KEY=" + key);
    }
}
```

---

## 6. Code FE — React/JS

### 6.1 Lấy key an toàn từ server

```js
// src/lib/session/fetchSessionKey.js
// Gọi sau khi user đã authenticate, trước khi load business plan data
export const fetchSessionKey = async () => {
  const res = await fetch('/api/session-key', {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  })
  if (!res.ok) throw new Error('Cannot fetch session key')
  const { key } = await res.json()  // key: base64 string (256-bit)
  return key
}
```

### 6.2 AES-256-GCM decrypt bằng Web Crypto API

```js
// src/lib/crypto/aesGcm.js
// Dùng Web Crypto API (built-in browser, không cần thêm lib)

const base64ToBytes = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0))

let _cryptoKey = null

/**
 * Import raw base64 key thành CryptoKey object.
 * Gọi 1 lần sau khi fetchSessionKey, cache vào module scope.
 */
export const importKey = async (base64Key) => {
  const keyBytes = base64ToBytes(base64Key)
  _cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,         // not extractable
    ['decrypt'],
  )
  return _cryptoKey
}

/**
 * Decrypt một encryptedValue string (format: "ivB64.cipherB64").
 * Returns the original number, or null if input is null.
 */
export const decryptNumber = async (encryptedValue) => {
  if (encryptedValue == null) return null
  if (!_cryptoKey) throw new Error('Crypto key not initialized — call importKey first')

  const [ivB64, cipherB64] = encryptedValue.split('.')
  const iv = base64ToBytes(ivB64)
  const ciphertext = base64ToBytes(cipherB64)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    _cryptoKey,
    ciphertext,
  )

  const plainText = new TextDecoder().decode(plainBuffer)
  return parseFloat(plainText)
}
```

### 6.3 Decrypt toàn bộ businessPlanItems

```js
// src/lib/crypto/decryptBusinessPlanItems.js
import { decryptNumber } from './aesGcm'

/**
 * Walk qua toàn bộ businessPlanItems và decrypt encryptedValue → value.
 * Trả về object mới (không mutate input).
 */
export const decryptBusinessPlanItems = async (businessPlanItems) => {
  const result = {}

  for (const sectionKey of Object.keys(businessPlanItems)) {
    const section = businessPlanItems[sectionKey]
    result[sectionKey] = { ...section, data: {} }

    for (const rowKey of Object.keys(section.data)) {
      const row = section.data[rowKey]
      const decryptedData = await Promise.all(
        row.data.map(async item => {
          if (item.encryptedValue !== undefined) {
            const value = await decryptNumber(item.encryptedValue)
            const { encryptedValue, ...rest } = item
            return { ...rest, value }
          }
          return item
        })
      )
      result[sectionKey].data[rowKey] = { ...row, data: decryptedData }
    }
  }

  return result
}
```

### 6.4 Tích hợp vào Redux thunk / slice

```js
// src/store/businessPlanDetailsSlice.js (phần liên quan)
import { fetchSessionKey } from '../lib/session/fetchSessionKey'
import { importKey } from '../lib/crypto/aesGcm'
import { decryptBusinessPlanItems } from '../lib/crypto/decryptBusinessPlanItems'

export const loadBusinessPlanDetail = (bpVersionId) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    // 1. Lấy key (1 lần per session, có thể cache vào sessionStorage key handle)
    const base64Key = await fetchSessionKey()
    await importKey(base64Key)

    // 2. Fetch data
    const rawData = await businessPlanApi.getDetail(bpVersionId)

    // 3. Decrypt
    const decryptedItems = await decryptBusinessPlanItems(rawData.businessPlanItems)

    // 4. Dispatch vào store — từ đây useFormula hoạt động trên số gốc
    dispatch(setBusinessPlanDetails({
      ...rawData,
      businessPlanItems: decryptedItems,
    }))
  } catch (err) {
    dispatch(setError(err.message))
  } finally {
    dispatch(setLoading(false))
  }
}
```

---

## 7. Endpoint BE cấp key cho FE

```java
@RestController
@RequestMapping("/api")
public class SessionKeyController {

    @Value("${encryption.aes.key}")
    private String aesKey;

    /**
     * Endpoint này phải được bảo vệ bằng JWT / Spring Security.
     * Chỉ trả key cho user đã authenticate.
     * Có thể wrap key bằng user's session token để tăng bảo mật.
     */
    @GetMapping("/session-key")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getSessionKey() {
        return ResponseEntity.ok(Map.of("key", aesKey));
    }
}
```

---

## 8. Checklist triển khai

- [ ] **BE**: Generate AES-256 key, lưu vào environment variable `AES_ENCRYPTION_KEY`.
- [ ] **BE**: Implement `AesGcmEncryptionService`, inject vào các service/mapper hiện có.
- [ ] **BE**: Sửa DTO: thay `value` → `encryptedValue` (hoặc dùng custom Jackson serializer).
- [ ] **BE**: Bảo vệ endpoint `/api/session-key` bằng Spring Security (`@PreAuthorize`).
- [ ] **FE**: Implement `aesGcm.js` (Web Crypto API, không cần npm package).
- [ ] **FE**: Implement `decryptBusinessPlanItems.js`.
- [ ] **FE**: Gọi `fetchSessionKey` + `importKey` trong Redux thunk trước khi xử lý data.
- [ ] **FE**: Logic phân quyền ẩn/hiện: áp dụng sau khi decrypt, tại tầng selector hoặc component.
- [ ] **Security review**: Đảm bảo key không lộ trong bundle JS, không log ra console/server log.

---

## 9. Lưu ý bảo mật quan trọng

1. **Key rotation**: Định kỳ đổi key (mỗi session hoặc mỗi ngày). Dùng `sessionStorage` ở FE, không `localStorage`.
2. **HTTPS bắt buộc**: AES-GCM bảo vệ data at rest / in transit nhưng nếu dùng HTTP thì key bị lộ qua `/api/session-key`.
3. **Không log số liệu gốc**: Tắt logging cho các response chứa `encryptedValue`.
4. **IV không được tái sử dụng**: Code trên đã dùng `SecureRandom` mỗi lần encrypt — không dùng lại IV với cùng key.
5. **Phân quyền vẫn cần ở BE**: Mã hoá không thay thế phân quyền BE. BE vẫn kiểm tra user có quyền xem business plan đó không trước khi trả về data. Chỉ việc *ẩn số* (masking value) là chuyển sang FE.
