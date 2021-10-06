/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Any gulp helper functions.
 */

// Clears the require cache to ensure the package.json is up to date.
function getPackageJson() {
  delete require.cache[require.resolve('../../package.json')]
  return require('../../package.json');
}

module.exports = {
  getPackageJson: getPackageJson
}
