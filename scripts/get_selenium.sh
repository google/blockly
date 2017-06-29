#!/bin/bash
DIR="../webdriverio-test"
FILE=selenium-server-standalone-3.0.1.jar

if [ ! -d $DIR ]; then
  mkdir $DIR
fi

<<<<<<< HEAD
=======
echo "downloading selenium jar"

>>>>>>> 4c4cc7bb3b11d0a899730ae8135c0e9b01a5868c
if [ ! -f $DIR/$FILE ]; then
  cd $DIR  && curl -O http://selenium-release.storage.googleapis.com/3.0/selenium-server-standalone-3.0.1.jar
  sleep 5
fi
