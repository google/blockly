/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods related to arrays.
 */
'use strict';

/**
 * @namespace Blockly.utils.array
 */
goog.module('Blockly.utils.array');


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {!Array} arr Array from which to remove value.
 * @param {*} value Value to remove.
 * @return {boolean} True if an element was removed.
 * @alias Blockly.array.removeElem
 * @package
 */
const removeElem = function(arr, value) {
  const i = arr.indexOf(value);
  if (i === -1) {
    return false;
  }
  arr.splice(i, 1);
  return true;
};
exports.removeElem = removeElem;
