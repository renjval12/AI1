// app/lib/pii.js
import crypto from "node:crypto"

// Envelope encryption: every user gets their own data key, and the master key wraps it.
// In production, replace the master-key wrap with KMS Encrypt/Decrypt so the master key never leaves KMS.
const masterKey = () => Buffer.from(process.env.PII_MASTER_KEY ?? "", "base64") // 32 bytes

// Output is iv + ciphertext + tag, matching the dobEncrypted column
function seal(key, plaintext) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()])
}

function open(key, sealed) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, sealed.subarray(0, 12))
  decipher.setAuthTag(sealed.subarray(-16))
  return Buffer.concat([decipher.update(sealed.subarray(12, -16)), decipher.final()])
}

export function encryptPii(plaintext) {
  const dataKey = crypto.randomBytes(32)
  return {
    encrypted: seal(dataKey, Buffer.from(plaintext, "utf8")),
    wrappedKey: seal(masterKey(), dataKey),
  }
}

export function decryptPii(encrypted, wrappedKey) {
  const dataKey = open(masterKey(), Buffer.from(wrappedKey))
  return open(dataKey, Buffer.from(encrypted)).toString("utf8")
}
