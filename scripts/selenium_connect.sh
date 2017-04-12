#!/bin/bash

#check if selenium server is up running
pid=`lsof -ti tcp:4444`
if [ $? -eq 0 ]
then
 echo "already running"
  kill -9 $pid 
fi
echo "trying connect to selenium server"
java -jar -Dwebdriver.gecko.driver=../geckodriver -Dwebdriver.chrome.driver="chromedriver/chromedriver" ../webdriverio-test/selenium-server-standalone-3.0.1.jar  &

