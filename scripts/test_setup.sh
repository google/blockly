#!/bin/bash

EXIT_STATUS=0

function check_command {
    "$@"
    local STATUS=$?
    if [ $STATUS -ne 0 ]; then
      echo "error with $1 ($STATUS)" >&2
      EXIT_STATUS=$STATUS
      fi
   }

check_command scripts/get_geckdriver.sh
sleep 5
check_command scripts/get_selenium.sh 
sleep 5
check_command scripts/get_chromedriver.sh 
<<<<<<< HEAD
sleep 5
check_command scripts/selenium_connect.sh 
sleep 3
=======
sleep 10
check_command scripts/selenium_connect.sh 
sleep 10

>>>>>>> 4c4cc7bb3b11d0a899730ae8135c0e9b01a5868c
exit $EXIT_STATUS
