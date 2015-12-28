#!/bin/bash
node nodeless.js
node images2base64.js nodeless_output
rm -rf api_bak
cp -r nodeless_output/api api_bak
