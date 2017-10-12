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

check_command tests/scripts/get_geckdriver.sh
sleep 5
check_command tests/scripts/get_selenium.sh
sleep 5
check_command tests/scripts/get_chromedriver.sh
sleep 10
check_command tests/scripts/selenium_connect.sh
sleep 10

exit $EXIT_STATUS
