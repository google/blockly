/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 * Run this script by calling "npm install" in this directory.
 */
/* eslint-env node */

const gulp = require('gulp');

const buildTasks = require('./scripts/gulpfiles/build_tasks');
const packageTasks = require('./scripts/gulpfiles/package_tasks');
const gitTasks = require('./scripts/gulpfiles/git_tasks');
const appengineTasks = require('./scripts/gulpfiles/appengine_tasks');
const releaseTasks = require('./scripts/gulpfiles/release_tasks');
const docsTasks = require('./scripts/gulpfiles/docs_tasks');
const testTasks = require('./scripts/gulpfiles/test_tasks');

module.exports = {
  // Default target if gulp invoked without specifying.
  default: buildTasks.build,

  // Main sequence targets.  They already invoke prerequisites.
  langfiles: buildTasks.langfiles, // Build build/msg/*.js from msg/json/*.
  tsc: buildTasks.tsc,
  deps: buildTasks.deps,
  minify: buildTasks.minify,
  build: buildTasks.build,
  package: packageTasks.package,
  publish: releaseTasks.publish,
  publishBeta: releaseTasks.publishBeta,
  prepareDemos: appengineTasks.prepareDemos,
  deployDemos: appengineTasks.deployDemos,
  deployDemosBeta: appengineTasks.deployDemosBeta,
  gitUpdateGithubPages: gitTasks.updateGithubPages,

  // Manually-invokable targets, with prerequisites where required.
  messages: buildTasks.messages, // Generate msg/json/en.json et al.
  clean: gulp.parallel(buildTasks.cleanBuildDir, packageTasks.cleanReleaseDir),
  test: testTasks.test,
  testGenerators: testTasks.generators,
  buildAdvancedCompilationTest: buildTasks.buildAdvancedCompilationTest,
  gitCreateRC: gitTasks.createRC,
  docs: docsTasks.docs,

  // Legacy targets, to be deleted.
  recompile: releaseTasks.recompile,
  gitSyncDevelop: gitTasks.syncDevelop,
  gitSyncMaster: gitTasks.syncMaster,
};
