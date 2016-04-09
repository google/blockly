#!/bin/bash

set -x

# Invoke protractor to run tests.
./node_modules/.bin/protractor protractor.conf.js
