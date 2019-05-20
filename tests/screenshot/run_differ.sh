#!/bin/bash

# Runs screenshot diff tests.
#
# Copyright 2019 Google Inc.
# https://developers.google.com/blockly/
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.



# TODO: set up selenium.
# preferably not by redownloading everything every time.
# For now, open a new terminal and run:
# tests/scripts/test_setup.sh
node tests/screenshot/gen_screenshots.js
clear
./node_modules/.bin/mocha tests/screenshot/diff_screenshots.js --opts "./tests/screenshot/mocha.opts"

# Open results.
xdg-open 'tests/screenshot/diff_viewer.html'
