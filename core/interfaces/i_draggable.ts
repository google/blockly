/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Coordinate} from '../utils/coordinate';
import {IDragTarget} from './i_drag_target';

/**
 * Represents an object that can be dragged.
 */
export interface IDraggable extends IDragStrategy {
  /** Returns true iff the element is currently movable. */
  isMovable(): boolean;

  /**
   * Returns the current location of the draggable in workspace
   * coordinates.
   *
   * @returns Coordinate of current location on workspace.
   */
  getLocation(): Coordinate;
}

/**
 * Represents an object that can be dragged.
 */
export interface IDragStrategy {
  /**
   * Handles any drag startup (e.g moving elements to the front of the
   * workspace).
   *
   * @param e PointerEvent that started the drag; could be used to
   *     check modifier keys, etc.  May be missing when dragging is
   *     triggered programatically rather than by user.
   */
  startDrag(e?: PointerEvent): void;

  /**
   * Handles moving elements to the new location, and updating any
   * visuals based on that (e.g connection previews for blocks).
   *
   * @param newLoc Workspace coordinate to which the draggable has
   *     been dragged.
   * @param e PointerEvent that continued the drag.  Should be used to
   *     look up any IDragTarget the pointer is over; could also be
   *     used to check modifier keys, etc.
   * @param target The drag target the pointer is over, if any.  Could
   *     be supplied as an alternative to providing a PointerEvent for
   *     programatic drags.
   */
  drag(newLoc: Coordinate, e?: PointerEvent): void;
  drag(newLoc: Coordinate, target: IDragTarget): void;

  /**
   * Handles any drag cleanup, including e.g. connecting or deleting
   * blocks.
   *
   * @param newLoc Workspace coordinate at which the drag finished.
   *     been dragged.
   * @param e PointerEvent that finished the drag.  Should be used to
   *     look up any IDragTarget the pointer is over; could also be
   *     used to check modifier keys, etc.
   * @param target The drag target the pointer is over, if any.  Could
   *     be supplied as an alternative to providing a PointerEvent for
   *     programatic drags.
   */
  endDrag(newLoc: Coordinate, e?: PointerEvent): void;
  endDrag(newLoc: Coordinate, target: IDragTarget): void;
}
