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

<<<<<<< HEAD
check_command scripts/get_geckdriver.sh
sleep 5
check_command scripts/get_selenium.sh 
sleep 5
check_command scripts/get_chromedriver.sh 
sleep 5
check_command scripts/selenium_connect.sh 
sleep 3
=======
check_command scripts/get_geckdriver.sh 
check_command scripts/get_selenium.sh 
check_command scripts/get_chromedriver.sh 
check_command scripts/selenium_connect.sh 
>>>>>>> 2f15566e... put pretest target to test_setup.sh
exit $EXIT_STATUS
