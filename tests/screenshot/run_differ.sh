#!/bin/bash

# TODO: set up selenium.
# preferably not by redownloading everything every time.
# For now, open a new terminal and run:
# tests/scripts/test_setup.sh
node tests/screenshot/gen_screenshots.js
clear
# TODO: check whether outputs/ folders exist, and make them if they don't
# For now, create:
# outputs
# - diff
# - old
# - new
#
# Inside the tests/screenshot folder.
./node_modules/.bin/mocha tests/screenshot/diff_screenshots.js --opts "./tests/screenshot/mocha.opts"

# To see results visually, open tests/screenshot/diff_viewer.html
