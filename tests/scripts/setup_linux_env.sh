#!/bin/bash

if [ "${TRAVIS_OS_NAME}" == "linux" ]
  then
    export CHROME_BIN="/usr/bin/google-chrome"
    sh -e /etc/init.d/xvfb start &
    npm run test:prepare > /dev/null &
fi
