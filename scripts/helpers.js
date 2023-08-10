/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper functions for build/test.
 */
/* eslint-env node */

const path = require('path');

/**
 * Replaces OS-specific path with POSIX style path.
 * Simplified implementation based on
 * https://stackoverflow.com/a/63251716/4969945
 *
 * @param {string} target target path
 * @return {string} posix path
 */
function posixPath(target) {
  return target.split(path.sep).join(path.posix.sep);
}

module.exports = {
  posixPath,
};
