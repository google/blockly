#!/bin/bash

if [ "${RUNNER_OS}" == "Linux" ]
  then
    sh -e /etc/init.d/xvfb start &
    npm run test:prepare > /dev/null &
fi
