#!/bin/bash
echo "Executing compile.sh from $(pwd)"

# Find the Blockly project root if pwd is the root
# or if pwd is the directory containing this script.
if [ -f ./main.js ] && [ -f ./compile.sh ]; then
  BLOCKLY_ROOT="../.."
elif [ -f tests/compile/compile.sh ]; then
  BLOCKLY_ROOT="."
else
  echo "ERROR: Cannot determine BLOCKLY_ROOT" 1>&2;
  exit 1
fi

# Test for npm and node_modules directory.
if command -v npm >/dev/null 2>&1; then
  NODE_MODULES=$(npm root)
  # npm root will invent a location based on pwd if it can't find
  # one, such as when the project has not been `npm install`ed.
  # Clear the variable if the directory doesn't already exist.
  [[ ! -d $NODE_MODULES ]] && NODE_MODULES=""
fi

# Find the Closure Compiler.
if [ -n $NODE_MODULES ] && \
  [ -s $NODE_MODULES/google-closure-compiler-java/compiler.jar ]; then
  COMPILER=$NODE_MODULES/google-closure-compiler-java/compiler.jar
  echo "Found npm google-closure-compiler:"
  echo "  $COMPILER"
  npm list google-closure-compiler | grep google-closure-compiler
else
  COMPILER_JARS=$(find $BLOCKLY_ROOT/tests/compile/ -maxdepth 1 -name "*compiler*.jar")
  if [ -n "$COMPILER_JARS" ]; then
    if [ $(echo "$COMPILER_JARS" | wc -l) -ne 1 ]; then
      echo "ERROR: Found too many Closure *compiler*.jar files:" 1>&2;
      echo "$COMPILER_JARS" 1>&2;
      exit 1
    fi
    COMPILER=$COMPILER_JARS
    echo "Found local Closure compiler .jar:"
    echo "  $COMPILER"
  else
    echo "ERROR: Closure Compiler not found." 1>&2;
    echo "Either npm install google-closure-compiler" 1>&2;
    echo "Or download from this URL, and place jar file in current directory." 1>&2;
    echo "https://dl.google.com/closure-compiler/compiler-latest.zip" 1>&2;
    exit 1
  fi
fi

if [ -f "$BLOCKLY_ROOT/tests/compile/main_compressed.js" ]; then
  echo "Removing previous output."
  rm "$BLOCKLY_ROOT/tests/compile/main_compressed.js"
fi

tempPath="$BLOCKLY_ROOT/temp_core"
corePath="$BLOCKLY_ROOT/core/*"
mkdir $tempPath
cp $corePath $tempPath
cp "$BLOCKLY_ROOT/tests/compile/test_blocks.js" "$tempPath/test_blocks.js"
# Copy over all files in core and any subdirectories to the temp_core directory.
for dir in "$corePath/" ; do
  # For all files in the directory and any subdirectories rename them to
  # include the subirectory name and copy them to temporary directory.
  # Ex: subdir/file.js -> temp_core/subdir_file.js
  for file in $(find $dir -name \*.js); do
    # Replace all / with _ and remove core
    newName="${file//\//_}"
    newName="${newName//._core_/}"
    newFilePath="$tempPath/$newName"
    cp $file $newFilePath
  done
done

echo "Compiling Blockly..."
COMPILATION_COMMAND="java -jar $COMPILER --js='$BLOCKLY_ROOT/tests/compile/main.js' \
  --js='$tempPath/**.js' \
  --js='$BLOCKLY_ROOT/tests/blocks/**.js' \
  --js='$BLOCKLY_ROOT/blocks/**.js' \
  --js='$BLOCKLY_ROOT/generators/**.js' \
  --generate_exports \
  --externs $BLOCKLY_ROOT/externs/goog-externs.js \
  --externs $BLOCKLY_ROOT/externs/svg-externs.js \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --language_in ECMASCRIPT5_STRICT \
  --language_out ECMASCRIPT5_STRICT \
  --dependency_mode=PRUNE --entry_point=Main \
  --js_output_file $BLOCKLY_ROOT/tests/compile/main_compressed.js"
echo "$COMPILATION_COMMAND"
$COMPILATION_COMMAND
EXIT_CODE=$?
echo "Compiler exit code: $EXIT_CODE"
if [ "$EXIT_CODE" -eq 0 ] && [ -s "$BLOCKLY_ROOT/tests/compile/main_compressed.js" ]; then
  echo "Compilation SUCCESS."
else
  echo "Compilation FAIL."
  exit 1
fi

# Cleanup temp_core directory
rm -r $tempPath
