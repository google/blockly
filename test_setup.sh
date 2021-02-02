if [ "${RUNNER_OS}" == "Linux" ]; then ( tests/scripts/setup_linux_env.sh ) fi
if [ "${RUNNER_OS}" == "macOS" ]; then ( tests/scripts/setup_osx_env.sh ) fi
sleep 2
