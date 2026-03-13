function hexToUint8Array(hex) {
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return arr;
}

let cryptoKey = null;

export async function verifySignature(request, publicKey) {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();

    if (!signature || !timestamp || !publicKey) return { isValid: false, body };

    try {
        if (!cryptoKey) {
            const keyBuffer = hexToUint8Array(publicKey);
            cryptoKey = await crypto.subtle.importKey(
                'raw', keyBuffer, { name: 'Ed25519', namedCurve: 'Ed25519' }, true, ['verify']
            );
        }

        const encoder = new TextEncoder();
        const data = encoder.encode(timestamp + body);
        const sigBuffer = hexToUint8Array(signature);

        const isValid = await crypto.subtle.verify({ name: 'Ed25519' }, cryptoKey, sigBuffer, data);
        return { isValid, body };
    } catch (e) {
        return { isValid: false, body };
    }
}
