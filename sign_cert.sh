#!/usr/bin/env bash

SK_FILE="sksign.pem"
INPUT_FILE="$1"

if [ -z "$INPUT_FILE" ]; then
    echo "Usage: $0 <json_file>"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found."
    exit 1
fi

# Gera o hash do ficheiro e assina o hash
openssl dgst -sha256 -sign "$SK_FILE" -out certiciado_assinado.bin "$INPUT_FILE"
