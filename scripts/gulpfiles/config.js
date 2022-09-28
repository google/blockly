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
module.exports = {
  // Directory to write compiled output to.
  BUILD_DIR: 'build',

  // Directory in which to assemble (and from which to publish) the
  // blockly npm package.
  RELEASE_DIR: 'dist',

  // Directory to write typings output to.
  TYPINGS_BUILD_DIR: path.join('build', 'typings'),

  // Directory where typescript compiler output can be found.
  // Matches the value in tsconfig.json: outDir
  TSC_OUTPUT_DIR: path.join('build', 'ts'),
};
