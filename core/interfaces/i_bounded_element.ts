/** @fileoverview The interface for a bounded element. */


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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for a bounded element.
 * @namespace Blockly.IBoundedElement
 */

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/rect';


/**
 * A bounded element interface.
 * @alias Blockly.IBoundedElement
 */
export interface IBoundedElement {
  /**
   * Returns the coordinates of a bounded element describing the dimensions of
   * the element. Coordinate system: workspace coordinates.
   * @return Object with coordinates of the bounded element.
   */
  getBoundingRectangle: AnyDuringMigration;

  /**
   * Move the element by a relative offset.
   * @param dx Horizontal offset in workspace units.
   * @param dy Vertical offset in workspace units.
   */
  moveBy: AnyDuringMigration;
}
