/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Git-related gulp tasks for Blockly.
 */

var gulp = require('gulp');
var execSync = require('child_process').execSync;

var buildTasks = require('./build_tasks');

const upstream_url = "https://github.com/google/blockly.git";

// Stash current state, check out the named branch, and sync with
// google/blockly.
function syncBranch(branchName) {
  return function(done) {
    execSync('git stash save -m "Stash for sync"', { stdio: 'inherit' });
    checkoutBranch(branchName);
    execSync('git pull ' + upstream_url + ' ' + branchName,
        { stdio: 'inherit' });
    execSync('git push origin ' + branchName, { stdio: 'inherit' });
    done();
  }
}

// Stash current state, check out develop, and sync with google/blockly.
function syncDevelop() {
  return syncBranch('develop');
};

// Stash current state, check out master, and sync with google/blockly.
function syncMaster() {
  return syncBranch('master');
};

// Helper function: get a name for a rebuild branch. Format: rebuild_mm_dd_yyyy.
function getRebuildBranchName() {
  var date = new Date();
  var mm = date.getMonth() + 1; // Month, 0-11
  var dd = date.getDate(); // Day of the month, 1-31
  var yyyy = date.getFullYear();
  return 'rebuild_' + mm + '_' + dd + '_' + yyyy;
};

// Helper function: get a name for a rebuild branch. Format: rebuild_yyyy_mm.
function getRCBranchName() {
  var date = new Date();
  var mm = date.getMonth() + 1; // Month, 0-11
  var yyyy = date.getFullYear();
  return 'rc_' + yyyy + '_' + mm;
};

// If branch does not exist then create the branch.
// If branch exists switch to branch.
function checkoutBranch(branchName) {
  execSync('git checkout ' + branchName + ' || git checkout -b ' + branchName,
   { stdio: 'inherit' });
}

// Create and push an RC branch.
// Note that this pushes to google/blockly.
const createRC = gulp.series(
  syncDevelop(),
  function(done) {
    var branchName = getRCBranchName();
    execSync('git checkout -b ' + branchName, { stdio: 'inherit' });
    execSync('git push ' + upstream_url + ' ' + branchName,
        { stdio: 'inherit' });
    done();
  }
);

// Create the rebuild branch.
function createRebuildBranch(done) {
  var branchName = getRebuildBranchName();
  console.log('make-rebuild-branch: creating branch ' + branchName);
  execSync('git checkout -b ' + branchName, { stdio: 'inherit' });
  done();
}

// Push the rebuild branch to origin.
function pushRebuildBranch(done) {
  console.log('push-rebuild-branch: committing rebuild');
  execSync('git commit -am "Rebuild"', { stdio: 'inherit' });
  var branchName = getRebuildBranchName();
  execSync('git push origin ' + branchName, { stdio: 'inherit' });
  console.log('Branch ' + branchName + ' pushed to GitHub.');
  console.log('Next step: create a pull request against develop.');
  done();
}

// Update github pages with what is currently in develop.
const updateGithubPages = gulp.series(
  function(done) {
    execSync('git stash save -m "Stash for sync"', { stdio: 'inherit' });
    execSync('git checkout gh-pages || git checkout -b gh-pages', { stdio: 'inherit' });
    execSync('git fetch upstream', { stdio: 'inherit' });
    execSync('git reset --hard upstream/develop', { stdio: 'inherit' });
    done();
  },
  buildTasks.cleanBuildDir,
  buildTasks.build,
  buildTasks.checkinBuilt,
  function(done) {
    execSync('git commit -am "Rebuild"', { stdio: 'inherit' });
    execSync('git push ' + upstream_url + ' gh-pages --force', { stdio: 'inherit' });
    done();
  }
);

module.exports = {
  syncDevelop: syncDevelop,
  syncMaster: syncMaster,
  createRC: createRC,
  updateGithubPages: updateGithubPages,
  createRebuildBranch: createRebuildBranch,
  pushRebuildBranch: pushRebuildBranch
}
