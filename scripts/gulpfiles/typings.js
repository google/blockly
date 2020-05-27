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
    "core/keyboard_nav",
    "core/renderers/common",
    "core/renderers/measurables",
    "core/theme",
    "core/interfaces",
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
    'typings/templates/blockly-header.template',
    'typings/templates/blockly-interfaces.template',
    `${tmpDir}/core/**`,
    `${tmpDir}/core/interfaces/**`,
    `${tmpDir}/core/components/**`,
    `${tmpDir}/core/components/tree/**`,
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

// Generates the TypeScript definition files (d.ts) for Blockly locales.
function msgTypings(cb) {
  const template = fs.readFileSync(path.join('typings/templates/msg.template'), 'utf-8');
  const msgFiles = fs.readdirSync(path.join('msg', 'json'));
  msgFiles.forEach(msg => {
    const localeName = msg.substring(0, msg.indexOf('.json'));
    const msgTypings = template.slice().replace(/<%= locale %>/gi, localeName);
    fs.writeFileSync(path.join('typings', 'msg', localeName + '.d.ts'), msgTypings, 'utf-8');
  })
  cb();
}

module.exports = {
  typings: typings,
  msgTypings: msgTypings
};
