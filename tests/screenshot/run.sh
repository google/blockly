#!/bin/bash

# tests/scripts/test_setup.sh
node tests/screenshot/sandbox.js
clear
./node_modules/.bin/mocha tests/screenshot/test_script.js --opts "./tests/screenshot/mocha.opts"
