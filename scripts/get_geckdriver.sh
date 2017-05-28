#!/bin/bash
os_name=`uname`
<<<<<<< HEAD
=======

if [ -f geckodriver ]; then
  exit 0
fi
echo "downloading gechdriver"

>>>>>>> 4c4cc7bb3b11d0a899730ae8135c0e9b01a5868c
if [[ $os_name == 'Linux' ]]; then
  cd ../ && curl -L https://github.com/mozilla/geckodriver/releases/download/v0.11.1/geckodriver-v0.11.1-linux64.tar.gz | tar xz
  sleep 5
elif [[ $os_name == 'Darwin' ]]; then
  cd ../ &&  curl -L https://github.com/mozilla/geckodriver/releases/download/v0.11.1/geckodriver-v0.11.1-macos.tar.gz | tar xz
  sleep 5
fi
