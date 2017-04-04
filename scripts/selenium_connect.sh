#!/bin/bash
echo "connect to selenium server"
ls -l "../webdriverio-test/selenium-server-standalone-3.0.1.jar"
which java
java -version
java -jar -Dwebdriver.gecko.driver=../geckodriver ../webdriverio-test/selenium-server-standalone-3.0.1.jar &
