echo Hello World.
java -jar $(npm root)/google-closure-compiler/compiler.jar --js='main.js' \
  --js='../../**.js' \
  --js='!../../externs/**.js' \
  --js='!../../msg/messages.js' \
  --js='../../../closure-library/closure/goog/**.js' \
  --js='../../../closure-library/third_party/closure/goog/**.js' \
  --generate_exports \
  --externs ../../externs/svg-externs.js \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --dependency_mode=STRICT --entry_point=Main \
  --js_output_file main_compressed.js
ls -lag
