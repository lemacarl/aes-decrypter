# [AES Decrypter](https://lemacarl.github.io/aes-decrypter/)

[AES Decrypter](https://lemacarl.github.io/aes-decrypter/) is a simple tool to decrypt files that have been encrypted with the [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) (Advanced Encryption Standard) which is used by the U.S. government.

Input files can either be Hexadecimal or Base 64 encode or plain text files. 

## How to use
- Upload a hex or base 64 or plain text encoded file
- Specify the input type
- Enter the Secret Key used to encrypt the file in `Password`
- Press `Decrypt`

## Gotchas
This tool will only encrypt files whose Secret Key and I.V. parameter key are equal and are encrypted with CBC mode.

## License

Apache 2.0  
Copyright 2015 Google Inc
