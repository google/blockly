/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to test.
 */
/* eslint-env node */

const gulp = require('gulp');
const gzip = require('gulp-gzip');
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const rimraf = require('rimraf');

const {BUILD_DIR} = require('./config');

const runGeneratorsInBrowser =
  require('../../tests/generators/run_generators_in_browser.js');

const OUTPUT_DIR = 'build/generators/';
const GOLDEN_DIR = 'tests/generators/golden/';

const BOLD_GREEN = '\x1b[1;32m';
const BOLD_RED = '\x1b[1;31m';
const ANSI_RESET = '\x1b[0m';

let failerCount = 0;

/**
 * Helper method for running test code block.
 * @param {string} id test id
 * @param {function} block test code block
 * @return {Promise} asynchronous result
 */
function runTestBlock(id, block) {
  return new Promise((resolve) => {
    console.log('=======================================');
    console.log(`== ${id}`);
    if (process.env.CI) console.log('::group::');
    block()
      .then((result) => {
        if (process.env.CI) console.log('::endgroup::');
        console.log(`${BOLD_GREEN}SUCCESS:${ANSI_RESET} ${id}`);
        resolve(result);
      })
      .catch((err) => {
        if (process.env.CI) console.log('::endgroup::');
        console.log(`${BOLD_GREEN}SUCCESS:${ANSI_RESET} ${id}`);
        failerCount++;
        console.error(err.message);
        console.log(`${BOLD_RED}FAILED:${ANSI_RESET} ${id}`);
        // Always continue.
        resolve(err);
      });
  });
}

/**
 * Helper method for running test command.
 * @param {string} id test id
 * @param {string} command command line to run
 * @return {Promise} asynchronous result
 */
function runTestCommand(id, command) {
  return runTestBlock(id, async() => {
    return execSync(command, {stdio: 'inherit'});
  }, false);
}

/**
 * Lint the codebase.
 * Skip for CI environments, because linting is run separately.
 * @return {Promise} asynchronous result
 */
function eslint() {
  if (process.env.CI) {
    console.log('Skip linting.');
    return Promise.resolve();
  }
  return runTestCommand('eslint', 'eslint .');
}

/**
 * Run the full usual build process, checking to ensure there are no
 * closure compiler warnings / errors.
 * @return {Promise} asynchronous result
 */
function buildDebug() {
  return runTestCommand('build-debug', 'npm run build-debug');
}

/**
 * Run renaming validation test.
 * @return {Promise} asynchronous result
 */
function renamings() {
  return runTestCommand('renamings', 'node tests/migration/validate-renamings.js');
}

/**
 * Helper method for gzipping file.
 * @param {string} file target file
 * @return {Promise} asynchronous result
 */
function gzipFile(file) {
  return new Promise((resolve) => {
    const name = path.posix.join('build', file);

    const stream = gulp.src(name)
      .pipe(gzip())
      .pipe(gulp.dest('build'));

    stream.on('end', () => {
      resolve();
    });
  });
}

/**
 * Helper method for comparing file size.
 * @param {string} file target file
 * @param {number} expected expected size
 * @return {number} 0: success / 1: failed
 */
function compareSize(file, expected) {
  const name = path.posix.join(BUILD_DIR, file);
  const compare = Math.floor(expected * 1.1);
  const stat = fs.statSync(name);
  const size = stat.size;

  if (size > compare) {
    const message = `Failed: ` +
      `Size of ${name} has grown more than 10%. ${size} vs ${expected} `;
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
 * @return {Promise} asynchronous result
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
 * @return {Promise} asynchronous result
 */
function metadata() {
  return runTestBlock('metadata', async() => {
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
  });
}

/**
 * Run Mocha tests inside a browser.
 * @return {Promise} asynchronous result
 */
function mocha() {
  return runTestCommand('mocha', 'node tests/mocha/run_mocha_tests_in_browser.js');
}

/**
 * Helper method for comparison file.
 * @param {string} file1 first target file
 * @param {string} file2 second target file
 * @return {boolean} comparison result (true: same / false: different)
 */
function compareFile(file1, file2) {
  const buf1 = fs.readFileSync(file1);
  const buf2 = fs.readFileSync(file2);
  // Normalize the line feed.
  const code1 = buf1.toString().replace(/(?:\r\n|\r|\n)/g, '\n');
  const code2 = buf2.toString().replace(/(?:\r\n|\r|\n)/g, '\n');
  const result = (code1 === code2);
  return result;
}

/**
 * Helper method for checking the result of generator.
 * @param {string} suffix target suffix
 * @return {number} check result (0: success / 1: failed)
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
 * @return {Promise} asynchronous result
 */
function generators() {
  return runTestBlock('generators', async() => {
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
  });
}

/**
 * Run the package build process, as Node tests depend on it.
 * @return {Promise} asynchronous result
 */
function package() {
  return runTestCommand('package', 'npm run package');
}

/**
 * Run Node tests.
 * @return {Promise} asynchronous result
 */
function node() {
  return runTestCommand('node', 'mocha tests/node --config tests/node/.mocharc.js');
}

/**
 * Attempt advanced compilation of a Blockly app.
 * @return {Promise} asynchronous result
 */
function advancedCompile() {
  return runTestCommand('advanced_compile', 'npm run test:compile:advanced');
}

/**
 * Report test result.
 * @return {Promise} asynchronous result
 */
function reportTestResult() {
  console.log('=======================================');
  // Check result.
  if (failerCount === 0) {
    console.log(`${BOLD_GREEN}All tests passed.${ANSI_RESET}`);
    return Promise.resolve();
  } else {
    console.log(`${BOLD_RED}Failures in ${failerCount} test groups.${ANSI_RESET}`);
    return Promise.reject();
  }
}

// Indivisual tasks.
const testTasks = [
  eslint,
  buildDebug,
  renamings,
  metadata,
  mocha,
  generators,
  package,
  node,
  advancedCompile,
  reportTestResult,
];

// Run all tests in sequence.
const test = gulp.series(...testTasks);

module.exports = {
  test,
  generators,
};
