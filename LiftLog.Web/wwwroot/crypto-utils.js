var CryptoUtils = {};
CryptoUtils.generateAesKey = async function () {
    /**
     * @type {AesKeyGenParams}
     */
    const params = {
        name: "AES-CBC",
        length: 128
    }
    const key = await crypto.subtle.generateKey(
        params, true, ["encrypt", "decrypt"]
    )

    return new Uint8Array(await crypto.subtle.exportKey("raw", key))
};

CryptoUtils.encryptAes = async function (data, key, optionalIV) {
    const iv = optionalIV || crypto.getRandomValues(new Uint8Array(16))
    const params = {
        name: "AES-CBC",
        iv
    }
    const cryptoKey = await crypto.subtle.importKey(
        "raw", key, params, false, ["encrypt"]
    )
    const encrypted = await crypto.subtle.encrypt(
        params, cryptoKey, data
    )

    return {
        encrypted: new Uint8Array(encrypted),
        iv
    }
}

CryptoUtils.decryptAes = async function (data, key, iv) {
    const params = {
        name: "AES-CBC",
        iv
    }
    const cryptoKey = await crypto.subtle.importKey(
        "raw", key, params, false, ["decrypt"]
    )
    const decrypted = await crypto.subtle.decrypt(
        params, cryptoKey, data
    )

    return new Uint8Array(decrypted)
}

CryptoUtils.generateRsaKeys = async function () {
    const keyPair = await crypto.subtle
        .generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"],
        )

    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey)

    return {
        privateKey: new Uint8Array(privateKey),
        publicKey: new Uint8Array(publicKey)
    }
}

/**
 * @param {Uint8Array} data
 * @param {Uint8Array} publicKey
 */
CryptoUtils.encryptRsa = async function (data, publicKey) {
    const key = await crypto.subtle.importKey(
        "spki",
        publicKey,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"],
    );
    const chunkedData = [];
    // RSA can only encrypt 245 bytes at a time
    for (let i = 0; i < data.length; i += 245) {
        chunkedData.push(data.slice(i, i + 245))
    }
    return Promise.all(chunkedData.map(async chunk => {
        return new Uint8Array(await crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            key,
            chunk
        ))
    }))
}

/**
 * @param {Uint8Array[]} dataChunks
 */
CryptoUtils.decryptRsa = async function (dataChunks, privateKey) {
    const key = await crypto.subtle.importKey(
        "pkcs8", privateKey,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["decrypt"]
    )

    // decrypt one chunk at a time
    const data = await Promise.all(dataChunks.map(async chunk => {
        return new Uint8Array(await crypto.subtle.decrypt(
            {
                name: "RSA-OAEP"
            },
            key,
            chunk
        ))
    }))

    return new Uint8Array(data.reduce((acc, chunk) => {
        acc.push(...chunk)
        return acc
    }, []))
}
