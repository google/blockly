/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp scripts for releasing Blockly.
 */

var execSync = require('child_process').execSync;
var fs = require('fs');
var gulp = require('gulp');
var readlineSync = require('readline-sync');
var typings = require('./typings');

var buildTasks = require('./build_tasks');
var gitTasks = require('./git_tasks');
var packageTasks = require('./package_tasks');
var { getPackageJson } = require('./helper_tasks');

const RELEASE_DIR = 'dist';

// Gets the current major version.
function getMajorVersion() {
  var { version } = getPackageJson();
  var re = new RegExp(/^(\d)./);
  var match = re.exec(version);
  if (!match[0]) {
    return null;
  }
  console.log(match[0]);
  return parseInt(match[0]);
}

// Updates the version depending on user input.
function updateVersion(done, updateType) {
  var majorVersion = getMajorVersion();
  if (!majorVersion) {
    done(new Error('Something went wrong when getting the major version number.'));
  } else if (!updateType) {
    // User selected to cancel.
    done(new Error('Cancelling process.'));
  }

  switch (updateType.toLowerCase()) {
    case 'major':
      majorVersion++;
      execSync(`npm --no-git-tag-version version ${majorVersion}.$(date +'%Y%m%d').0`, {stdio: 'inherit'});
      done();
      break;
    case 'minor':
      execSync(`npm --no-git-tag-version version ${majorVersion}.$(date +'%Y%m%d').0`, {stdio: 'inherit'});
      done();
      break;
    case 'patch':
      execSync(`npm --no-git-tag-version version patch`, {stdio: 'inherit'});
      done();
      break;
    default:
      done(new Error('Unexpected update type was chosen.'))
  }
}

// Prompt the user to figure out what kind of version update we should do.
function updateVersionPrompt(done) {
  var releaseTypes = ['Major', 'Minor', 'Patch'];
  var index = readlineSync.keyInSelect(releaseTypes, 'Which version type?');
  updateVersion(done, releaseTypes[index]);
}

// Checks with the user that they are on the correct git branch.
function checkBranch(done) {
  var gitBranchName = execSync('git rev-parse --abbrev-ref HEAD').toString();
  if (readlineSync.keyInYN(`You are on '${gitBranchName.trim()}'. Is this the correct branch?`)) {
    done();
  } else {
    done(new Error('Not on correct branch'));
  }
}


// Sanity check that the dist folder exists, and that certain files are in the dist folder.
function checkDist(done) {
  const sanityFiles = ['blockly_compressed.js', 'blocks_compressed.js', 'core', 'blocks', 'generators'];
  // Check that dist exists.
  if (fs.existsSync(RELEASE_DIR)) {
    // Sanity check that certain files exist in dist.
    sanityFiles.forEach((fileName) => {
      if (!fs.existsSync(`${RELEASE_DIR}/${fileName}`)) {
        done(new Error(`Your dist folder does not contain:${fileName}`));
      }
    });
    done();
  } else {
    done(new Error('The dist directory does not exist. Is packageTasks.package being run?'));
  }
}

// Check with the user that the version number is correct, then login and publish to npm.
function loginAndPublish_(done, isBeta) {
  var { version } = getPackageJson();
  if(readlineSync.keyInYN(`You are about to publish blockly with the version number:${version}. Do you want to continue?`)) {
    execSync(`npm login --registry https://wombat-dressing-room.appspot.com`, {stdio: 'inherit'});
    execSync(`npm publish --registry https://wombat-dressing-room.appspot.com ${isBeta ? '--tag beta' : ''}`, {cwd: RELEASE_DIR, stdio: 'inherit'});
    done();
  } else {
    done(new Error('User quit due to the version number not being correct.'));
  }
}

// Login and publish.
function loginAndPublish(done) {
  return loginAndPublish_(done, false);
}

// Login and publish the beta version.
function loginAndPublishBeta(done) {
  return loginAndPublish_(done, true);
}

// Repeatedly prompts the user for a beta version number until a valid one is given.
// A valid version number must have '-beta.x' and can not have already been used to publish to npm.
function updateBetaVersion(done) {
  var isValid = false;
  var newVersion = null;
  var blocklyVersions = JSON.parse(execSync('npm view blockly versions --json').toString());
  var re = new RegExp(/-beta\.(\d)/);
  var latestBetaVersion = execSync('npm show blockly version --tag beta').toString().trim();
  while(!isValid) {
    newVersion = readlineSync.question(`What is the new beta version? (latest beta version: ${latestBetaVersion})`);
    var existsOnNpm = blocklyVersions.indexOf(newVersion) > -1;
    var isFormatted = newVersion.search(re) > -1;
    if (!existsOnNpm && isFormatted) {
      isValid = true;
    } else if (existsOnNpm) {
      console.log("This version already exists. Please enter a new version.");
    } else if (!isFormatted) {
      console.log("To publish a beta version you must have -beta.x in the version.");
    }
  }
  // Allow the same version here, since we already check the version does not exist on npm.
  execSync(`npm --no-git-tag-version --allow-same-version version ${newVersion}`, {stdio: 'inherit'});
  done();
}

// Package and publish to npm.
const publish = gulp.series(
  packageTasks.package,
  checkBranch,
  checkDist,
  loginAndPublish
);

// Publish a beta version of Blockly.
const publishBeta = gulp.series(
  updateBetaVersion,
  buildTasks.build,
  packageTasks.package,
  checkBranch,
  checkDist,
  loginAndPublishBeta
);

// Switch to a new branch, update the version number, and build Blockly.
const recompile = gulp.series(
  gitTasks.syncDevelop(),
  gitTasks.createRebuildBranch,
  updateVersionPrompt,
  buildTasks.build,
  typings.typings,
  gitTasks.pushRebuildBranch
  );

module.exports = {
  recompile: recompile,
  publishBeta: publishBeta,
  publish: publish
}
