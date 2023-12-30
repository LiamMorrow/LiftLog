var CryptoUtils = {};
CryptoUtils.generateKey = async function () {
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

CryptoUtils.encrypt = async function (data, key, optionalIV) {
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
        encrypted,
        iv
    }
}

CryptoUtils.decrypt = async function (data, key, iv) {
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

    return decrypted
}
