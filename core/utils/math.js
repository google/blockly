/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for math.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
'use strict';

/**
 * Utility methods for math.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.math
 */
goog.module('Blockly.utils.math');


/**
 * Converts degrees to radians.
 * Copied from Closure's goog.math.toRadians.
 * @param {number} angleDegrees Angle in degrees.
 * @return {number} Angle in radians.
 * @alias Blockly.utils.math.toRadians
 */
const toRadians = function(angleDegrees) {
  return angleDegrees * Math.PI / 180;
};
exports.toRadians = toRadians;

/**
 * Converts radians to degrees.
 * Copied from Closure's goog.math.toDegrees.
 * @param {number} angleRadians Angle in radians.
 * @return {number} Angle in degrees.
 * @alias Blockly.utils.math.toDegrees
 */
const toDegrees = function(angleRadians) {
  return angleRadians * 180 / Math.PI;
};
exports.toDegrees = toDegrees;

/**
 * Clamp the provided number between the lower bound and the upper bound.
 * @param {number} lowerBound The desired lower bound.
 * @param {number} number The number to clamp.
 * @param {number} upperBound The desired upper bound.
 * @return {number} The clamped number.
 * @alias Blockly.utils.math.clamp
 */
const clamp = function(lowerBound, number, upperBound) {
  if (upperBound < lowerBound) {
    const temp = upperBound;
    upperBound = lowerBound;
    lowerBound = temp;
  }
  return Math.max(lowerBound, Math.min(number, upperBound));
};
exports.clamp = clamp;
