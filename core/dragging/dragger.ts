/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IDragger} from '../interfaces/i_dragger.js';
import {IDraggable} from '../interfaces/i_draggable.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class Dragger implements IDragger {
  /** Starting location of the draggable, in workspace coordinates. */
  private startLoc: Coordinate;

  constructor(
    private draggable: IDraggable,
    private workspace: WorkspaceSvg,
  ) {
    this.startLoc = draggable.getLocation();
  }

  /**
   * Handles any drag startup.
   *
   * @param e PointerEvent that started the drag.
   */
  onDragStart(e: PointerEvent) {
    this.draggable.startDrag(e);
  }

  /**
   * Handles dragging, including calculating where the element should
   * actually be moved to.
   *
   * @param e PointerEvent that continued the drag.
   * @param totalDelta The total distance, in pixels, that the mouse
   *     has moved since the start of the drag.
   */
  onDrag(e: PointerEvent, totalDelta: Coordinate) {
    this.draggable.drag(this.newLoc(totalDelta), e);
  }

  /**
   * Handles any drag cleanup.
   *
   * @param e PointerEvent that finished the drag.
   * @param totalDelta The total distance, in pixels, that the mouse
   *     has moved since the start of the drag.
   */
  onDragEnd(e: PointerEvent, totalDelta: Coordinate) {
    this.draggable.endDrag(this.newLoc(totalDelta), e);
  }

  /**
   * Calculates where the IDraggable should actually be moved to.
   *
   * @param totalDelta The total distance, in pixels, that the mouse
   *     has moved since the start of the drag.
   * @returns The new location, in workspace coordinates.
   */
  protected newLoc(totalDelta: Coordinate): Coordinate {
    const result = new Coordinate(
      totalDelta.x / this.workspace.scale,
      totalDelta.y / this.workspace.scale,
    );
    if (this.workspace.isMutator) {
      // If we're in a mutator, its scale is always 1, purely because of some
      // oddities in our rendering optimizations.  The actual scale is the same
      // as the scale on the parent workspace. Fix that for dragging.
      const mainScale = this.workspace.options.parentWorkspace!.scale;
      result.scale(1 / mainScale);
    }
    result.translate(this.startLoc.x, this.startLoc.y);
    return result;
  }
}
