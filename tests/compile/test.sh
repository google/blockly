echo Hello World.
# Test script for Travis.
cd tests/compile
java -jar $(npm root)/google-closure-compiler/compiler.jar --js='main.js' \
  --js='../../core/**.js' \
  --js='../../blocks/**.js' \
  --js='../../generators/**.js' \
  --js='../../msg/**.js' \
  --js='!../../msg/messages.js' \
  --js='../../../closure-library/closure/goog/**.js' \
  --js='../../../closure-library/third_party/closure/goog/**.js' \
  --generate_exports \
  --externs ../../externs/svg-externs.js \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --dependency_mode=STRICT --entry_point=Main \
  --js_output_file main_compressed.js
test -s main_compressed.js || exit 1
ls -lag
cd ../../
