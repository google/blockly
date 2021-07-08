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
module.exports = {
  // Directory to write compiled output to.
  BUILD_DIR: 'build',

  // Directory in which to assemble (and from which to publish) the
  // blockly npm package.
  RELEASE_DIR: 'dist',
};
