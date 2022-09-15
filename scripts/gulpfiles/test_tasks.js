/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to test.
 */

var gulp = require('gulp');
var gzip = require('gulp-gzip');
var fs = require('fs');
var path = require('path');
var { execSync } = require('child_process');
var rimraf = require('rimraf');

var {BUILD_DIR} = require('./config');

const TMP_DIR='tests/generators/tmp/';
const GOLDEN_DIR='tests/generators/golden/';

const BOLD_GREEN = '\x1b[1;32m';
const BOLD_RED = '\x1b[1;31m';
const ANSI_RESET = '\x1b[0m';

/**
 * Helper method for running test command.
 */
function runTestCommand(command) {
  return new Promise((resolve, reject) => {
    try {
      const result = execSync(command, { stdio: 'inherit' });
      resolve(result);
    } catch(err) {
      reject(new Error(err.message));
    }
  });
}

/**
 * Lint the codebase.
 * Skip for CI environments, because linting is run separately.
 */
function eslint(done) {
  if (process.env.CI) {
    console.log('Skip linting.');
    done();
  } else {
    return runTestCommand('eslint .');
  }
};

/**
 * Run the full usual build process, checking to ensure there are no
 * closure compiler warnings / errors.
 */
function buildDebug() {
  return runTestCommand('npm run build-debug');
}

/**
 * Run renaming validation test.
 */
function renamings() {
  return runTestCommand('node tests/migration/validate-renamings.js');
}

/**
 * Helper method for gzipping file.
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
  })
}

/**
 * Helper method for comparing file size.
 */
function compareSize(file, expected) {
  const name = path.posix.join(BUILD_DIR, file);
  const compare = Math.floor(expected * 1.1);
  const stat = fs.statSync(name);
  const size = stat.size;

  if (size > compare) {
    const message = `Failed: Size of ${name} has grown more than 10%. ${size} vs ${expected} `;
    console.log(`${BOLD_RED}${message}${ANSI_RESET}`);
    return 1;
  } else {
    const message = `Size of ${name} at ${size} compared to previous ${expected}`;
    console.log(`${BOLD_GREEN}${message}${ANSI_RESET}`);
    return 0;
  }
}

/**
 * Zipping the compressed files.
 */
function compress() {
  // GZip them for additional size comparisons (keep originals, force
  // overwite previously-gzipped copies).
  console.log('Zipping the compressed files');
  const gzip1 = gzipFile('blockly_compressed.js');
  const gzip2 = gzipFile('blocks_compressed.js');
  return Promise.all([gzip1, gzip2]);
}

/**
 * Check the sizes of built files for unexpected growth.
 */
function metadata(done) {
  // Read expected size from script.
  const contents = fs.readFileSync('tests/scripts/check_metadata.sh').toString();
  const pattern = /^readonly (?<key>[A-Z_]+)=(?<value>\d+)$/gm;
  const matches = contents.matchAll(pattern);
  const expected = {};
  for (const match of matches) {
    expected[match.groups.key] = match.groups.value;
  }

  // Check the sizes of the files.
  let failed = 0;
  failed += compareSize('blockly_compressed.js', expected.BLOCKLY_SIZE_EXPECTED);
  failed += compareSize('blocks_compressed.js', expected.BLOCKS_SIZE_EXPECTED);
  failed += compareSize('blockly_compressed.js.gz', expected.BLOCKLY_GZ_SIZE_EXPECTED);
  failed += compareSize('blocks_compressed.js.gz', expected.BLOCKS_GZ_SIZE_EXPECTED);
  if (failed === 0) {
    done();
  }
}

/**
 * Run Mocha tests inside a browser.
 */
function mocha() {
  return runTestCommand('node tests/mocha/run_mocha_tests_in_browser.js');
}

/**
 * Helper method for comparison file.
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
 */
function checkResult(suffix) {
  const fileName = `generated.${suffix}`;
  const tmpFileName = path.posix.join(TMP_DIR, fileName);

  const SUCCESS_PREFIX = `${BOLD_GREEN}SUCCESS:${ANSI_RESET}`;
  const FAILURE_PREFIX = `${BOLD_RED}FAILED:${ANSI_RESET}`;

  if (fs.existsSync(tmpFileName)) {
    const goldenFileName = path.posix.join(GOLDEN_DIR, fileName);
    if (fs.existsSync(goldenFileName)) {
      if (compareFile(tmpFileName, goldenFileName)) {
        console.log(`${SUCCESS_PREFIX} ${suffix}: ${tmpFileName} matches ${goldenFileName}`);
        return 0;
      } else {
        console.log(`${FAILURE_PREFIX} ${suffix}: ${tmpFileName} does not match ${goldenFileName}`);
      }
    } else {
      console.log(`File ${goldenFileName} not found!`);
    }
  } else {
    console.log(`File ${tmpFileName} not found!`);
  }
  return 1;
}

/**
 * Run generator tests inside a browser and check the results.
 */
function generators(done) {
  fs.mkdirSync(TMP_DIR);

  execSync('node tests/generators/run_generators_in_browser.js');

  const generatorSuffixes = ['js', 'py', 'dart', 'lua', 'php'];
  let failed = 0;
  generatorSuffixes.forEach(suffix => {
    failed += checkResult(suffix);
  });

  // Clean up.
  rimraf.sync(TMP_DIR);

  if (failed === 0) {
    console.log(`${BOLD_GREEN}All generator tests passed.${ANSI_RESET}`);
    done();
  } else {
    console.log(`${BOLD_RED}Failures in ${failed} generator tests.${ANSI_RESET}`);
  }
}

/**
 * Run the package build process, as Node tests depend on it.
 */
function package() {
  return runTestCommand('npm run package');
}

/**
 * Run Node tests.
 */
function node() {
  return runTestCommand('mocha tests/node --config tests/node/.mocharc.js');
}

/**
 * Attempt advanced compilation of a Blockly app.
 */
function advancedCompile() {
  return runTestCommand('npm run test:compile:advanced');
}

// Indivisual tasks.
const testTasks = {
  eslint,
  buildDebug,
  renamings,
  compress,
  metadata,
  mocha,
  generators,
  package,
  node,
  advancedCompile,
};

// Run all tests in sequence.
const test = gulp.series(
  Object.values(testTasks)
);

module.exports = {
  test,
  // Export indivisual tasks.
  ...testTasks,
};
