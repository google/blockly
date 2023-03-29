/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
import type {Coordinate} from '../utils/coordinate.js';
import type {BlockDragSurfaceSvg} from '../block_drag_surface.js';
goog.declareModuleId('Blockly.IBubble');

import type {IContextMenu} from './i_contextmenu.js';
import type {IDraggable} from './i_draggable.js';


/**
 * A bubble interface.
 */
export interface IBubble extends IDraggable, IContextMenu {
  /**
   * Return the coordinates of the top-left corner of this bubble's body
   * relative to the drawing surface's origin (0,0), in workspace units.
   *
   * @returns Object with .x and .y properties.
   */
  getRelativeToSurfaceXY(): Coordinate;

  /**
   * Return the root node of the bubble's SVG group.
   *
   * @returns The root SVG node of the bubble's group.
   */
  getSvgRoot(): SVGElement;

  /**
   * Set whether auto-layout of this bubble is enabled.  The first time a bubble
   * is shown it positions itself to not cover any blocks.  Once a user has
   * dragged it to reposition, it renders where the user put it.
   *
   * @param enable True if auto-layout should be enabled, false otherwise.
   */
  setAutoLayout(enable: boolean): void;

  /**
   * Sets whether or not this bubble is being dragged.
   *
   * @param adding True if dragging, false otherwise.
   */
  setDragging(dragging: boolean): void;

  /**
   * Move this bubble during a drag, taking into account whether or not there is
   * a drag surface.
   *
   * @param dragSurface The surface that carries rendered items during a drag,
   *     or null if no drag surface is in use.
   * @param newLoc The location to translate to, in workspace coordinates.
   */
  moveDuringDrag(dragSurface: BlockDragSurfaceSvg|null, newLoc: Coordinate):
      void;

  /**
   * Move the bubble to the specified location in workspace coordinates.
   *
   * @param x The x position to move to.
   * @param y The y position to move to.
   */
  moveTo(x: number, y: number): void;

  /**
   * Update the style of this bubble when it is dragged over a delete area.
   *
   * @param enable True if the bubble is about to be deleted, false otherwise.
   */
  setDeleteStyle(enable: boolean): void;

  /** Dispose of this bubble. */
  dispose(): void;
}
