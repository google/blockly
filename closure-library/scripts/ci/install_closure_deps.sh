#!/bin/bash
#
# Script to install all necessary dependencies for running Closure tests,
# linting, formatting and compiling.

declare -r CLANG_VERSION="3.7.1"
declare -r CLANG_BUILD="clang+llvm-${CLANG_VERSION}-x86_64-linux-gnu-ubuntu-14.04"
declare -r CLANG_TAR="${CLANG_BUILD}.tar.xz"
declare -r CLANG_URL="http://llvm.org/releases/${CLANG_VERSION}/${CLANG_TAR}"

set -ex

cd ..

# Install clang-format.
wget --quiet $CLANG_URL
tar xf $CLANG_TAR
mv $CLANG_BUILD clang
rm -f $CLANG_TAR

# Install closure compiler and linter.
git clone --depth 1 https://github.com/google/closure-compiler.git
cd closure-compiler
ant jar
ant linter

cd ../closure-library

# Installs node "devDependencies" found in package.json.
npm install

# Install Selenium.
./node_modules/protractor/bin/webdriver-manager update
