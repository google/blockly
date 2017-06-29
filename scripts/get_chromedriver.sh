#!/bin/bash
os_name=`uname`
chromedriver_dir="chromedriver"
if [ ! -d $chromedriver_dir ]; then
  mkdir $chromedriver_dir
fi

<<<<<<< HEAD
if [[ $os_name == 'Linux' ]]; then
  cd chromedriver  && curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip > tmp.zip &&  unzip -o tmp.zip && rm tmp.zip
  # wait until download finish
  sleep 5
elif [[ $os_name == 'Darwin' ]]; then
  cd chromedriver  &&  curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip  | tar xz
  # wait until download finish
=======
echo "downloading chromedriver"

if [[ $os_name == 'Linux' && ! -f $chromedriver_dir/chromedriver ]]; then
  cd chromedriver  && curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_linux64.zip > tmp.zip &&  unzip -o tmp.zip && rm tmp.zip 
  # wait until download finish
  sleep 5
elif [[ $os_name == 'Darwin' && ! -f $chromedriver_dir/chromedriver ]]; then
  cd chromedriver  &&  curl -L https://chromedriver.storage.googleapis.com/2.29/chromedriver_mac64.zip  | tar xz 
>>>>>>> 4c4cc7bb3b11d0a899730ae8135c0e9b01a5868c
  sleep 5
fi
