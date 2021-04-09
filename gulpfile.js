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

var typings = require('./scripts/gulpfiles/typings');
var buildTasks = require('./scripts/gulpfiles/build_tasks');
var packageTasks = require('./scripts/gulpfiles/package_tasks');
var gitTasks = require('./scripts/gulpfiles/git_tasks');
var licenseTasks = require('./scripts/gulpfiles/license_tasks');
var appengineTasks = require('./scripts/gulpfiles/appengine_tasks');
var releaseTasks = require('./scripts/gulpfiles/release_tasks');
var cleanupTasks = require('./scripts/gulpfiles/cleanup_tasks');

module.exports = {
  deployDemos: appengineTasks.deployDemos,
  default: buildTasks.build,
  build: buildTasks.build,
  buildCore: buildTasks.core,
  buildBlocks: buildTasks.blocks,
  buildLangfiles: buildTasks.langfiles,
  buildUncompressed: buildTasks.uncompressed,
  buildCompressed: buildTasks.compressed,
  buildGenerators: buildTasks.generators,
  buildAdvancedCompilationTest: buildTasks.advancedCompilationTest,
  gitSyncDevelop: gitTasks.syncDevelop,
  gitSyncMaster: gitTasks.syncMaster,
  gitCreateRC: gitTasks.createRC,
  gitUpdateGithubPages: gitTasks.updateGithubPages,
  typings: gulp.series(typings.typings, typings.msgTypings),
  package: packageTasks.package,
  checkLicenses: licenseTasks.checkLicenses,
  recompile: releaseTasks.recompile,
  publish: releaseTasks.publish,
  publishBeta: releaseTasks.publishBeta,
  sortRequires: cleanupTasks.sortRequires,
};
