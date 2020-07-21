#!/bin/bash

if [ ! -d "clutz" ]; then
  # Install clutz
  git clone https://github.com/angular/clutz
  cd clutz
  npm i
  ./gradlew build installDist
fi
