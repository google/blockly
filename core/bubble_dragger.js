/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for dragging a bubble visually.
 */
'use strict';

/**
 * Methods for dragging a bubble visually.
 * @class
 */
goog.module('Blockly.BubbleDragger');

const eventUtils = goog.require('Blockly.Events.utils');
const svgMath = goog.require('Blockly.utils.svgMath');
/* eslint-disable-next-line no-unused-vars */
const {BlockDragSurfaceSvg} = goog.requireType('Blockly.BlockDragSurfaceSvg');
/* eslint-disable-next-line no-unused-vars */
const {CommentMove} = goog.requireType('Blockly.Events.CommentMove');
const {ComponentManager} = goog.require('Blockly.ComponentManager');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IBubble} = goog.requireType('Blockly.IBubble');
/* eslint-disable-next-line no-unused-vars */
const {IDeleteArea} = goog.requireType('Blockly.IDeleteArea');
/* eslint-disable-next-line no-unused-vars */
const {IDragTarget} = goog.requireType('Blockly.IDragTarget');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceCommentSvg} = goog.requireType('Blockly.WorkspaceCommentSvg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Bubble');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.CommentMove');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');


/**
 * Class for a bubble dragger.  It moves things on the bubble canvas around the
 * workspace when they are being dragged by a mouse or touch.  These can be
 * block comments, mutators, warnings, or workspace comments.
 * @alias Blockly.BubbleDragger
 */
