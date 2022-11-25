/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to test.
 */
/* eslint-env node */

const asyncDone = require('async-done');
const gulp = require('gulp');
const gzip = require('gulp-gzip');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const rimraf = require('rimraf');

const buildTasks = require('./build_tasks');
const {BUILD_DIR, RELEASE_DIR} = require('./config');

const {runMochaTestsInBrowser} = require('../../tests/mocha/webdriver.js');
const {runGeneratorsInBrowser} = require('../../tests/generators/webdriver.js');
const {runCompileCheckInBrowser} = require('../../tests/compile/webdriver.js');

const OUTPUT_DIR = 'build/generators';
const GOLDEN_DIR = 'tests/generators/golden';

const BOLD_GREEN = '\x1b[1;32m';
const BOLD_RED = '\x1b[1;31m';
const ANSI_RESET = '\x1b[0m';

class Tester {
  constructor(tasks = []) {
    this.successCount = 0;
    this.failCount = 0;
    this.tasks = tasks;
  }

  /**
   * Run all tests in sequence.
   */
  async runAll() {
    for (const task of this.tasks) {
      await this.runTestTask(task)
    }
    this.reportTestResult();
  }

  /**
   * Create a Gulp task to run all tests.
   */
  asTask() {
    return this.runAll.bind(this);
  }

  /**
   * Run an arbitrary Gulp task as a test.
   * @param {function} task Any Gulp task.
   * @return {Promise} Asynchronous result.
   */
  async runTestTask(task) {
    const id = task.name;
    console.log('=======================================');
    console.log(`== ${id}`);
    if (process.env.CI) console.log('::group::');

    try {
      try {
        await new Promise((resolve, reject) => {
          asyncDone(task, (error, result) => {
            if (error) reject(error);
            resolve(result);
          });
        });
      } finally {
        if (process.env.CI) console.log('::endgroup::');
      }
      this.successCount++;
      console.log(`${BOLD_GREEN}SUCCESS:${ANSI_RESET} ${id}`);
    } catch (error) {
      this.failCount++;
      console.error(error.message);
      console.log(`${BOLD_RED}FAILED:${ANSI_RESET} ${id}`);
    }
  }

  /**
   * Print test results.
   */
  reportTestResult() {
    console.log('=======================================');
    // Check result.
    if (this.failCount === 0) {
      console.log(
          `${BOLD_GREEN}All ${this.successCount} tests passed.${ANSI_RESET}`);
    } else {
      console.log(
          `${BOLD_RED}Failures in ${this.failCount} test groups.${ANSI_RESET}`);
    }
  }
};

/**
 * Helper method for running test command.
 * @param {string} command Command line to run.
 * @return {Promise} Asynchronous result.
 */
async function runTestCommand(command) {
  execSync(command, {stdio: 'inherit'});
}

/**
 * Lint the codebase.
 * Skip for CI environments, because linting is run separately.
 * @return {Promise} Asynchronous result.
 */
function eslint() {
  if (process.env.CI) {
    console.log('Skip linting.');
    return Promise.resolve();
  }
  return runTestCommand('eslint .');
}

/**
 * Run the full usual build and package process, checking to ensure
 * there are no Closure Compiler warnings / errors.
 * @return {Promise} Asynchronous result.
 */
function build() {
  return runTestCommand('npm run package -- --verbose --debug');
}

/**
 * Run renaming validation test.
 * @return {Promise} Asynchronous result.
 */
function renamings() {
  return runTestCommand('node tests/migration/validate-renamings.js');
}

/**
 * Helper method for gzipping file.
 * @param {string} file Target file.
 * @return {Promise} Asynchronous result.
 */
function gzipFile(file) {
  return new Promise((resolve) => {
    const name = path.posix.join(RELEASE_DIR, file);

    const stream = gulp.src(name)
        .pipe(gzip())
        .pipe(gulp.dest(RELEASE_DIR));

    stream.on('end', () => {
      resolve();
    });
  });
}

/**
 * Helper method for comparing file size.
 * @param {string} file Target file.
 * @param {number} expected Expected size.
 * @return {number} 0: success / 1: failed.
 */
function compareSize(file, expected) {
  const name = path.posix.join(RELEASE_DIR, file);
  const compare = Math.floor(expected * 1.1);
  const stat = fs.statSync(name);
  const size = stat.size;

  if (size > compare) {
    const message = `Failed: ` +
        `Size of ${name} has grown more than 10%. ${size} vs ${expected}`;
    console.log(`${BOLD_RED}${message}${ANSI_RESET}`);
    return 1;
  } else {
    const message =
        `Size of ${name} at ${size} compared to previous ${expected}`;
    console.log(`${BOLD_GREEN}${message}${ANSI_RESET}`);
    return 0;
  }
}

/**
 * Helper method for zipping the compressed files.
 * @return {Promise} Asynchronous result.
 */
function zippingFiles() {
  // GZip them for additional size comparisons (keep originals, force
  // overwite previously-gzipped copies).
  console.log('Zipping the compressed files');
  const gzip1 = gzipFile('blockly_compressed.js');
  const gzip2 = gzipFile('blocks_compressed.js');
  return Promise.all([gzip1, gzip2]);
}

