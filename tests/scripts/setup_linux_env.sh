#!/bin/bash

echo "IN SETUP LINUX"
echo $RUNNER_OS
if [ "${RUNNER_OS}" == "Linux" ]
  then
    export CHROME_BIN="/usr/bin/google-chrome"
    sh -e /etc/init.d/xvfb start &
    npm run test:prepare > /dev/null &
fi
