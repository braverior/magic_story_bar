// 简单的混淆逻辑，将密码分散在多个部分
const _0x1a2b = ['M', 'a', 'g', 'i', 'c'];
const _0x3c4d = [83, 116, 111, 114, 121]; // "Story" ASCII codes
const _0x5e6f = 'B' + 'a' + 'r';
const _0x7g8h = 2024;

// 动态还原应用密钥
function getAppSecret() {
  const part1 = _0x1a2b.join('');
  const part2 = String.fromCharCode(..._0x3c4d);
  const part3 = _0x5e6f;
  const part4 = _0x7g8h.toString();
  // 组合成 "MagicStoryBar2024"
  return part1 + "_" + 
    part2.split('').reverse().join('') + "@" + // 稍微反转一下增加混淆
    part3 + "$" + 
    part4;
}

// 将字符串转换为 Uint8Array
const enc = new TextEncoder();
const dec = new TextDecoder();

// 从密码派生密钥 (PBKDF2)
async function getKey(password, salt) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 加密函数
export async function encryptData(data) {
  try {
    const password = getAppSecret();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const key = await getKey(password, salt);
    
    const content = JSON.stringify(data);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(content)
    );

    // 将 salt + iv + 密文 组合在一起并转为 Base64
    // 格式: salt(16) + iv(12) + ciphertext
    const buffer = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.length);
    buffer.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // 转 Base64 方便存储文件
    return btoa(String.fromCharCode(...buffer));
  } catch (e) {
    console.error("Encryption failed:", e);
    throw new Error("加密失败");
  }
}

// 解密函数
export async function decryptData(base64Data) {
  try {
    const password = getAppSecret();
    
    // Base64 转 Uint8Array
    const binaryString = atob(base64Data);
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }

    // 提取 salt, iv, 密文
    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);

    const key = await getKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return JSON.parse(dec.decode(decrypted));
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error("解密失败或文件已损坏");
  }
}
