#!/bin/bash
nodejs nodeless.js --skip-objects
nodejs images2base64.js nodeless_output
cp -r api_bak/* nodeless_output/api

