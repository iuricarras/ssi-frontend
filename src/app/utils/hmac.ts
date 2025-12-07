import * as Crypto from 'crypto-js';
import stringify from 'json-stable-stringify';


/* HMACPayload<T>
 * Interface que representa um payload assinado com HMAC.
 * data: objeto de dados original.
 * hmac: assinatura HMAC gerada a partir do conteúdo.
 */
export interface HMACPayload<T> {
    data: T;
    hmac: string;
}


/**
 * signwithHMAC(payload)
 * Gera uma assinatura HMAC para um payload.
 * Serializa o objeto de forma determinística (json-stable-stringify).
 * Obtém o segredo armazenado em localStorage (hmacCode).
 * Aplica SHA256 ao segredo para derivar uma chave.
 * Usa HmacSHA256 para assinar o payload com a chave derivada.
 * Retorna a assinatura em formato hexadecimal.
 *
 * Fluxo:
 * 1. stringify(payload)
 * 2. SHA256(secret)
 * 3. HmacSHA256(payload, hashedSecret)
 * 4. toString(Hex)
 */
function signwithHMAC(payload: object): string {
    console.log('Signing payload with HMAC:', stringify(payload));
    var secret = localStorage.getItem('hmacCode')
    var hashedSecret = Crypto.SHA256(secret || '').toString(Crypto.enc.Hex);
    var token = Crypto.HmacSHA256(stringify(payload) || '', hashedSecret || '').toString(Crypto.enc.Hex);
    return token;
}


/**
 * verifywithHMAC(payload, token)
 * Verifica se um payload corresponde a uma assinatura HMAC fornecida.
 * Recebe o payload como string e token esperado.
 * Obtém o segredo armazenado em localStorage (hmacCode).
 * Deriva a chave com SHA256(secret).
 * Recalcula HmacSHA256(payload, hashSecret).
 * Compara o resultado com o token fornecido.
 * Retorna true se a assinatura for válida, false caso contrário.
 *
 * Fluxo:
 * 1. SHA256(secret)
 * 2. HmacSHA256(payload, hashSecret)
 * 3. Comparar com token
 */
function verifywithHMAC(payload: string, token: string): boolean {
    try {
        console.log('Verifying payload with HMAC:', payload, token);
        
        var secret = localStorage.getItem('hmacCode')
        var hashSecret = Crypto.SHA256(secret || '').toString(Crypto.enc.Hex);
        var decoded = Crypto.HmacSHA256(payload, hashSecret || '').toString(Crypto.enc.Hex);
        console.log('Decoded HMAC:', decoded);
        return decoded === token;
    } catch (err) {
        throw new Error('Invalid token');
    }
}

export {signwithHMAC, verifywithHMAC };