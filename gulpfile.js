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
  deployDemosBeta: appengineTasks.deployDemosBeta,
  default: buildTasks.build,
  generateLangfiles: buildTasks.generateLangfiles,
  build: buildTasks.build,
  buildDeps: buildTasks.deps,
  buildCore: buildTasks.core,
  buildBlocks: buildTasks.blocks,
  buildLangfiles: buildTasks.langfiles,
  buildCompressed: buildTasks.compressed,
  buildGenerators: buildTasks.generators,
  buildAdvancedCompilationTest: buildTasks.advancedCompilationTest,
  checkin: gulp.parallel(buildTasks.checkinBuilt, typings.checkinTypings),
  checkinBuilt: buildTasks.checkinBuilt,
  clangFormat: buildTasks.format,
  clean: gulp.parallel(buildTasks.cleanBuildDir, packageTasks.cleanReleaseDir),
  cleanBuildDir: buildTasks.cleanBuildDir,
  cleanReleaseDir: packageTasks.cleanReleaseDir,
  gitSyncDevelop: gitTasks.syncDevelop,
  gitSyncMaster: gitTasks.syncMaster,
  gitCreateRC: gitTasks.createRC,
  gitUpdateGithubPages: gitTasks.updateGithubPages,
  typings: gulp.series(typings.typings, typings.msgTypings),
  checkinTypings: typings.checkinTypings,
  package: packageTasks.package,
  checkLicenses: licenseTasks.checkLicenses,
  recompile: releaseTasks.recompile,
  prepareDemos: appengineTasks.prepareDemos,
  publish: releaseTasks.publish,
  publishBeta: releaseTasks.publishBeta,
  sortRequires: cleanupTasks.sortRequires,
};
