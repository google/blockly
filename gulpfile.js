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
var execSync = require('child_process').execSync;

var packageJson = require('./package.json');

var typings = require('./scripts/gulpfiles/typings');
var buildTasks = require('./scripts/gulpfiles/build_tasks');
var packageTasks = require('./scripts/gulpfiles/package_tasks');
var gitTasks = require('./scripts/gulpfiles/git_tasks');
var licenseTasks = require('./scripts/gulpfiles/license_tasks');

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
  gitUpdateGithubPages: gitTasks.updateGithubPages,
  typings: typings.typings,
  package: packageTasks.package,
  checkLicenses: licenseTasks.checkLicenses
};
