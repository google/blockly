#!/bin/bash

if [ "${RUNNER_OS}" == "Linux" ]
  then
    Xvfb :99 &
    export DISPLAY=:99 &
    npm run test:prepare > /dev/null &
fi
