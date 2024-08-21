// SHA-256 hash length in bytes
const HashLengthBytes = 32;
const SignatureLengthBytes = 256;

const generateAesKey = async function (): Promise<AesKey> {
  const params: AesKeyGenParams = {
    name: "AES-CBC",
    length: 128,
  };
  const key = await crypto.subtle.generateKey(params, true, ["encrypt", "decrypt"]);

  return { value: new Uint8Array(await crypto.subtle.exportKey("raw", key)) };
};

const decryptAesCbcAndVerifyRsa256PssAsync = async function (
  data: AesEncryptedAndRsaSignedData,
  key: AesKey,
  publicKey: RsaPublicKey
): Promise<Uint8Array> {
  const params: AesCbcParams = {
    name: "AES-CBC",
    iv: data.iv.value,
  };
  const cryptoKey = await crypto.subtle.importKey("raw", key.value, params, false, ["decrypt"]);
  const decrypted = new Uint8Array(await crypto.subtle.decrypt(params, cryptoKey, data.encryptedPayload));

  const signature = decrypted.slice(decrypted.length - SignatureLengthBytes);
  const payload = decrypted.slice(0, decrypted.length - SignatureLengthBytes);

  const payloadHash = await crypto.subtle.digest("SHA-256", payload);

  const rsaParams: RsaHashedImportParams & RsaPssParams = {
    name: "RSA-PSS",
    hash: "SHA-256",
    saltLength: HashLengthBytes,
  };
  const rsaKey = await crypto.subtle.importKey("spki", publicKey.spkiPublicKeyBytes, rsaParams, false, ["verify"]);
  const verified = await crypto.subtle.verify(rsaParams, rsaKey, signature, payloadHash);

  if (!verified) {
    throw new Error("Signature verification failed");
  }

  return payload;
};

const signRsa256PssAndEncryptAesCbcAsync = async function (
  data: Uint8Array,
  key: AesKey,
  privateKey: RsaPrivateKey,
  aesIv: AesIV | null
): Promise<AesEncryptedAndRsaSignedData> {
  var iv = aesIv?.value ?? crypto.getRandomValues(new Uint8Array(16));
  const params: AesCbcParams = {
    name: "AES-CBC",
    iv,
  };
  const cryptoKey = await crypto.subtle.importKey("raw", key.value, params, false, ["encrypt"]);

  const rsaParams: RsaHashedImportParams & RsaPssParams = {
    name: "RSA-PSS",
    hash: "SHA-256",
    saltLength: HashLengthBytes,
  };
  const rsaKey = await crypto.subtle.importKey("pkcs8", privateKey.pkcs8PrivateKeyBytes, rsaParams, false, ["sign"]);

  const sha256Hash = await crypto.subtle.digest("SHA-256", data);

  const signature = await crypto.subtle.sign(rsaParams, rsaKey, sha256Hash);

  const payload = new Uint8Array([...data, ...new Uint8Array(signature)]);

  const encrypted = await crypto.subtle.encrypt(params, cryptoKey, payload);

  return {
    encryptedPayload: new Uint8Array(encrypted),
    iv: { value: iv },
  };
};

const generateRsaKeys = async function (): Promise<RsaKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    } satisfies RsaHashedKeyGenParams & RsaOaepParams & RsaKeyGenParams,
    true,
    ["encrypt", "decrypt"]
  );

  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);

  return {
    privateKey: { pkcs8PrivateKeyBytes: new Uint8Array(privateKey) },
    publicKey: { spkiPublicKeyBytes: new Uint8Array(publicKey) },
  };
};

const encryptRsaOaepSha256Async = async function (
  data: Uint8Array,
  publicKey: RsaPublicKey
): Promise<RsaEncryptedData> {
  const key = await crypto.subtle.importKey(
    "spki",
    publicKey.spkiPublicKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams & RsaOaepParams,
    true,
    ["encrypt"]
  );
  const chunkedData: Uint8Array[] = [];
  // RSA can only encrypt 122 bytes at a time
  for (let i = 0; i < data.length; i += 122) {
    chunkedData.push(data.slice(i, i + 122));
  }
  return {
    dataChunks: await Promise.all(
      chunkedData.map(async (chunk) => {
        return new Uint8Array(
          await crypto.subtle.encrypt(
            {
              name: "RSA-OAEP",
            },
            key,
            chunk
          )
        );
      })
    ),
  };
};

const decryptRsaOaepSha256Async = async function (
  data: RsaEncryptedData,
  privateKey: RsaPrivateKey
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKey.pkcs8PrivateKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams & RsaOaepParams,
    true,
    ["decrypt"]
  );
  const chunkedData: Uint8Array[] = [];
  for (let i = 0; i < data.dataChunks.length; i++) {
    chunkedData.push(data.dataChunks[i]);
  }
  const decryptedChunks = await Promise.all(
    chunkedData.map(async (chunk) => {
      return new Uint8Array(
        await crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
          },
          key,
          chunk
        )
      );
    })
  );
  return new Uint8Array(decryptedChunks.reduce((acc, chunk) => [...acc, ...chunk], [] as number[]));
};

const signRsaPssSha256Async = async function (data: Uint8Array, privateKey: RsaPrivateKey): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKey.pkcs8PrivateKeyBytes,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams,
    true,
    ["sign"]
  );
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(
    await crypto.subtle.sign(
      {
        name: "RSA-PSS",
        hash: "SHA-256",
        saltLength: HashLengthBytes,
      },
      key,
      hash
    )
  );
};

const verifyRsaPssSha256Async = async function (
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: RsaPublicKey
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "spki",
    publicKey.spkiPublicKeyBytes,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    } satisfies RsaHashedImportParams,
    true,
    ["verify"]
  );
  const hash = await crypto.subtle.digest("SHA-256", data);
  return crypto.subtle.verify(
    {
      name: "RSA-PSS",
      hash: "SHA-256",
      saltLength: HashLengthBytes,
    },
    key,
    signature,
    hash
  );
};

var CryptoUtils = {
  generateAesKey,
  signRsa256PssAndEncryptAesCbcAsync,
  decryptAesCbcAndVerifyRsa256PssAsync,
  generateRsaKeys,
  encryptRsaOaepSha256Async,
  decryptRsaOaepSha256Async,
  signRsaPssSha256Async,
  verifyRsaPssSha256Async,
};

interface RsaPublicKey {
  spkiPublicKeyBytes: Uint8Array;
}

interface AesKey {
  value: Uint8Array;
}

interface RsaPrivateKey {
  pkcs8PrivateKeyBytes: Uint8Array;
}

interface AesEncryptedAndRsaSignedData {
  encryptedPayload: Uint8Array;
  iv: AesIV;
}

interface RsaEncryptedData {
  dataChunks: Uint8Array[];
}

interface RsaKeyPair {
  publicKey: RsaPublicKey;
  privateKey: RsaPrivateKey;
}

interface AesIV {
  value: Uint8Array;
}
