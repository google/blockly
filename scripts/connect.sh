#!/bin/bash

#check if selenium server is up running
for p in `ps -ef |grep selenium | grep -v grep | awk '{print $2}'`; do
   echo "process is $p"
   kill -9 $p
done
echo "trying connect to selenium server"
java -jar -Dwebdriver.gecko.driver=../geckodriver -Dwebdriver.chrome.driver="chromedriver/chromedriver" ../webdriverio-test/selenium-server-standalone-3.0.1.jar & 

psid=`ps -ef | grep selenium | grep -v grep | awk '{print $2}'`
echo "started selenium server, and process  id is $psid"
