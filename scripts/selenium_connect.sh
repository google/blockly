#!/bin/bash
echo "connect to selenium server"
ls -l "../webdriverio-test/selenium-server-standalone-3.0.1.jar"
which java
java -version
/usr/local/google/home/shirleytan/opt/java/jdk1.8.0_74/bin/java -jar -Dwebdriver.gecko.driver=../geckodriver ../webdriverio-test/selenium-server-standalone-3.0.1.jar &
