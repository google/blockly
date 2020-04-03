/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script to generate the Typescript definition file (d.ts)
 * for Blockly.
 */

var gulp = require('gulp');
gulp.concat = require('gulp-concat');

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;

// Generates the TypeScript definition file (d.ts) for Blockly.
// As well as generating the typings of each of the files under core/ and msg/,
// the script also pulls in a number of part files from typings/parts.
// This includes the header (incl License), additional useful interfaces
// including Blockly Options and Google Closure typings.
function typings() {
  const tmpDir = './typings/tmp';
  const blocklySrcs = [
    "core/",
    "core/components",
    "core/components/tree",
    "core/components/menu",
    "core/keyboard_nav",
    "core/renderers/common",
    "core/renderers/measurables",
    "core/theme",
    "core/utils",
    "msg/"
  ];
  // Clean directory if exists.
  if (fs.existsSync(tmpDir)) {
    rimraf.sync(tmpDir);
  }
  fs.mkdirSync(tmpDir);

  // Find all files that will be included in the typings file.
  let files = [];
  blocklySrcs.forEach((src) => {
    files = files.concat(fs.readdirSync(src)
      .filter(fn => fn.endsWith('.js'))
      .map(fn => path.join(src, fn)));
  });

  // Generate typings file for each file.
  files.forEach((file) => {
    const typescriptFileName = `${path.join(tmpDir, file)}.d.ts`;
    if (file.indexOf('core/msg.js') > -1) {
      return;
    }
    const cmd = `node ./node_modules/typescript-closure-tools/definition-generator/src/main.js ${file} ${typescriptFileName}`;
    console.log(`Generating typings for ${file}`);
    execSync(cmd, { stdio: 'inherit' });
  });

  const srcs = [
    'typings/parts/blockly-header.d.ts',
    'typings/parts/blockly-interfaces.d.ts',
    `${tmpDir}/core/**`,
    `${tmpDir}/core/components/**`,
    `${tmpDir}/core/components/tree/**`,
    `${tmpDir}/core/components/menu/**`,
    `${tmpDir}/core/keyboard_nav/**`,
    `${tmpDir}/core/renderers/common/**`,
    `${tmpDir}/core/renderers/measurables/**`,
    `${tmpDir}/core/utils/**`,
    `${tmpDir}/core/theme/**`,
    `${tmpDir}/msg/**`
  ];
  return gulp.src(srcs)
    .pipe(gulp.concat('blockly.d.ts'))
    .pipe(gulp.dest('typings'))
    .on('end', function () {
      // Clean up tmp directory.
      if (fs.existsSync(tmpDir)) {
        rimraf.sync(tmpDir);
      }
    });
};

module.exports = {
  typings: typings
};
