#!/bin/bash
if [ "${RUNNER_OS}" == "macOS" ]
  then
    brew cask install google-chrome
    sudo Xvfb :99 -ac -screen 0 1024x768x8 &
    npm run test:prepare > /dev/null &
fi
