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
 * Escape regular expression pattern by making the following replacements:
 *  * single backslash -> double backslash
 * @param {string} pattern regular expression pattern
 * @return {string} escaped regular expression pattern
 */
function escapePattern(pattern) {
  return pattern.replace(/\\/g, '\\\\');
}

/**
 * Replaces OS-specific path with POSIX style path.
 * @param {string} target target path
 * @return {string} normalized path
 */
function normalizePath(target) {
  const osSpecificSep = new RegExp(escapePattern(path.sep), 'g');
  return target.replace(osSpecificSep, path.posix.sep);
}

module.exports = {
  normalizePath,
};
