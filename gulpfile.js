/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 * Run this script by calling "npm install" in this directory.
 */

var gulp = require('gulp');
gulp.shell = require('gulp-shell');
gulp.concat = require('gulp-concat');
gulp.replace = require('gulp-replace');
gulp.rename = require('gulp-rename');
gulp.insert = require('gulp-insert');
gulp.umd = require('gulp-umd');

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var execSync = require('child_process').execSync;
var through2 = require('through2');

var closureCompiler = require('google-closure-compiler').gulp();
var closureDeps = require('google-closure-deps');
var packageJson = require('./package.json');
var argv = require('yargs').argv;

var typings = require('./scripts/gulpfiles/typings');
var buildTasks = require('./scripts/gulpfiles/build_tasks');
var packageTasks = require('./scripts/gulpfiles/package_tasks');
var gitTasks = require('./scripts/gulpfiles/git_tasks');


// See https://docs.npmjs.com/cli/version.
const preversion = gulp.series(
  gitTasks.syncMaster,
  function(done) {
    // Create a branch named bump_version for the bump and rebuild.
    execSync('git checkout -b bump_version', { stdio: 'inherit' });
    done();
  },
);

// See https://docs.npmjs.com/cli/version
function postversion(done) {
  // Push both the branch and tag to google/blockly.
  execSync('git push ' + upstream_url + ' bump_version',
      { stdio: 'inherit' });
  var tagName = 'v' + packageJson.version;
  execSync('git push ' + upstream_url + ' ' + tagName,
      { stdio: 'inherit' });
  done();
};

module.exports = {
  default: buildTasks.build,
  build: buildTasks.build,
  buildCore: buildTasks.core,
  buildBlocks: buildTasks.blocks,
  buildLangfiles: buildTasks.langfiles,
  buildUncompressed: buildTasks.uncompressed,
  buildCompressed: buildTasks.compressed,
  buildGenerators: buildTasks.generators,
  preversion: preversion,
  postversion: postversion,
  gitSyncDevelop: gitTasks.syncDevelop,
  gitSyncMaster: gitTasks.syncMaster,
  gitCreateRC: gitTasks.createRC,
  gitRecompile: gitTasks.recompile,
  typings: typings.typings,
  package: packageTasks.package
};
