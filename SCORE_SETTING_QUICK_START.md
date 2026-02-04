# 🚀 Quick Start Guide - Score Setting

## ⚡ Sử dụng ngay (5 phút)

### Bước 1: Thêm vào App.js

```jsx
// src/App.js
import React from 'react';
import ScoreSetting from './pages/ScoreSetting';
import './App.css';

function App() {
  return (
    <div className="App">
      <ScoreSetting />
    </div>
  );
}

export default App;
```

### Bước 2: Chạy ứng dụng

```bash
npm start
```

### Bước 3: Test các tính năng

✅ **Test Pagination:**
- Nhìn thấy 5 roles đầu tiên
- Click nút "Next" để xem thêm
- Click số trang để nhảy trực tiếp

✅ **Test Collapse/Expand:**
- Click vào "PM" để expand
- Click vào "QA" để expand role khác
- Click lại để collapse

✅ **Test Add Row:**
- Expand một role
- Click "+ Thêm dòng"
- Nhập thông tin vào row mới

✅ **Test Delete Row:**
- Click icon 🗑️ để xóa một row
- Thử xóa row "N/A" → Không được phép
- Thử xóa row cuối cùng → Không được phép

✅ **Test Validation:**

**Test 1: Empty fields**
```
1. Expand PM
2. Click "+ Thêm dòng"
3. Để trống, click "Save"
4. ✅ Thấy lỗi "là bắt buộc!" cho tất cả fields
```

**Test 2: Duplicate score**
```
1. Expand QA
2. Thay đổi "Junior" thành "N/A"
3. Click "Save"
4. ✅ Thấy lỗi "bị trùng lặp!"
```

**Test 3: Length validation**
```
1. Expand Developer
2. Nhập Score > 20 ký tự
3. Click "Save"
4. ✅ Thấy lỗi "không được vượt quá 20 ký tự!"
```

**Test 4: Definition too short**
```
1. Expand Tester
2. Nhập Definition < 10 ký tự
3. Click "Save"
4. ✅ Thấy lỗi "phải có ít nhất 10 ký tự!"
```

**Test 5: Remove N/A**
```
1. Expand Test Lead
2. Xóa tất cả rows trừ 1
3. Xóa row cuối (không phải N/A)
4. Click "Save"
5. ✅ Thấy lỗi "Bắt buộc phải có một bản ghi với Score là 'N/A'!"
```

✅ **Test Save Successfully:**
```
1. Expand Business Analyst
2. Thêm một row mới
3. Điền đầy đủ:
   - Score: "Expert BA"
   - Base Score: 3
   - Status: Check
   - Definition: "Điểm 3 đáng nghĩa với việc có nhiều năm kinh nghiệm phân tích"
4. Click "Save"
5. ✅ Thấy "Lưu thành công!"
```

---

## 🎯 Các tình huống sử dụng

### Tình huống 1: Thêm level mới cho role

```
Yêu cầu: Thêm level "Expert" cho Developer

Các bước:
1. Expand "Developer"
2. Click "+ Thêm dòng"
3. Điền:
   - Score: Expert
   - Base Score: 5
   - Status: ✓
   - Definition: Điểm 5 đáng nghĩa với việc có hơn 10 năm kinh nghiệm
4. Click "Save"
```

### Tình huống 2: Sửa định nghĩa của level

```
Yêu cầu: Cập nhật định nghĩa cho "Senior" của QA

Các bước:
1. Expand "QA"
2. Tìm row "Senior"
3. Sửa nội dung ở cột "Định nghĩa"
4. Click "Save"
```

### Tình huống 3: Vô hiệu hóa một level

```
Yêu cầu: Tạm thời disable "Intern" của Developer

Các bước:
1. Expand "Developer"
2. Tìm row "Intern"
3. Bỏ check ở cột "Status"
4. Click "Save"
```

### Tình huống 4: Xóa level không còn dùng

```
Yêu cầu: Xóa "Manual Tester" khỏi role Tester

Các bước:
1. Expand "Tester"
2. Tìm row "Manual Tester"
3. Click icon 🗑️
4. Click "Save"
```

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "Score là bắt buộc!"
**Nguyên nhân:** Để trống trường Score  
**Giải pháp:** Nhập tên cho Score (vd: L1, Junior, Senior...)

### Lỗi: "Score bị trùng lặp!"
**Nguyên nhân:** Có 2 rows với Score giống nhau  
**Giải pháp:** Đổi tên một trong hai scores

### Lỗi: "Định nghĩa phải có ít nhất 10 ký tự!"
**Nguyên nhân:** Định nghĩa quá ngắn  
**Giải pháp:** Viết mô tả chi tiết hơn

