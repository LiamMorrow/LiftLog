// SHA-256 hash length in bytes
const HashLengthBytes = 32;

const generateAesKey = async function (): Promise<AesKey> {
  const params: AesKeyGenParams = {
    name: "AES-CBC",
    length: 128,
  };
  const key = await crypto.subtle.generateKey(params, true, ["encrypt", "decrypt"]);

  return { Value: new Uint8Array(await crypto.subtle.exportKey("raw", key)) };
};

const decryptAesCbcAndVerifyRsa256PssAsync = async function (
  data: AesEncryptedAndRsaSignedData,
  key: AesKey,
  publicKey: RsaPublicKey
): Promise<Uint8Array> {
  const params = {
    name: "AES-CBC",
    iv: data.IV,
  };
  const cryptoKey = await crypto.subtle.importKey("raw", key.Value, params, false, ["decrypt"]);
  const decrypted = new Uint8Array(await crypto.subtle.decrypt(params, cryptoKey, data.EncryptedPayload));

  const signature = decrypted.slice(decrypted.length - HashLengthBytes);
  const payload = decrypted.slice(0, decrypted.length - HashLengthBytes);

  const rsaParams: RsaPssParams = {
    name: "RSA-PSS",
    saltLength: HashLengthBytes,
  };
  const rsaKey = await crypto.subtle.importKey("spki", publicKey.SpkiPublicKeyBytes, rsaParams, false, ["verify"]);
  const verified = await crypto.subtle.verify(rsaParams, rsaKey, signature, payload);

  if (!verified) {
    throw new Error("Signature verification failed");
  }

  return payload;
};

const signRsa256PssAndEncryptAesCbcAsync = async function (
  data: Uint8Array,
  key: AesKey,
  privateKey: RsaPrivateKey,
  aesIv: AesIV | null,
  saltLength: number
): Promise<AesEncryptedAndRsaSignedData> {
  var iv = aesIv?.Value ?? crypto.getRandomValues(new Uint8Array(16));
  const params: AesCbcParams = {
    name: "AES-CBC",
    iv,
  };
  const cryptoKey = await crypto.subtle.importKey("raw", key.Value, params, false, ["encrypt"]);

  const rsaParams: RsaPssParams = {
    name: "RSA-PSS",
    saltLength,
  };
  const rsaKey = await crypto.subtle.importKey("pkcs8", privateKey.Pkcs8PrivateKeyBytes, rsaParams, false, ["sign"]);
  const signature = await crypto.subtle.sign(rsaParams, rsaKey, data);

  const payload = new Uint8Array([...data, ...new Uint8Array(signature)]);

  const encrypted = await crypto.subtle.encrypt(params, cryptoKey, payload);

  return {
    EncryptedPayload: new Uint8Array(encrypted),
    IV: { Value: iv },
  };
};

const generateRsaKeys = async function (): Promise<RsaKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);

  return {
    PrivateKey: { Pkcs8PrivateKeyBytes: new Uint8Array(privateKey) },
    PublicKey: { SpkiPublicKeyBytes: new Uint8Array(publicKey) },
  };
};

const encryptRsaOaepSha256Async = async function (
  data: Uint8Array,
  publicKey: RsaPublicKey
): Promise<RsaEncryptedData> {
  const key = await crypto.subtle.importKey(
    "spki",
    publicKey.SpkiPublicKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
  const chunkedData: Uint8Array[] = [];
  // RSA can only encrypt 122 bytes at a time
  for (let i = 0; i < data.length; i += 122) {
    chunkedData.push(data.slice(i, i + 122));
  }
  return {
    DataChunks: await Promise.all(
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
    privateKey.Pkcs8PrivateKeyBytes,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
  const chunkedData: Uint8Array[] = [];
  for (let i = 0; i < data.DataChunks.length; i++) {
    chunkedData.push(data.DataChunks[i]);
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

var CryptoUtils = {
  generateAesKey,
  signRsa256PssAndEncryptAesCbcAsync,
  decryptAesCbcAndVerifyRsa256PssAsync,
  generateRsaKeys,
  encryptRsaOaepSha256Async,
  decryptRsaOaepSha256Async,
};

interface RsaPublicKey {
  SpkiPublicKeyBytes: Uint8Array;
}

interface AesKey {
  Value: Uint8Array;
}

interface RsaPrivateKey {
  Pkcs8PrivateKeyBytes: Uint8Array;
}

interface AesEncryptedAndRsaSignedData {
  EncryptedPayload: Uint8Array;
  IV: AesIV;
}

interface RsaEncryptedData {
  DataChunks: Uint8Array[];
}

interface RsaKeyPair {
  PublicKey: RsaPublicKey;
  PrivateKey: RsaPrivateKey;
}

interface AesIV {
  Value: Uint8Array;
}
