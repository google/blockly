/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.IDraggable

import {Coordinate} from '../utils/coordinate';
import {IDragTarget} from './i_drag_target';

/**
 * Represents an object that can be dragged.
 */
export interface IDraggable {
  /** Returns true if the element is currently movable. False otherwise. */
  isMovable(e?: PointerEvent): boolean;

  /** Returns the current location of the draggable in workspace coordinates. */
  getLocation(): Coordinate;

  /**
   * Handles any drag startup (e.g moving elements to the front
   * of the workspace).
   */
  startDrag(e?: PointerEvent): void;

  /**
   * Handles moving elements to the new location, and updating any visuals
   * based on that (e.g connection previews for blocks).
   */
  drag(newLoc: Coordinate, target: IDragTarget, e?: PointerEvent): void;

  /** Handles any drag cleanup. */
  endDrag(e?: PointerEvent): void;
}
