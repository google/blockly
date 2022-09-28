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
const licenseTasks = require('./scripts/gulpfiles/license_tasks');
const appengineTasks = require('./scripts/gulpfiles/appengine_tasks');
const releaseTasks = require('./scripts/gulpfiles/release_tasks');
const cleanupTasks = require('./scripts/gulpfiles/cleanup_tasks');

module.exports = {
  deployDemos: appengineTasks.deployDemos,
  deployDemosBeta: appengineTasks.deployDemosBeta,
  default: buildTasks.build,
  generateLangfiles: buildTasks.generateLangfiles,
  build: buildTasks.build,
  buildDeps: buildTasks.deps,
  buildLangfiles: buildTasks.langfiles,
  buildCompiled: buildTasks.compiled,
  buildAdvancedCompilationTest: buildTasks.advancedCompilationTest,
  buildTs: buildTasks.buildTypescript,
  // TODO(5621): Re-enable once typings generation is fixed.
  // checkin: gulp.parallel(buildTasks.checkinBuilt, typings.checkinTypings),
  checkin: gulp.parallel(buildTasks.checkinBuilt),
  checkinBuilt: buildTasks.checkinBuilt,
  clangFormat: buildTasks.format,
  clean: gulp.parallel(buildTasks.cleanBuildDir, packageTasks.cleanReleaseDir),
  cleanBuildDir: buildTasks.cleanBuildDir,
  cleanReleaseDir: packageTasks.cleanReleaseDir,
  gitSyncDevelop: gitTasks.syncDevelop,
  gitSyncMaster: gitTasks.syncMaster,
  gitCreateRC: gitTasks.createRC,
  gitUpdateGithubPages: gitTasks.updateGithubPages,
  // TODO(5621): Re-enable once typings generation is fixed.
  // typings: gulp.series(typings.typings, typings.msgTypings),
  // checkinTypings: typings.checkinTypings,
  package: packageTasks.package,
  checkLicenses: licenseTasks.checkLicenses,
  recompile: releaseTasks.recompile,
  prepareDemos: appengineTasks.prepareDemos,
  publish: releaseTasks.publish,
  publishBeta: releaseTasks.publishBeta,
  sortRequires: cleanupTasks.sortRequires,
};
