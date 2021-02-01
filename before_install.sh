  #!/bin/bash

printenv
export DISPLAY=:99.0
echo $proces
if [ "${RUNNER_OS}" == "linux" ]; then ( tests/scripts/setup_linux_env.sh ) fi
if [ "${RUNNER_OS}" == "osx" ]; then ( tests/scripts/setup_osx_env.sh ) fi
sleep 2
