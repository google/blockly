/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for coordinate manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.utils.Coordinate
 * @namespace
 */
goog.provide('Blockly.utils.Coordinate');


/**
 * Class for representing coordinates and positions.
 * @param {number} x Left.
 * @param {number} y Top.
 * @struct
 * @constructor
 */
Blockly.utils.Coordinate = function(x, y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = x;

  /**
   * Y-value
   * @type {number}
   */
  this.y = y;
};

/**
 * Compares coordinates for equality.
 * @param {?Blockly.utils.Coordinate} a A Coordinate.
 * @param {?Blockly.utils.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
Blockly.utils.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};

/**
 * Returns the distance between two coordinates.
 * @param {!Blockly.utils.Coordinate} a A Coordinate.
 * @param {!Blockly.utils.Coordinate} b A Coordinate.
 * @return {number} The distance between `a` and `b`.
 */
Blockly.utils.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Returns the magnitude of a coordinate.
 * @param {!Blockly.utils.Coordinate} a A Coordinate.
 * @return {number} The distance between the origin and `a`.
 */
Blockly.utils.Coordinate.magnitude = function(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
};

/**
 * Returns the difference between two coordinates as a new
 * Blockly.utils.Coordinate.
 * @param {!Blockly.utils.Coordinate|!SVGPoint} a An x/y coordinate.
 * @param {!Blockly.utils.Coordinate|!SVGPoint} b An x/y coordinate.
 * @return {!Blockly.utils.Coordinate} A Coordinate representing the difference
 *     between `a` and `b`.
 */
Blockly.utils.Coordinate.difference = function(a, b) {
  return new Blockly.utils.Coordinate(a.x - b.x, a.y - b.y);
};

/**
 * Returns the sum of two coordinates as a new Blockly.utils.Coordinate.
 * @param {!Blockly.utils.Coordinate|!SVGPoint} a An x/y coordinate.
 * @param {!Blockly.utils.Coordinate|!SVGPoint} b An x/y coordinate.
 * @return {!Blockly.utils.Coordinate} A Coordinate representing the sum of
 *     the two coordinates.
 */
Blockly.utils.Coordinate.sum = function(a, b) {
  return new Blockly.utils.Coordinate(a.x + b.x, a.y + b.y);
};

/**
 * Creates a new copy of this coordinate.
 * @return {!Blockly.utils.Coordinate} A copy of this coordinate.
 */
Blockly.utils.Coordinate.prototype.clone = function() {
  return new Blockly.utils.Coordinate(this.x, this.y);
};

/**
 * Scales this coordinate by the given scale factor.
 * @param {number} s The scale factor to use for both x and y dimensions.
 * @return {!Blockly.utils.Coordinate} This coordinate after scaling.
 */
Blockly.utils.Coordinate.prototype.scale = function(s) {
  this.x *= s;
  this.y *= s;
  return this;
};

/**
 * Translates this coordinate by the given offsets.
 * respectively.
 * @param {number} tx The value to translate x by.
 * @param {number} ty The value to translate y by.
 * @return {!Blockly.utils.Coordinate} This coordinate after translating.
 */
Blockly.utils.Coordinate.prototype.translate = function(tx, ty) {
  this.x += tx;
  this.y += ty;
  return this;
};
