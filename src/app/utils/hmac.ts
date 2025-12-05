import * as Crypto from 'crypto-js';
import stringify from 'json-stable-stringify';

export interface HMACPayload<T> {
    data: T;
    hmac: string;
}


function signwithHMAC(payload: object): string {
    console.log('Signing payload with HMAC:', stringify(payload));
    var secret = localStorage.getItem('hmacCode')
    var hashedSecret = Crypto.SHA256(secret || '').toString(Crypto.enc.Hex);
    var token = Crypto.HmacSHA256(stringify(payload) || '', hashedSecret || '').toString(Crypto.enc.Hex);
    return token;
}

function verifywithHMAC(payload: string, token: string): boolean {
    try {
        var secret = localStorage.getItem('hmacCode')
        var hashSecret = Crypto.SHA256(secret || '').toString(Crypto.enc.Hex);
        var decoded = Crypto.HmacSHA256(payload, hashSecret || '').toString(Crypto.enc.Hex);
        return decoded === token;
    } catch (err) {
        throw new Error('Invalid token');
    }
}

export {signwithHMAC, verifywithHMAC };