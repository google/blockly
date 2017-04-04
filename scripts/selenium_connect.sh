#!/bin/bash

#check if selenium is running, kill it if so
echo $PATH
pid=`lsof -ti tcp:4444`
if [ $? -eq 0 ]
then
 echo "selenium is running and process id is $pid"
  kill -9 $pid 
fi
which java  
java -jar -Dwebdriver.gecko.driver=../geckodriver -Dwebdriver.chrome.driver="chromedriver/chromedriver" ../webdriverio-test/selenium-server-standalone-3.0.1.jar &

ps -aef |grep selenium

lsof -ti tcp:4444
