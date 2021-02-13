/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for dragging a bubble visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BubbleDragger');

goog.require('Blockly.Bubble');
goog.require('Blockly.constants');
goog.require('Blockly.Events');
goog.require('Blockly.Events.CommentMove');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');

goog.requireType('Blockly.IBubble');


/**
 * Class for a bubble dragger.  It moves things on the bubble canvas around the
 * workspace when they are being dragged by a mouse or touch.  These can be
 * block comments, mutators, warnings, or workspace comments.
 * @param {!Blockly.IBubble} bubble The item on the bubble canvas to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.BubbleDragger = function(bubble, workspace) {
  /**
   * The item on the bubble canvas that is being dragged.
   * @type {!Blockly.IBubble}
   * @private
   */
  this.draggingBubble_ = bubble;

  /**
   * The workspace on which the bubble is being dragged.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Which delete area the mouse pointer is over, if any.
   * One of {@link Blockly.DELETE_AREA_TRASH},
   * {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null;

  /**
   * Whether the bubble would be deleted if dropped immediately.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBubble_ = false;

  /**
   * The location of the top left corner of the dragging bubble's body at the
   * beginning of the drag, in workspace coordinates.
   * @type {!Blockly.utils.Coordinate}
   * @private
   */
  this.startXY_ = this.draggingBubble_.getRelativeToSurfaceXY();

  /**
   * The drag surface to move bubbles to during a drag, or null if none should
   * be used.  Block dragging and bubble dragging use the same surface.
   * @type {Blockly.BlockDragSurfaceSvg}
   * @private
   */
  this.dragSurface_ =
      Blockly.utils.is3dSupported() && !!workspace.getBlockDragSurface() ?
      workspace.getBlockDragSurface() :
      null;
};

/**
 * Sever all links from this object.
 * @package
 * @suppress {checkTypes}
 */
Blockly.BubbleDragger.prototype.dispose = function() {
  this.draggingBubble_ = null;
  this.workspace_ = null;
  this.dragSurface_ = null;
};

/**
 * Start dragging a bubble.  This includes moving it to the drag surface.
 * @package
 */
Blockly.BubbleDragger.prototype.startBubbleDrag = function() {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }

  this.workspace_.setResizesEnabled(false);
  this.draggingBubble_.setAutoLayout(false);
  if (this.dragSurface_) {
    this.moveToDragSurface_();
  }

  this.draggingBubble_.setDragging && this.draggingBubble_.setDragging(true);

  var toolbox = this.workspace_.getToolbox();
  if (toolbox && typeof toolbox.addStyle == 'function') {
    var style = this.draggingBubble_.isDeletable() ? 'blocklyToolboxDelete' :
                                                     'blocklyToolboxGrab';
    toolbox.addStyle(style);
  }
};

/**
 * Execute a step of bubble dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BubbleDragger.prototype.dragBubble = function(e, currentDragDeltaXY) {
  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);

  this.draggingBubble_.moveDuringDrag(this.dragSurface_, newLoc);

  if (this.draggingBubble_.isDeletable()) {
    this.deleteArea_ = this.workspace_.isDeleteArea(e);
    this.updateCursorDuringBubbleDrag_();
  }
};

/**
 * Shut the trash can and, if necessary, delete the dragging bubble.
 * Should be called at the end of a bubble drag.
 * @return {boolean} Whether the bubble was deleted.
 * @private
 */
