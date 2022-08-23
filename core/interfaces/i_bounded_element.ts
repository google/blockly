/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interface for a bounded element.
 *
 * @namespace Blockly.IBoundedElement
 */
import * as goog from '../../closure/goog/goog.js';
import type {Rect} from '../utils/rect.js';
goog.declareModuleId('Blockly.IBoundedElement');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
// import '../utils/rect.js';


/**
 * A bounded element interface.
 *
 * @alias Blockly.IBoundedElement
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
