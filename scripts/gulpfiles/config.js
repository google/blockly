/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common configuration for Gulp scripts.
 */

var path = require('path');

// Paths are all relative to the repository root.  Do not include
// trailing slash.
//
// TODO(#5007): If you modify these values, you must also modify the
// corresponding values in the following files:
//
// - tests/scripts/compile_typings.sh
// - tests/scripts/check_metadata.sh
// - tests/scripts/update_metadata.sh
// - blockly_uncompressed.js (for location of deps.js)
// - tests/bootstrap.js (for location of deps.js)
// - tests/mocha/index.html (for location of deps.mocha.js)

// Directory to write compiled output to.
exports.BUILD_DIR = 'build';

// Dependencies file (for blockly_uncompressed.js):
exports.DEPS_FILE = path.join(exports.BUILD_DIR, 'deps.js');

// Dependencies file (for blockly_uncompressed.js):
exports.TEST_DEPS_FILE = path.join(exports.BUILD_DIR, 'deps.mocha.js');

// Directory to write typings output to.
exports.TYPINGS_BUILD_DIR = path.join(exports.BUILD_DIR, 'typings');

// Directory where typescript compiler output can be found.
// Matches the value in tsconfig.json: outDir
exports.TSC_OUTPUT_DIR = path.join(exports.BUILD_DIR, 'src');

// Directory in which to assemble (and from which to publish) the
// blockly npm package.
exports.RELEASE_DIR = 'dist';
