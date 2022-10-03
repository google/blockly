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
 * Escape regular expression pattern
 * @param {string} pattern regular expression pattern
 * @return {string} escaped regular expression pattern
 */
function escapeRegex(pattern) {
  return pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Replaces OS-specific path with POSIX style path.
 * @param {string} target target path
 * @return {string} posix path
 */
function posixPath(target) {
  const osSpecificSep = new RegExp(escapeRegex(path.sep), 'g');
  return target.replace(osSpecificSep, path.posix.sep);
}

module.exports = {
  posixPath,
};
