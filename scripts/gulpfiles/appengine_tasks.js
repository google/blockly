/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script to deploy Blockly demos on appengine.
 */

var gulp = require('gulp');

var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var execSync = require('child_process').execSync;

var packageJson = require('../../package.json');

const demoTmpDir = '../_deploy';
const demoStaticTmpDir = '../_deploy/static';

/**
 * Cleans and creates the tmp directory used for deploying.
 */
function prepareDeployDir(done) {
  // Clean directory if exists.
  if (fs.existsSync(demoTmpDir)) {
    rimraf.sync(demoTmpDir);
  }
  fs.mkdirSync(demoStaticTmpDir, { recursive: true });
  done()
}

/**
 * Copies all files into static deploy directory except for those under
 * appengine.
 */
function copyStaticSrc(done) {
  execSync(`git archive HEAD | tar -x -C ${demoStaticTmpDir}`,
      { stdio: 'inherit' });
  done()
}

/**
 * Copies appengine files into deploy directory.
 */
function copyAppengineSrc() {
  const appengineSrc = [
      path.join(demoStaticTmpDir, 'appengine/**/*'),
      path.join(demoStaticTmpDir, 'appengine/.gcloudignore'),
  ];
  return gulp.src(appengineSrc).pipe(gulp.dest(demoTmpDir));
}

/**
 * Copies playground deps into deploy directory.
 */
function copyPlaygroundDeps() {
  const playgroundDeps = [
      './node_modules/@blockly/dev-tools/dist/index.js',
      './node_modules/@blockly/theme-modern/dist/index.js',
      './node_modules/@blockly/block-test/dist/index.js',
  ];
  return gulp.src(playgroundDeps, {base: '.'}).pipe(gulp.dest(demoStaticTmpDir));
}

/**
 * Deploys files from tmp directory to appengine to version based on the version
 * specified in package.json and then cleans the tmp directory.
 */
function deployAndClean(done) {
  const minorVersion = packageJson.version.split('.')[1];
  const patchVersion = packageJson.version.split('.')[2];
  let demoVersion = minorVersion;
  if (patchVersion != 0) {
    demoVersion += '-' + patchVersion
  }
  try {
    execSync(`gcloud app deploy --project blockly-demo --version ${demoVersion} --no-promote`, { stdio: 'inherit', cwd: demoTmpDir });
  } finally {
    // Clean up tmp directory.
    if (fs.existsSync(demoTmpDir)) {
      rimraf.sync(demoTmpDir);
    }
  }
  done();
}

/**
 * Deploys demos.
 */
const deployDemos = gulp.series(
    prepareDeployDir,
    copyStaticSrc,
    copyAppengineSrc,
    copyPlaygroundDeps,
    deployAndClean
);

module.exports = {
  deployDemos: deployDemos,
}
