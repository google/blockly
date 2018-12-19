#!/bin/bash
os_name=`uname`
chromedriver_dir="chromedriver"
if [ ! -d $chromedriver_dir ]; then
  mkdir $chromedriver_dir
fi

echo "downloading chromedriver"

if [[ $os_name == 'Linux' && ! -f $chromedriver_dir/chromedriver ]]; then
  cd chromedriver  && curl -L https://chromedriver.storage.googleapis.com/2.44/chromedriver_linux64.zip > tmp.zip &&  unzip -o tmp.zip && rm tmp.zip 
  # wait until download finish
  sleep 5
elif [[ $os_name == 'Darwin' && ! -f $chromedriver_dir/chromedriver ]]; then
  cd chromedriver  &&  curl -L https://chromedriver.storage.googleapis.com/2.44/chromedriver_mac64.zip  | tar xz 
  sleep 5
fi