const BubbleDragger = class {
  /**
   * @param {!IBubble} bubble The item on the bubble canvas to drag.
   * @param {!WorkspaceSvg} workspace The workspace to drag on.
   */
  constructor(bubble, workspace) {
    /**
     * The item on the bubble canvas that is being dragged.
     * @type {!IBubble}
     * @private
     */
    this.draggingBubble_ = bubble;

    /**
     * The workspace on which the bubble is being dragged.
     * @type {!WorkspaceSvg}
     * @private
     */
    this.workspace_ = workspace;

    /**
     * Which drag target the mouse pointer is over, if any.
     * @type {?IDragTarget}
     * @private
     */
    this.dragTarget_ = null;

    /**
     * Whether the bubble would be deleted if dropped immediately.
     * @type {boolean}
     * @private
     */
    this.wouldDeleteBubble_ = false;

    /**
     * The location of the top left corner of the dragging bubble's body at the
     * beginning of the drag, in workspace coordinates.
     * @type {!Coordinate}
     * @private
     */
    this.startXY_ = this.draggingBubble_.getRelativeToSurfaceXY();

    /**
     * The drag surface to move bubbles to during a drag, or null if none should
     * be used.  Block dragging and bubble dragging use the same surface.
     * @type {BlockDragSurfaceSvg}
     * @private
     */
    this.dragSurface_ =
        svgMath.is3dSupported() && !!workspace.getBlockDragSurface() ?
        workspace.getBlockDragSurface() :
        null;
  }

  /**
   * Sever all links from this object.
   * @package
   * @suppress {checkTypes}
   */
  dispose() {
    this.draggingBubble_ = null;
    this.workspace_ = null;
    this.dragSurface_ = null;
  }

  /**
   * Start dragging a bubble.  This includes moving it to the drag surface.
   * @package
   */
  startBubbleDrag() {
    if (!eventUtils.getGroup()) {
      eventUtils.setGroup(true);
    }

    this.workspace_.setResizesEnabled(false);
    this.draggingBubble_.setAutoLayout(false);
    if (this.dragSurface_) {
      this.moveToDragSurface_();
    }

    this.draggingBubble_.setDragging && this.draggingBubble_.setDragging(true);
  }

  /**
   * Execute a step of bubble dragging, based on the given event.  Update the
   * display accordingly.
   * @param {!Event} e The most recent move event.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at the start of the drag, in pixel units.
   * @package
   */
  dragBubble(e, currentDragDeltaXY) {
    const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
    const newLoc = Coordinate.sum(this.startXY_, delta);
    this.draggingBubble_.moveDuringDrag(this.dragSurface_, newLoc);

    const oldDragTarget = this.dragTarget_;
    this.dragTarget_ = this.workspace_.getDragTarget(e);

    const oldWouldDeleteBubble = this.wouldDeleteBubble_;
    this.wouldDeleteBubble_ = this.shouldDelete_(this.dragTarget_);
    if (oldWouldDeleteBubble !== this.wouldDeleteBubble_) {
      // Prevent unnecessary add/remove class calls.
      this.updateCursorDuringBubbleDrag_();
    }

    // Call drag enter/exit/over after wouldDeleteBlock is called in
    // shouldDelete_
    if (this.dragTarget_ !== oldDragTarget) {
      oldDragTarget && oldDragTarget.onDragExit(this.draggingBubble_);
      this.dragTarget_ && this.dragTarget_.onDragEnter(this.draggingBubble_);
    }
    this.dragTarget_ && this.dragTarget_.onDragOver(this.draggingBubble_);
  }

  /**
   * Whether ending the drag would delete the bubble.
   * @param {?IDragTarget} dragTarget The drag target that the bubblee is
   *     currently over.
   * @return {boolean} Whether dropping the bubble immediately would delete the
   *    block.
   * @private
   */
  shouldDelete_(dragTarget) {
    if (dragTarget) {
      const componentManager = this.workspace_.getComponentManager();
      const isDeleteArea = componentManager.hasCapability(
          dragTarget.id, ComponentManager.Capability.DELETE_AREA);
      if (isDeleteArea) {
        return (/** @type {!IDeleteArea} */ (dragTarget))
            .wouldDelete(this.draggingBubble_, false);
      }
    }
    return false;
  }

  /**
   * Update the cursor (and possibly the trash can lid) to reflect whether the
   * dragging bubble would be deleted if released immediately.
   * @private
   */
  updateCursorDuringBubbleDrag_() {
    this.draggingBubble_.setDeleteStyle(this.wouldDeleteBubble_);
  }

  /**
   * Finish a bubble drag and put the bubble back on the workspace.
   * @param {!Event} e The mouseup/touchend event.
   * @param {!Coordinate} currentDragDeltaXY How far the pointer has
   *     moved from the position at the start of the drag, in pixel units.
   * @package
   */
  endBubbleDrag(e, currentDragDeltaXY) {
    // Make sure internal state is fresh.
    this.dragBubble(e, currentDragDeltaXY);

    const preventMove = this.dragTarget_ &&
        this.dragTarget_.shouldPreventMove(this.draggingBubble_);
    let newLoc;
    if (preventMove) {
      newLoc = this.startXY_;
    } else {
      const delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
      newLoc = Coordinate.sum(this.startXY_, delta);
    }
    // Move the bubble to its final location.
    this.draggingBubble_.moveTo(newLoc.x, newLoc.y);

    if (this.dragTarget_) {
      this.dragTarget_.onDrop(this.draggingBubble_);
    }

    if (this.wouldDeleteBubble_) {
      // Fire a move event, so we know where to go back to for an undo.
      this.fireMoveEvent_();
      this.draggingBubble_.dispose(false, true);
    } else {
      // Put everything back onto the bubble canvas.
      if (this.dragSurface_) {
        this.dragSurface_.clearAndHide(this.workspace_.getBubbleCanvas());
      }
      if (this.draggingBubble_.setDragging) {
        this.draggingBubble_.setDragging(false);
      }
      this.fireMoveEvent_();
    }
    this.workspace_.setResizesEnabled(true);

    eventUtils.setGroup(false);
  }

  /**
   * Fire a move event at the end of a bubble drag.
   * @private
   */
  fireMoveEvent_() {
    if (this.draggingBubble_.isComment) {
      // TODO (adodson): Resolve build errors when requiring
      // WorkspaceCommentSvg.
      const event = /** @type {!CommentMove} */
          (new (eventUtils.get(eventUtils.COMMENT_MOVE))(
              /** @type {!WorkspaceCommentSvg} */ (this.draggingBubble_)));
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
   * @param {!Coordinate} pixelCoord A coordinate with x and y
   *     values in CSS pixel units.
   * @return {!Coordinate} The input coordinate divided by the
   *     workspace scale.
   * @private
   */
  pixelsToWorkspaceUnits_(pixelCoord) {
    const result = new Coordinate(
        pixelCoord.x / this.workspace_.scale,
        pixelCoord.y / this.workspace_.scale);
    if (this.workspace_.isMutator) {
      // If we're in a mutator, its scale is always 1, purely because of some
      // oddities in our rendering optimizations.  The actual scale is the same
      // as the scale on the parent workspace. Fix that for dragging.
      const mainScale = this.workspace_.options.parentWorkspace.scale;
      result.scale(1 / mainScale);
    }
    return result;
  }

  /**
   * Move the bubble onto the drag surface at the beginning of a drag.  Move the
   * drag surface to preserve the apparent location of the bubble.
   * @private
   */
  moveToDragSurface_() {
    this.draggingBubble_.moveTo(0, 0);
    this.dragSurface_.translateSurface(this.startXY_.x, this.startXY_.y);
    // Execute the move on the top-level SVG component.
    this.dragSurface_.setBlocksAndShow(this.draggingBubble_.getSvgRoot());
  }
};

exports.BubbleDragger = BubbleDragger;
