#!/bin/bash
os_name=`uname`
mkdir ../chromedriver
if [[ $os_name == 'Linux' ]]; then
  cd ../ && curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip | tar xz
elif [[ $os_name == 'Darwin' ]]; then
  cd ../chromedriver  &&  curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip  | tar xz 
fi
