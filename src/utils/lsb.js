import CryptoJS from "crypto-js";
import { Buffer } from "buffer";

/* AES HELPERS */
export function encryptAES(message, key) {
  return CryptoJS.AES.encrypt(message, key).toString();
}
export function decryptAES(cipher, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

/* CRC32 */
function makeCRCTable() {
  let c;
  const tbl = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    tbl[n] = c >>> 0;
  }
  return tbl;
}
const crcTable = makeCRCTable();

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/* Remove data: prefix */
function stripPrefix(str) {
  if (!str) return "";
  const idx = str.indexOf("base64,");
  return idx >= 0 ? str.slice(idx + 7) : str;
}

/* Build tEXt chunk */
function buildTextChunk(keyword, text) {
  const keywordBuf = Buffer.from(keyword, "latin1");
  const textBuf = Buffer.from(text, "utf8");
  const zero = Buffer.from([0]);

  const data = Buffer.concat([keywordBuf, zero, textBuf]);
  const type = Buffer.from("tEXt", "ascii");

  const crcValue = crc32(Buffer.concat([type, data]));

  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcValue >>> 0, 0);

  return Buffer.concat([lenBuf, type, data, crcBuf]);
}

/* Locate the IEND chunk start */
function findIEND(buf) {
  const sig = Buffer.from("IEND", "ascii");
  for (let i = 8; i < buf.length - 4; i++) {
    if (buf.slice(i, i + 4).equals(sig)) {
      return i;
    }
  }
  return -1;
}

/* PUBLIC: ENCODE */
/* PUBLIC: ENCODE */
export function encodeEncryptedMessage(base64Image, message, key) {
  const encrypted = encryptAES(message, key);
  const base64 = stripPrefix(base64Image);
  const buf = Buffer.from(base64, "base64");

  // Validate PNG signature
  const sig = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if (!buf.slice(0, 8).equals(sig)) {
    throw new Error("Image is not PNG — convert to PNG first.");
  }

  // Locate IEND chunk TYPE index
  let idx = findIEND(buf);
  if (idx < 0) throw new Error("Invalid PNG (no IEND).");

  // IMPORTANT: move back 4 bytes to include length field
  idx -= 4;

  // Build the tEXt chunk
  const textChunk = buildTextChunk("stego", encrypted);

  // Insert the chunk before the IEND chunk
  const newBuf = Buffer.concat([
    buf.slice(0, idx),
    textChunk,
    buf.slice(idx)
  ]);

  return newBuf.toString("base64");
}


/* PUBLIC: DECODE */
export function decodeEncryptedMessage(base64Image, key) {
  const base64 = stripPrefix(base64Image);
  const buf = Buffer.from(base64, "base64");

  const sig = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);
  if (!buf.slice(0, 8).equals(sig)) {
    throw new Error("Not PNG — cannot decode.");
  }

  let offset = 8;
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString("ascii");
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;

    if (type === "tEXt") {
      const data = buf.slice(dataStart, dataEnd);
      const zeroIdx = data.indexOf(0);

      if (zeroIdx !== -1) {
        const keyword = data.slice(0, zeroIdx).toString("latin1");
        const text = data.slice(zeroIdx + 1).toString("utf8");

        if (keyword === "stego") {
          const plain = decryptAES(text, key);
          if (!plain) throw new Error("Wrong key or corrupt data.");
          return plain;
        }
      }
    }

    offset = dataEnd + 4;
  }

  throw new Error("No hidden message found.");
}


