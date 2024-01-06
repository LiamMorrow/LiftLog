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

CryptoUtils.generateRsaKeyPair = async function () {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    )

    return {
        privateKey: new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.privateKey)),
        publicKey: new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey))
    }
}

CryptoUtils.encryptRsa = async function (data, publicKey) {
    const key = await crypto.subtle.importKey(
        "raw", publicKey,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["encrypt"]
    )

    return new Uint8Array(await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        key,
        data
    ))
}

CryptoUtils.decryptRsa = async function (data, privateKey) {
    const key = await crypto.subtle.importKey(
        "raw", privateKey,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        false,
        ["decrypt"]
    )

    return new Uint8Array(await crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        key,
        data
    ))
}