/**
 * Check the sizes of built files for unexpected growth.
 * @return {Promise} Asynchronous result.
 */
async function metadata() {
  // Zipping the compressed files.
  await zippingFiles();
  // Read expected size from script.
  const contents = fs.readFileSync('tests/scripts/check_metadata.sh')
      .toString();
  const pattern = /^readonly (?<key>[A-Z_]+)=(?<value>\d+)$/gm;
  const matches = contents.matchAll(pattern);
  const expected = {};
  for (const match of matches) {
    expected[match.groups.key] = match.groups.value;
  }

  // Check the sizes of the files.
  let failed = 0;
  failed += compareSize('blockly_compressed.js',
                        expected.BLOCKLY_SIZE_EXPECTED);
  failed += compareSize('blocks_compressed.js',
                        expected.BLOCKS_SIZE_EXPECTED);
  failed += compareSize('blockly_compressed.js.gz',
                        expected.BLOCKLY_GZ_SIZE_EXPECTED);
  failed += compareSize('blocks_compressed.js.gz',
                        expected.BLOCKS_GZ_SIZE_EXPECTED);
  if (failed > 0) {
    throw new Error('Unexpected growth was detected.');
  }
}

/**
 * Run Mocha tests inside a browser.
 * @return {Promise} Asynchronous result.
 */
async function mocha() {
  const result = await runMochaTestsInBrowser().catch(e => {
    throw e;
  });
  if (result) {
    throw new Error('Mocha tests failed');
  }
  console.log('Mocha tests passed');
}

/**
 * Helper method for comparison file.
 * @param {string} file1 First target file.
 * @param {string} file2 Second target file.
 * @return {boolean} Comparison result (true: same / false: different).
 */
function compareFile(file1, file2) {
  const buf1 = fs.readFileSync(file1);
  const buf2 = fs.readFileSync(file2);
  // Normalize the line feed.
  const code1 = buf1.toString().replace(/(?:\r\n|\r|\n)/g, '\n');
  const code2 = buf2.toString().replace(/(?:\r\n|\r|\n)/g, '\n');
  return code1 === code2;
}

/**
 * Helper method for checking the result of generator.
 * @param {string} suffix Target suffix.
 * @return {number} Check result (0: success / 1: failed).
 */
function checkResult(suffix) {
  const fileName = `generated.${suffix}`;
  const resultFileName = path.posix.join(OUTPUT_DIR, fileName);

  const SUCCESS_PREFIX = `${BOLD_GREEN}SUCCESS:${ANSI_RESET}`;
  const FAILURE_PREFIX = `${BOLD_RED}FAILED:${ANSI_RESET}`;

  if (fs.existsSync(resultFileName)) {
    const goldenFileName = path.posix.join(GOLDEN_DIR, fileName);
    if (fs.existsSync(goldenFileName)) {
      if (compareFile(resultFileName, goldenFileName)) {
        console.log(`${SUCCESS_PREFIX} ${suffix}: ` +
            `${resultFileName} matches ${goldenFileName}`);
        return 0;
      } else {
        console.log(
            `${FAILURE_PREFIX} ${suffix}: ` +
            `${resultFileName} does not match ${goldenFileName}`);
      }
    } else {
      console.log(`File ${goldenFileName} not found!`);
    }
  } else {
    console.log(`File ${resultFileName} not found!`);
  }
  return 1;
}

/**
 * Run generator tests inside a browser and check the results.
 * @return {Promise} Asynchronous result.
 */
async function generators() {
  // Clean up.
  rimraf.sync(OUTPUT_DIR);
  fs.mkdirSync(OUTPUT_DIR);

  await runGeneratorsInBrowser(OUTPUT_DIR).catch(() => {});

  const generatorSuffixes = ['js', 'py', 'dart', 'lua', 'php'];
  let failed = 0;
  generatorSuffixes.forEach((suffix) => {
    failed += checkResult(suffix);
  });

  if (failed === 0) {
    console.log(`${BOLD_GREEN}All generator tests passed.${ANSI_RESET}`);
  } else {
    console.log(
        `${BOLD_RED}Failures in ${failed} generator tests.${ANSI_RESET}`);
    throw new Error('Generator tests failed.');
  }
}

/**
 * Run Node tests.
 * @return {Promise} Asynchronous result.
 */
function node() {
  return runTestCommand('mocha tests/node --config tests/node/.mocharc.js');
}

/**
 * Attempt advanced compilation of a Blockly app.
 * @return {Promise} Asynchronous result.
 */
function advancedCompile() {
  const compilePromise = runTestCommand('npm run test:compile:advanced');
  return compilePromise.then(runCompileCheckInBrowser);
}

// Run all tests in sequence.
const test = new Tester([
  eslint,
  build,
  renamings,
  metadata,
  mocha,
  generators,
  node,
  advancedCompile,
]).asTask();


module.exports = {
  test,
  generators,
};
