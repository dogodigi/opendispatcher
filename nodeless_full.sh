#!/bin/bash
nodejs nodeless.js 
rm -rf api_bak 
cp -r nodeless_output/api api_bak

