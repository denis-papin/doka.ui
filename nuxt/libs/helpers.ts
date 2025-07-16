export async function decodeCBOR(data: ArrayBuffer) {
    try {
        // Decode using cborg
        return await window.decode(new Uint8Array(data));
    } catch (err) {
        console.error('Failed to decode CBOR:', err);
        throw err;
    }
}