Blockly.BubbleDragger.prototype.maybeDeleteBubble_ = function() {
  var trashcan = this.workspace_.trashcan;

  if (this.wouldDeleteBubble_) {
    if (trashcan) {
      setTimeout(trashcan.closeLid.bind(trashcan), 100);
    }
    // Fire a move event, so we know where to go back to for an undo.
    this.fireMoveEvent_();
    this.draggingBubble_.dispose(false, true);
  } else if (trashcan) {
    // Make sure the trash can lid is closed.
    trashcan.closeLid();
  }
  return this.wouldDeleteBubble_;
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging bubble would be deleted if released immediately.
 * @private
 */
Blockly.BubbleDragger.prototype.updateCursorDuringBubbleDrag_ = function() {
  this.wouldDeleteBubble_ = this.deleteArea_ != Blockly.DELETE_AREA_NONE;
  var trashcan = this.workspace_.trashcan;
  if (this.wouldDeleteBubble_) {
    this.draggingBubble_.setDeleteStyle(true);
    if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
      trashcan.setLidOpen(true);
    }
  } else {
    this.draggingBubble_.setDeleteStyle(false);
    if (trashcan) {
      trashcan.setLidOpen(false);
    }
  }
};

/**
 * Finish a bubble drag and put the bubble back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BubbleDragger.prototype.endBubbleDrag = function(
    e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragBubble(e, currentDragDeltaXY);

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = Blockly.utils.Coordinate.sum(this.startXY_, delta);

  // Move the bubble to its final location.
  this.draggingBubble_.moveTo(newLoc.x, newLoc.y);
  var deleted = this.maybeDeleteBubble_();

  if (!deleted) {
    // Put everything back onto the bubble canvas.
    if (this.dragSurface_) {
      this.dragSurface_.clearAndHide(this.workspace_.getBubbleCanvas());
    }

    this.draggingBubble_.setDragging && this.draggingBubble_.setDragging(false);
    this.fireMoveEvent_();
  }
  this.workspace_.setResizesEnabled(true);

  var toolbox = this.workspace_.getToolbox();
  if (toolbox && typeof toolbox.removeStyle == 'function') {
    var style = this.draggingBubble_.isDeletable() ? 'blocklyToolboxDelete' :
                                                     'blocklyToolboxGrab';
    toolbox.removeStyle(style);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Fire a move event at the end of a bubble drag.
 * @private
 */
Blockly.BubbleDragger.prototype.fireMoveEvent_ = function() {
  if (this.draggingBubble_.isComment) {
    var event = new Blockly.Events.CommentMove(
        /** @type {!Blockly.WorkspaceCommentSvg} */ (this.draggingBubble_));
    event.setOldCoordinate(this.startXY_);
    event.recordNew();
    Blockly.Events.fire(event);
  }
  // TODO (fenichel): move events for comments.
  return;
};

/**
 * Convert a coordinate object from pixels to workspace units, including a
 * correction for mutator workspaces.
 * This function does not consider differing origins.  It simply scales the
 * input's x and y values.
 * @param {!Blockly.utils.Coordinate} pixelCoord A coordinate with x and y
 *     values in CSS pixel units.
 * @return {!Blockly.utils.Coordinate} The input coordinate divided by the
 *     workspace scale.
 * @private
 */
Blockly.BubbleDragger.prototype.pixelsToWorkspaceUnits_ = function(pixelCoord) {
  var result = new Blockly.utils.Coordinate(
      pixelCoord.x / this.workspace_.scale,
      pixelCoord.y / this.workspace_.scale);
  if (this.workspace_.isMutator) {
    // If we're in a mutator, its scale is always 1, purely because of some
    // oddities in our rendering optimizations.  The actual scale is the same as
    // the scale on the parent workspace.
    // Fix that for dragging.
    var mainScale = this.workspace_.options.parentWorkspace.scale;
    result.scale(1 / mainScale);
  }
  return result;
};

/**
 * Move the bubble onto the drag surface at the beginning of a drag.  Move the
 * drag surface to preserve the apparent location of the bubble.
 * @private
 */
Blockly.BubbleDragger.prototype.moveToDragSurface_ = function() {
  this.draggingBubble_.moveTo(0, 0);
  this.dragSurface_.translateSurface(this.startXY_.x, this.startXY_.y);
  // Execute the move on the top-level SVG component.
  this.dragSurface_.setBlocksAndShow(this.draggingBubble_.getSvgRoot());
};
