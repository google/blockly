/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
import type {Rect} from '../utils/rect.js';
goog.declareModuleId('Blockly.IBoundedElement');

/**
 * A bounded element interface.
 */
export interface IBoundedElement {
  /**
   * Returns the coordinates of a bounded element describing the dimensions of
   * the element. Coordinate system: workspace coordinates.
   *
   * @returns Object with coordinates of the bounded element.
   */
  getBoundingRectangle(): Rect;

  /**
   * Move the element by a relative offset.
   *
   * @param dx Horizontal offset in workspace units.
   * @param dy Vertical offset in workspace units.
   */
  moveBy(dx: number, dy: number): void;
}
