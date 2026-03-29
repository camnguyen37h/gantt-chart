/**
 * AES-256-GCM decryption using the browser's Web Crypto API.
 *
 * Encrypted format produced by BE:
 *   base64(IV_12bytes) + "." + base64(ciphertext + authTag_16bytes)
 *
 * The CryptoKey is imported once and cached to avoid per-call overhead.
 */

// TODO: replace with a secure key-delivery mechanism (e.g. /api/session-key)
// before moving to production. Do NOT commit real production keys here.
const HARDCODED_KEY_B64 = 'Q1L6zQfmdcQXzM4BwdQ9tEHTRzSWL1dfV6VZVj6MOl4='

const base64ToBytes = b64 =>
  Uint8Array.from(atob(b64), c => c.charCodeAt(0))

/** Cached CryptoKey — imported once per page load. */
let _keyPromise = null

const getKey = () => {
  if (!_keyPromise) {
    _keyPromise = crypto.subtle.importKey(
      'raw',
      base64ToBytes(HARDCODED_KEY_B64),
      { name: 'AES-GCM' },
      false,       // not extractable
      ['decrypt'],
    )
  }
  return _keyPromise
}

/**
 * Decrypt a single encrypted cell value.
 *
 * - `null` → returns `null` (preserve null semantics)
 * - non-string (already a number) → returned as-is
 * - encrypted string ("ivB64.cipherB64") → decrypted number
 * - any failure → returns `null` (graceful degradation)
 */
export const decryptValue = async encryptedValue => {
  if (encryptedValue == null) return null
  if (typeof encryptedValue !== 'string') return encryptedValue

  const dotIdx = encryptedValue.indexOf('.')
  if (dotIdx === -1) return null

  try {
    const key = await getKey()
    const iv = base64ToBytes(encryptedValue.slice(0, dotIdx))
    const ciphertext = base64ToBytes(encryptedValue.slice(dotIdx + 1))

    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    )

    const num = Number(new TextDecoder().decode(plainBuffer))
    return Number.isFinite(num) ? num : null
  } catch {
    return null
  }
}
