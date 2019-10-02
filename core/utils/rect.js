/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
