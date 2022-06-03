/** @fileoverview The interface for a bubble. */


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
 * The interface for a bubble.
 * @namespace Blockly.IBubble
 */

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../block_drag_surface';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/coordinate';

/* eslint-disable-next-line no-unused-vars */
import { IContextMenu } from './i_contextmenu';
/* eslint-disable-next-line no-unused-vars */
import { IDraggable } from './i_draggable';


/**
 * A bubble interface.
 * @alias Blockly.IBubble
 */
export interface IBubble extends IDraggable, IContextMenu {
  /**
   * Return the coordinates of the top-left corner of this bubble's body
   * relative to the drawing surface's origin (0,0), in workspace units.
   * @return Object with .x and .y properties.
   */
  getRelativeToSurfaceXY: AnyDuringMigration;

  /**
   * Return the root node of the bubble's SVG group.
   * @return The root SVG node of the bubble's group.
   */
  getSvgRoot: AnyDuringMigration;

  /**
   * Set whether auto-layout of this bubble is enabled.  The first time a bubble
   * is shown it positions itself to not cover any blocks.  Once a user has
   * dragged it to reposition, it renders where the user put it.
   * @param enable True if auto-layout should be enabled, false otherwise.
   */
  setAutoLayout: AnyDuringMigration;

  /**
   * Triggers a move callback if one exists at the end of a drag.
   * @param adding True if adding, false if removing.
   */
  setDragging: AnyDuringMigration;

  /**
   * Move this bubble during a drag, taking into account whether or not there is
   * a drag surface.
   * @param dragSurface The surface that carries rendered items during a drag,
   *     or null if no drag surface is in use.
   * @param newLoc The location to translate to, in workspace coordinates.
   */
  moveDuringDrag: AnyDuringMigration;

  /**
   * Move the bubble to the specified location in workspace coordinates.
   * @param x The x position to move to.
   * @param y The y position to move to.
   */
  moveTo: AnyDuringMigration;

  /**
   * Update the style of this bubble when it is dragged over a delete area.
   * @param enable True if the bubble is about to be deleted, false otherwise.
   */
  setDeleteStyle: AnyDuringMigration;

  /** Dispose of this bubble. */
  dispose: () => void;
}
