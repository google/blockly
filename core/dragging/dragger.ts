/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IDragTarget} from '../interfaces/i_drag_target.js';
import {IDeletable, isDeletable} from '../interfaces/i_deletable.js';
import {IDragger} from '../interfaces/i_dragger.js';
import {IDraggable} from '../interfaces/i_draggable.js';
import {Coordinate} from '../utils/coordinate.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {ComponentManager} from '../component_manager.js';
import {IDeleteArea} from '../interfaces/i_delete_area.js';
import * as registry from '../registry.js';

export class Dragger implements IDragger {
  protected startLoc: Coordinate;

  protected dragTarget: IDragTarget | null = null;

  constructor(
    protected draggable: IDraggable,
    protected workspace: WorkspaceSvg,
  ) {
    this.startLoc = draggable.getRelativeToSurfaceXY();
  }

  /** Handles any drag startup. */
  onDragStart(e: PointerEvent) {
    this.draggable.startDrag(e);
  }

  /**
   * Handles calculating where the element should actually be moved to.
   *
   * @param totalDelta The total amount in pixel coordinates the mouse has moved
   *     since the start of the drag.
   */
  onDrag(e: PointerEvent, totalDelta: Coordinate) {
    this.moveDraggable(e, totalDelta);

    // Must check `wouldDelete` before calling other hooks on drag targets
    // since we have documented that we would do so.
    if (isDeletable(this.draggable)) {
      this.draggable.setDeleteStyle(
        this.wouldDeleteDraggable(e, this.draggable),
      );
    }
    this.updateDragTarget(e);
  }

  /** Updates the drag target under the pointer (if there is one). */
  protected updateDragTarget(e: PointerEvent) {
    const newDragTarget = this.workspace.getDragTarget(e);
    if (this.dragTarget !== newDragTarget) {
      this.dragTarget?.onDragExit(this.draggable);
      newDragTarget?.onDragEnter(this.draggable);
    }
    newDragTarget?.onDragOver(this.draggable);
    this.dragTarget = newDragTarget;
  }

  /**
   * Calculates the correct workspace coordinate for the movable and tells
   * the draggable to go to that location.
   */
  private moveDraggable(e: PointerEvent, totalDelta: Coordinate) {
    const delta = this.pixelsToWorkspaceUnits(totalDelta);
    const newLoc = Coordinate.sum(this.startLoc, delta);
    this.draggable.drag(newLoc, e);
  }

  /**
   * Returns true if we would delete the draggable if it was dropped
   * at the current location.
   */
  protected wouldDeleteDraggable(
    e: PointerEvent,
    draggable: IDraggable & IDeletable,
  ) {
    const dragTarget = this.workspace.getDragTarget(e);
    if (!dragTarget) return false;

    const componentManager = this.workspace.getComponentManager();
    const isDeleteArea = componentManager.hasCapability(
      dragTarget.id,
      ComponentManager.Capability.DELETE_AREA,
    );
    if (!isDeleteArea) return false;

    return (dragTarget as IDeleteArea).wouldDelete(draggable);
  }

  /** Handles any drag cleanup. */
  onDragEnd(e: PointerEvent) {
    const dragTarget = this.workspace.getDragTarget(e);
    if (dragTarget) {
      this.dragTarget?.onDrop(this.draggable);
    }

    if (this.shouldReturnToStart(e, this.draggable)) {
      this.draggable.revertDrag();
    }

    this.draggable.endDrag(e);

    if (
      isDeletable(this.draggable) &&
      this.wouldDeleteDraggable(e, this.draggable)
    ) {
      this.draggable.dispose();
    }
  }

  /**
   * Returns true if we should return the draggable to its original location
   * at the end of the drag.
   */
  protected shouldReturnToStart(e: PointerEvent, draggable: IDraggable) {
    const dragTarget = this.workspace.getDragTarget(e);
    if (!dragTarget) return false;
    return dragTarget.shouldPreventMove(draggable);
  }

  protected pixelsToWorkspaceUnits(pixelCoord: Coordinate): Coordinate {
    const result = new Coordinate(
      pixelCoord.x / this.workspace.scale,
      pixelCoord.y / this.workspace.scale,
    );
    if (this.workspace.isMutator) {
      // If we're in a mutator, its scale is always 1, purely because of some
      // oddities in our rendering optimizations.  The actual scale is the same
      // as the scale on the parent workspace. Fix that for dragging.
      const mainScale = this.workspace.options.parentWorkspace!.scale;
      result.scale(1 / mainScale);
    }
    return result;
  }
}

registry.register(registry.Type.BLOCK_DRAGGER, registry.DEFAULT, Dragger);
