/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for coordinate manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
'use strict';

/**
 * Utility methods for coordinate manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @class
 */
goog.module('Blockly.utils.Coordinate');

/**
 * Class for representing coordinates and positions.
 * @alias Blockly.utils.Coordinate
 */
const Coordinate = class {
  /**
   * @param {number} x Left.
   * @param {number} y Top.
   */
  constructor(x, y) {
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
  }

  /**
   * Creates a new copy of this coordinate.
   * @return {!Coordinate} A copy of this coordinate.
   */
  clone() {
    return new Coordinate(this.x, this.y);
  }

  /**
   * Scales this coordinate by the given scale factor.
   * @param {number} s The scale factor to use for both x and y dimensions.
   * @return {!Coordinate} This coordinate after scaling.
   */
  scale(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  /**
   * Translates this coordinate by the given offsets.
   * respectively.
   * @param {number} tx The value to translate x by.
   * @param {number} ty The value to translate y by.
   * @return {!Coordinate} This coordinate after translating.
   */
  translate(tx, ty) {
    this.x += tx;
    this.y += ty;
    return this;
  }

  /**
   * Compares coordinates for equality.
   * @param {?Coordinate} a A Coordinate.
   * @param {?Coordinate} b A Coordinate.
   * @return {boolean} True iff the coordinates are equal, or if both are null.
   */
  static equals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Returns the distance between two coordinates.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {number} The distance between `a` and `b`.
   */
  static distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Returns the magnitude of a coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @return {number} The distance between the origin and `a`.
   */
  static magnitude(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  }

  /**
   * Returns the difference between two coordinates as a new
   * Coordinate.
   * @param {!Coordinate|!SVGPoint} a An x/y coordinate.
   * @param {!Coordinate|!SVGPoint} b An x/y coordinate.
   * @return {!Coordinate} A Coordinate representing the difference
   *     between `a` and `b`.
   */
  static difference(a, b) {
    return new Coordinate(a.x - b.x, a.y - b.y);
  }

  /**
   * Returns the sum of two coordinates as a new Coordinate.
   * @param {!Coordinate|!SVGPoint} a An x/y coordinate.
   * @param {!Coordinate|!SVGPoint} b An x/y coordinate.
   * @return {!Coordinate} A Coordinate representing the sum of
   *     the two coordinates.
   */
  static sum(a, b) {
    return new Coordinate(a.x + b.x, a.y + b.y);
  }
};

exports.Coordinate = Coordinate;
