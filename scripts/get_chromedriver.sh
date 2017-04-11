#!/bin/bash
os_name=`uname`
chromedriver_dir="chromedriver"
if [ ! -d $chromedriver_dir ]; then
  mkdir $chromedriver_dir 
fi

if [[ $os_name == 'Linux' ]]; then
  cd chromedriver  && curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip > tmp.zip &&  unzip -o tmp.zip && rm tmp.zip 
elif [[ $os_name == 'Darwin' ]]; then
  cd chromedriver  &&  curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip  | tar xz 
fi
