# macOS

## Create certificate
Create a certificate as described here:
https://support.apple.com/kb/PH20131?locale=en_US&viewlocale=en_US

**Note:**

The name of the certificate needs to be the name of your machine. 
- In Terminal type `hostname` (without the .lan)

## Export and convert as described here
https://community.microstrategy.com/s/article/KB47483-How-to-convert-a-P12-certificate-and-key-file-into-a-PEM

**Note:**

Only follow steps till 2c (don't do step 2d) because we need two files and not a merged certificate

## Start server 

http-server -S -C [path/to/]cert.pem -K [path/to/]key-noenc.pem

```
-S or --ssl Enable https
-C or --cert Path to ssl cert file (default: cert.pem)
-K or --key Path to ssl key file (default: key.pem)
```