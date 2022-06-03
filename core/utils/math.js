/**
 * @fileoverview Utility methods for math.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
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
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Utility methods for math.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.math
 */


/**
 * Converts degrees to radians.
 * Copied from Closure's goog.math.toRadians.
 * @param angleDegrees Angle in degrees.
 * @return Angle in radians.
 * @alias Blockly.utils.math.toRadians
 */
export function toRadians(angleDegrees: number): number {
  return angleDegrees * Math.PI / 180;
}

/**
 * Converts radians to degrees.
 * Copied from Closure's goog.math.toDegrees.
 * @param angleRadians Angle in radians.
 * @return Angle in degrees.
 * @alias Blockly.utils.math.toDegrees
 */
export function toDegrees(angleRadians: number): number {
  return angleRadians * 180 / Math.PI;
}

/**
 * Clamp the provided number between the lower bound and the upper bound.
 * @param lowerBound The desired lower bound.
 * @param number The number to clamp.
 * @param upperBound The desired upper bound.
 * @return The clamped number.
 * @alias Blockly.utils.math.clamp
 */
export function clamp(
  lowerBound: number, number: number, upperBound: number): number {
  if (upperBound < lowerBound) {
    const temp = upperBound;
    upperBound = lowerBound;
    lowerBound = temp;
  }
  return Math.max(lowerBound, Math.min(number, upperBound));
}
