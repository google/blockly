#!/bin/bash
DIR="../webdriverio-test"
FILE=selenium-server-standalone-3.0.1.jar

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

echo "downloading selenium jar"

if [ ! -f $DIR/$FILE ]; then
  cd $DIR  && curl -O http://selenium-release.storage.googleapis.com/3.0/selenium-server-standalone-3.0.1.jar
  sleep 5
fi
