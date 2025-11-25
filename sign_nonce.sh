#!/usr/bin/env bash

SK_FILE="sk.pem"
NONCE_BASE64="$1"

echo -n "$NONCE_BASE64" | base64 -d | openssl dgst -sha256 -sign "$SK_FILE" -out assinatura.bin
