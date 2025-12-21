import CryptoJS from "crypto-js";

export function encryptAES(plainText, key) {
  if (!key || key.trim() === "") {
    throw new Error("AES key is required");
  }
  return CryptoJS.AES.encrypt(plainText, key).toString();
}

export function decryptAES(cipherText, key) {
  if (!key || key.trim() === "") {
    throw new Error("AES key is required");
  }

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return text || ""; // empty if wrong key
  } catch (e) {
    return "";
  }
}
