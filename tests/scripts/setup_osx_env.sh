#!/bin/bash

if [ "${RUNNER_OS}" == "osx" ]
  then
    brew cask install google-chrome
    sudo Xvfb :99 -ac -screen 0 1024x768x8 &
    export CHROME_BIN="/Applications/Google Chrome.app"
    npm run test:prepare > /dev/null &
fi
