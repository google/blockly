/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Gulp tasks to check the licenses of Blockly dependencies.
 */

const jsgl = require('js-green-licenses');

function checkLicenses() {
  const checker = new jsgl.LicenseChecker();
  checker.setDefaultHandlers();
  return checker.checkLocalDirectory('.');
};

module.exports = {
  checkLicenses: checkLicenses
};
