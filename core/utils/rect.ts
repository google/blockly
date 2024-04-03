/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility methods for rectangle manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 *
 * @class
 */
// Former goog.module ID: Blockly.utils.Rect

/**
 * Class for representing rectangular regions.
 */
export class Rect {
  /**
   * @param top Top.
   * @param bottom Bottom.
   * @param left Left.
   * @param right Right.
   */
  constructor(
    public top: number,
    public bottom: number,
    public left: number,
    public right: number,
  ) {}

  getHeight(): number {
    return this.bottom - this.top;
  }

  getWidth(): number {
    return this.right - this.left;
  }

  /**
   * Tests whether this rectangle contains a x/y coordinate.
   *
   * @param x The x coordinate to test for containment.
   * @param y The y coordinate to test for containment.
   * @returns Whether this rectangle contains given coordinate.
   */
  contains(x: number, y: number): boolean {
    return (
      x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
    );
  }

  /**
   * Tests whether this rectangle intersects the provided rectangle.
   * Assumes that the coordinate system increases going down and left.
   *
   * @param other The other rectangle to check for intersection with.
   * @returns Whether this rectangle intersects the provided rectangle.
   */
  intersects(other: Rect): boolean {
    return !(
      this.left > other.right ||
      this.right < other.left ||
      this.top > other.bottom ||
      this.bottom < other.top
    );
  }
}
