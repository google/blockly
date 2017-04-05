#!/bin/bash

#check if selenium is running, kill it if so
pid=`lsof -ti tcp:4444`
if [ $? -eq 0 ]
then
  kill -9 $pid 
fi
java -jar -Dwebdriver.gecko.driver=../geckodriver -Dwebdriver.chrome.driver="chromedriver/chromedriver" ../webdriverio-test/selenium-server-standalone-3.0.1.jar -log test_run.txt &

