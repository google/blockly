/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for rectangle manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.Rect
 * @namespace
 */
goog.provide('Blockly.utils.Rect');


/**
 * Class for representing rectangular regions.
 * @param {number} top Top.
 * @param {number} bottom Bottom.
 * @param {number} left Left.
 * @param {number} right Right.
 * @struct
 * @constructor
 */
Blockly.utils.Rect = function(top, bottom, left, right) {
  /** @type {number} */
  this.top = top;

  /** @type {number} */
  this.bottom = bottom;

  /** @type {number} */
  this.left = left;

  /** @type {number} */
  this.right = right;
};

/**
 * Tests whether this rectangle contains a x/y coordinate.
 *
 * @param {number} x The x coordinate to test for containment.
 * @param {number} y The y coordinate to test for containment.
 * @return {boolean} Whether this rectangle contains given coordinate.
 */
Blockly.utils.Rect.prototype.contains = function(x, y) {
  return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
};
