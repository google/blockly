#!/bin/bash

if [ "${TRAVIS_OS_NAME}" == "linux" ]
  then
    export CHROME_BIN="/usr/bin/google-chrome"
    export DISPLAY=:99.0
    sh -e /etc/init.d/xvfb start &
    sudo sh -c 'echo 0 > /proc/sys/net/ipv6/conf/all/disable_ipv6';
fi
