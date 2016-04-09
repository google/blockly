#!/bin/bash
#
# Compiles pertinent Closure library files.

java -Xmx1G -jar ../closure-compiler/build/compiler.jar \
  -O ADVANCED \
  --warning_level VERBOSE \
  --jscomp_error='*' \
  --jscomp_off=inferredConstCheck \
  --jscomp_off=extraRequire \
  --jscomp_off=unnecessaryCasts \
  --jscomp_off=deprecated \
  --jscomp_off=lintChecks \
  --jscomp_off=analyzerChecks \
  --js='**.js' \
  --js='!**_test.js' \
  --js='!**_perf.js' \
  --js='!**tester.js' \
  --js='!**promise/testsuiteadapter.js' \
  --js='!**osapi/osapi.js' \
  --js='!**svgpan/svgpan.js' \
  --js='!**alltests.js' \
  --js='!**node_modules**.js' \
  --js='!**protractor_spec.js' \
  --js='!**protractor.conf.js' \
  --js='!**browser_capabilities.js' \
  --js_output_file=$(mktemp);
