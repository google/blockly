#!/bin/bash
os_name=`uname`
export SRC_DIR=`pwd`
echo "current dir is $SRC_DIR"
mkdir chromedriver
ls -l chromedriver
if [[ $os_name == 'Linux' ]]; then
  cd chromedriver  && curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip | tar xz
elif [[ $os_name == 'Darwin' ]]; then
  cd chromedriver  &&  curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip  | tar xz 
fi
echo "after getting and chromdriver dir is"
ls -l chromedriver