### Lỗi: "Bắt buộc phải có một bản ghi với Score là 'N/A'!"
**Nguyên nhân:** Không có row N/A  
**Giải pháp:** Thêm lại row N/A hoặc đổi tên một row thành N/A

### Lỗi: Không thể xóa row
**Nguyên nhân 1:** Row là N/A (protected)  
**Nguyên nhân 2:** Chỉ còn 1 row  
**Giải pháp:** Thêm row mới trước khi xóa

---

## 🎨 Tùy chỉnh giao diện

### Thay đổi màu sắc

**File: src/components/ScoreForm/ScoreForm.css**

```css
/* Màu nút Add */
.btn-add-row {
  background: #4caf50;  /* Đổi màu tại đây */
}

/* Màu nút Save */
.btn-save {
  background: #2196f3;  /* Đổi màu tại đây */
}

/* Màu lỗi */
.error-message {
  color: #f44336;  /* Đổi màu tại đây */
}
```

### Thay đổi số items per page

**File: src/pages/ScoreSetting.jsx**

```javascript
// Dòng 6
const ITEMS_PER_PAGE = 5;  // Đổi số này (vd: 10, 15, 20)
```

### Thay đổi validation rules

**File: src/utils/scoreValidation.js**

```javascript
export const VALIDATION_RULES = {
  SCORE_MAX_LENGTH: 20,          // Tăng/giảm max length
  DEFINITION_MAX_LENGTH: 500,    // Tăng/giảm max length
  DEFINITION_MIN_LENGTH: 10,     // Tăng/giảm min length
  REQUIRED_SCORE: 'N/A'          // Đổi score bắt buộc
};
```

---

## 📱 Responsive Design

### Desktop (> 768px)
- Table đầy đủ với tất cả columns
- Pagination hiển thị ngang
- Hover effects

### Tablet/Mobile (≤ 768px)
- Table có horizontal scroll
- Columns có min-width
- Touch-friendly buttons

---

## 🔄 Tích hợp với Backend API

### Bước 1: Tạo API Service

**File: src/api/scoreSettingService.js**

```javascript
import axios from 'axios';

const API_URL = 'http://your-api.com/api';

export const fetchRolesWithScores = async () => {
  const response = await axios.get(`${API_URL}/roles/scores`);
  return response.data;
};

export const saveRoleScores = async (roleId, scores) => {
  const response = await axios.put(
    `${API_URL}/roles/${roleId}/scores`, 
    { scores }
  );
  return response.data;
};
```

### Bước 2: Thay đổi import

**File: src/pages/ScoreSetting.jsx**

```javascript
// Thay dòng 3:
// import { fetchRolesWithScores } from '../utils/scoreSettingApi';

// Thành:
import { fetchRolesWithScores } from '../api/scoreSettingService';
```

### Bước 3: Test với Postman

**GET /api/roles/scores**
```json
[
  {
    "id": 1,
    "name": "PM",
    "scores": [
      {
        "id": 1,
        "score": "N/A",
        "baseScore": 0,
        "status": true,
        "definition": "..."
      }
    ]
  }
]
```

**PUT /api/roles/:roleId/scores**
```json
{
  "scores": [
    {
      "id": 1,
      "score": "N/A",
      "baseScore": 0,
      "status": true,
      "definition": "..."
    }
  ]
}
```

---

## 📊 Kiểm tra hoàn thành

```
✅ Component hiển thị đúng
✅ Pagination hoạt động
✅ Collapse/Expand hoạt động
✅ Add row hoạt động
✅ Delete row hoạt động
✅ Validation hoạt động
✅ Save hiển thị thông báo
✅ UI responsive
✅ Không có errors trong console
✅ Mock data hiển thị đúng
```

---

## 💡 Tips & Tricks

1. **Performance:** Chỉ expand 1-2 roles cùng lúc
2. **Validation:** Luôn kiểm tra có N/A trước khi save
3. **UX:** Đọc error messages để biết cách fix
4. **Testing:** Test trên Chrome DevTools Mobile mode
5. **Debugging:** Mở Console để xem logs khi save

---

## 🆘 Cần hỗ trợ?

📖 Đọc tài liệu chi tiết:
- SCORE_SETTING_README.md
- SCORE_SETTING_INTEGRATION_EXAMPLES.js
- SCORE_SETTING_VISUAL_GUIDE.md

🧪 Chạy demo:
- SCORE_SETTING_DEMO.js

✅ Tất cả đã sẵn sàng để sử dụng!
