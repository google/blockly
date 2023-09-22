/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Coordinate} from '../utils/coordinate.js';

// Former goog.module ID: Blockly.IMovable

/**
 * The interface for an object that is movable.
 */
export interface IMovable {
  /**
   * Get whether this is movable or not.
   *
   * @returns True if movable.
   */
  isMovable(): boolean;

  /**
   * Return the coordinates of the top-left corner of this movable object
   *  relative to the drawing surface's origin (0,0), in workspace units.
   *
   * @returns Object with .x and .y properties.
   */
  getRelativeToSurfaceXY(): Coordinate;
}
