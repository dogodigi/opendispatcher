#!/bin/bash
node nodeless.js --skip-objects
node images2base64.js nodeless_output
cp -r api_bak/* nodeless_output/api

