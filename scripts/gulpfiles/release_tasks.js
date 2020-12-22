/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp script to build Blockly for Node & NPM.
 */

var gulp = require('gulp');
var readlineSync = require('readline-sync');
var execSync = require('child_process').execSync;
var gitTasks = require('./git_tasks');
var typings = require('./typings');
var buildTasks = require('./build_tasks');
const execa = require('execa');
const stdio = 'inherit';
var fs = require('fs');
var bump = require('gulp-bump');

function getMajorVersion() {
  var { version } = require('../../package.json');
  var re = new RegExp('^(\d*?).');
  var match = re.exec(version);
  if (!match[0]) {
    console.log('Something went wrong when getting the major version number.');
    return null;
  }
  return parseInt(match[0]);
}

function updateVersion(done, updateType) {
  var majorVersion = getMajorVersion();
  if (!majorVersion) {
    // TODO: What to do here? I think just exit?
  }

  switch (updateType) {
    case 'Major':
      majorVersion++;
      execSync(`npm --no-git-tag-version version ${majorVersion}.$(date +'%Y%m%d').0`, {stdio: 'inherit'});
      break;
    case 'Minor':
      execSync(`npm --no-git-tag-version version ${majorVersion}.$(date +'%Y%m%d').0`);
      break;
    case 'Patch':
      execSync(`npm --no-git-tag-version version patch`);
      break;
    default:
      // TODO: I think I should make this only happen if they hit cancel.
      console.log('Cancelling process.');
      process.exit();
  }
  done();
}

// TODO: rename the name of this function.
function updateVersionPrompt(done) {
  var releaseTypes = ['Major', 'Minor', 'Patch'];
  var index = readlineSync.keyInSelect(releaseTypes, 'Which version?');
  updateVersion(done, releaseTypes[index]);
  // done();
}

// Helper function: get a name for a rebuild branch. Format: rebuild_mm_dd_yyyy.
function getRebuildBranchName() {
  var date = new Date();
  var mm = date.getMonth() + 1; // Month, 0-11
  var dd = date.getDate(); // Day of the month, 1-31
  var yyyy = date.getFullYear();
  return 'rebuild_' + mm + '_' + dd + '_' + yyyy;
}

// Switch to a new rebuild branch.
const recompile = gulp.series(
  gitTasks.syncDevelop,
  function(done) {
    var branchName = getRebuildBranchName();
    console.log('make-rebuild-branch: creating branch ' + branchName);
    // execSync('git checkout -b ' + branchName, { stdio: 'inherit' });
    done();
  },
  updateVersionPrompt,
  buildTasks.build,
  typings.typings,
  function(done) {
    console.log('push-rebuild-branch: committing rebuild');
    // execSync('git commit -am "Rebuild"', { stdio: 'inherit' });
    var branchName = getRebuildBranchName();
    // execSync('git push origin ' + branchName, { stdio: 'inherit' });
    console.log('Branch ' + branchName + ' pushed to GitHub.');
    console.log('Next step: create a pull request against develop.');
    done();
  }
);

module.exports = {
  recompile: recompile
}
