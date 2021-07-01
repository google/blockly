#!/bin/bash
  
if [ "${RUNNER_OS}" == "macOS" ]
  then
    export CHROME_BIN="/Applications/Google Chrome.app"
    npm run test:prepare > /dev/null &
fi
