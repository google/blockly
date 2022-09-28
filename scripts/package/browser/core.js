/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly core module for the browser. It includes blockly.js
 *               and adds a helper method for setting the locale.
 */

/* eslint-disable */
'use strict';

// Add a helper method to set the Blockly locale.
Blockly.setLocale = function (locale) {
  Object.keys(locale).forEach(function (k) {
    Blockly.Msg[k] = locale[k];
  });
};
