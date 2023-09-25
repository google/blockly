/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Methods for dragging a bubble visually.
 *
 * @class
 */
// Former goog.module ID: Blockly.BubbleDragger

import {ComponentManager} from './component_manager.js';
import type {CommentMove} from './events/events_comment_move.js';
import * as eventUtils from './events/utils.js';
import type {IBubble} from './interfaces/i_bubble.js';
import type {IDeleteArea} from './interfaces/i_delete_area.js';
import type {IDragTarget} from './interfaces/i_drag_target.js';
import {Coordinate} from './utils/coordinate.js';
import {WorkspaceCommentSvg} from './workspace_comment_svg.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * Class for a bubble dragger.  It moves things on the bubble canvas around the
 * workspace when they are being dragged by a mouse or touch.  These can be
 * block comments, mutators, warnings, or workspace comments.
 */
export class BubbleDragger {
  /** Which drag target the mouse pointer is over, if any. */
  private dragTarget_: IDragTarget | null = null;

  /** Whether the bubble would be deleted if dropped immediately. */
  private wouldDeleteBubble_ = false;
  private readonly startXY_: Coordinate;

  /**
   * @param bubble The item on the bubble canvas to drag.
   * @param workspace The workspace to drag on.
   */
  constructor(
    private bubble: IBubble,
    private workspace: WorkspaceSvg,
  ) {
    /**
     * The location of the top left corner of the dragging bubble's body at the
     * beginning of the drag, in workspace coordinates.
     */
    this.startXY_ = this.bubble.getRelativeToSurfaceXY();
  }

  /**
   * Start dragging a bubble.
   *
   * @internal
   */
  startBubbleDrag() {
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }

    this.workspace.setResizesEnabled(false);
    if ((this.bubble as AnyDuringMigration).setAutoLayout) {
      (this.bubble as AnyDuringMigration).setAutoLayout(false);
    }

    this.bubble.setDragging && this.bubble.setDragging(true);
  }

  /**
   * Execute a step of bubble dragging, based on the given event.  Update the
   * display accordingly.
   *
   * @param e The most recent move event.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   * @internal
   */
  dragBubble(e: PointerEvent, currentDragDeltaXY: Coordinate) {
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Coordinate.sum(this.startXY_, delta);
    this.bubble.moveDuringDrag(newLoc);

    const oldDragTarget = this.dragTarget_;
    this.dragTarget_ = this.workspace.getDragTarget(e);

    const oldWouldDeleteBubble = this.wouldDeleteBubble_;
    this.wouldDeleteBubble_ = this.shouldDelete_(this.dragTarget_);
    if (oldWouldDeleteBubble !== this.wouldDeleteBubble_) {
      // Prevent unnecessary add/remove class calls.
      this.updateCursorDuringBubbleDrag_();
    }
    // Call drag enter/exit/over after wouldDeleteBlock is called in
    // shouldDelete_
    if (this.dragTarget_ !== oldDragTarget) {
      oldDragTarget && oldDragTarget.onDragExit(this.bubble);
      this.dragTarget_ && this.dragTarget_.onDragEnter(this.bubble);
    }
    this.dragTarget_ && this.dragTarget_.onDragOver(this.bubble);
  }

  /**
   * Whether ending the drag would delete the bubble.
   *
   * @param dragTarget The drag target that the bubblee is currently over.
   * @returns Whether dropping the bubble immediately would delete the block.
   */
  private shouldDelete_(dragTarget: IDragTarget | null): boolean {
    if (dragTarget) {
      const componentManager = this.workspace.getComponentManager();
      const isDeleteArea = componentManager.hasCapability(
        dragTarget.id,
        ComponentManager.Capability.DELETE_AREA,
      );
      if (isDeleteArea) {
        return (dragTarget as IDeleteArea).wouldDelete(this.bubble, false);
      }
    }
    return false;
  }

  /**
   * Update the cursor (and possibly the trash can lid) to reflect whether the
   * dragging bubble would be deleted if released immediately.
   */
  private updateCursorDuringBubbleDrag_() {
    this.bubble.setDeleteStyle(this.wouldDeleteBubble_);
  }

  /**
   * Finish a bubble drag and put the bubble back on the workspace.
   *
   * @param e The pointerup event.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at the start of the drag, in pixel units.
   * @internal
   */
  endBubbleDrag(e: PointerEvent, currentDragDeltaXY: Coordinate) {
    // Make sure internal state is fresh.
    this.dragBubble(e, currentDragDeltaXY);

    const preventMove =
      this.dragTarget_ && this.dragTarget_.shouldPreventMove(this.bubble);
    let newLoc;
    if (preventMove) {
      newLoc = this.startXY_;
    } else {
      const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
      newLoc = Coordinate.sum(this.startXY_, delta);
    }
    // Move the bubble to its final location.
    this.bubble.moveTo(newLoc.x, newLoc.y);

    if (this.dragTarget_) {
      this.dragTarget_.onDrop(this.bubble);
    }

    if (this.wouldDeleteBubble_) {
      // Fire a move event, so we know where to go back to for an undo.
      this.fireMoveEvent_();
      this.bubble.dispose();
    } else {
      // Put everything back onto the bubble canvas.
      if (this.bubble.setDragging) {
        this.bubble.setDragging(false);
      }
      this.fireMoveEvent_();
    }
    this.workspace.setResizesEnabled(true);

    eventUtils.setGroup(false);
  }

  /** Fire a move event at the end of a bubble drag. */
  private fireMoveEvent_() {
    if (this.bubble instanceof WorkspaceCommentSvg) {
      const event = new (eventUtils.get(eventUtils.COMMENT_MOVE))(
        this.bubble,
      ) as CommentMove;
      event.setOldCoordinate(this.startXY_);
      event.recordNew();
      eventUtils.fire(event);
    }
    // TODO (fenichel): move events for comments.
    return;
  }

  /**
   * Convert a coordinate object from pixels to workspace units, including a
   * correction for mutator workspaces.
   * This function does not consider differing origins.  It simply scales the
   * input's x and y values.
   *
   * @param pixelCoord A coordinate with x and y values in CSS pixel units.
   * @returns The input coordinate divided by the workspace scale.
   */
  private pixelsToWorkspaceUnits_(pixelCoord: Coordinate): Coordinate {
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
