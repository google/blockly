  #!/bin/bash

printenv
export DISPLAY=:99.0
echo $RUNNER_OS
if [ "${RUNNER_OS}" == "Linux" ]; then ( tests/scripts/setup_linux_env.sh ) fi
if [ "${RUNNER_OS}" == "osx" ]; then ( tests/scripts/setup_osx_env.sh ) fi
sleep 2
