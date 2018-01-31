/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Methods for dragging a comment visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.CommentDragger');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a comment dragger.  It moves comments around the workspace when
 * they are being dragged by a mouse or touch.
 * @param {!Blockly.WorkspaceCommentSvg} comment The comment to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.CommentDragger = function(comment, workspace) {
  /**
   * The top comment in the stack that is being dragged.
   * @type {!Blockly.WorkspaceCommentSvg}
   * @private
   */
  this.draggingComment_ = comment;

  /**
   * The workspace on which the comment is being dragged.
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
   * Whether the comment would be deleted if dropped immediately.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteComment_ = false;

  /**
   * The location of the top left corner of the dragging comment at the
   * beginning of the drag in workspace coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = this.draggingComment_.getRelativeToSurfaceXY();
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.CommentDragger.prototype.dispose = function() {
  this.draggingComment_ = null;
  this.workspace_ = null;
};

/**
 * Start dragging a comment.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @package
 */
Blockly.CommentDragger.prototype.startCommentDrag = function(
    /* eslint-disable no-unused-vars */ currentDragDeltaXY
    /* eslint-enable no-unused-vars */) {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }

  this.workspace_.setResizesEnabled(false);

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

  this.draggingComment_.translate(newLoc.x, newLoc.y);
  this.draggingComment_.setDragging(true);
  // For future consideration: we may be able to put moveToDragSurface inside
  // the comment dragger, which would also let the comment not track the
  // drag surface.
  this.draggingComment_.moveToDragSurface_();

  if (this.workspace_.toolbox_) {
    this.workspace_.toolbox_.addStyle('blocklyToolboxDelete');
  }
};

/**
 * Execute a step of comment dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.CommentDragger.prototype.dragComment = function(e, currentDragDeltaXY) {
  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

  this.draggingComment_.moveDuringDrag(newLoc);

  this.deleteArea_ = this.workspace_.isDeleteArea(e);

  this.updateCursorDuringCommentDrag_();
};

/**
 * Finish a comment drag and put the comment back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.CommentDragger.prototype.endCommentDrag = function(e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragComment(e, currentDragDeltaXY);

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
  this.draggingComment_.moveOffDragSurface_(newLoc);

  var deleted = this.maybeDeleteComment_();
  if (!deleted) {
    // These are expensive and don't need to be done if we're deleting.
    this.draggingComment_.setDragging(false);
    this.draggingComment_.render();
    this.fireMoveEvent_();
  }
  this.workspace_.setResizesEnabled(true);

  if (this.workspace_.toolbox_) {
    this.workspace_.toolbox_.removeStyle('blocklyToolboxDelete');
  }
  Blockly.Events.setGroup(false);
};

/**
 * Fire a move event at the end of a comment drag.
 * @private
 */
Blockly.CommentDragger.prototype.fireMoveEvent_ = function() {
  // TODO: Make comment events work.
  // var event = new Blockly.Events.BlockMove(this.draggingComment_);
  // event.oldCoordinate = this.startXY_;
  // event.recordNew();
  // Blockly.Events.fire(event);
};

/**
 * Shut the trash can and, if necessary, delete the dragging comment.
 * Should be called at the end of a comment drag.
 * @return {boolean} whether the comment was deleted.
 * @private
 */
Blockly.CommentDragger.prototype.maybeDeleteComment_ = function() {
  // TODO: Make deleting by dragging work.
  return false;
  // var trashcan = this.workspace_.trashcan;

  // if (this.wouldDeleteBlock_) {
  //   if (trashcan) {
  //     goog.Timer.callOnce(trashcan.close, 100, trashcan);
  //   }
  //   // Fire a move event, so we know where to go back to for an undo.
  //   this.fireMoveEvent_();
  //   this.draggingComment_.dispose(false, true);
  // } else if (trashcan) {
  //   // Make sure the trash can is closed.
  //   trashcan.close();
  // }
  // return this.wouldDeleteBlock_;
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging comment would be deleted if released immediately.
 * @private
 */
Blockly.CommentDragger.prototype.updateCursorDuringCommentDrag_ = function() {
  // TODO: Make dragging over the trashcan or toolbox work.

  // this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
  // var trashcan = this.workspace_.trashcan;
  // if (this.wouldDeleteBlock_) {
  //   this.draggingComment_.setDeleteStyle(true);
  //   if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
  //     trashcan.setOpen_(true);
  //   }
  // } else {
  //   this.draggingComment_.setDeleteStyle(false);
  //   if (trashcan) {
  //     trashcan.setOpen_(false);
  //   }
  // }
};

/**
 * Convert a coordinate object from pixels to workspace units, including a
 * correction for mutator workspaces.
 * This function does not consider differing origins.  It simply scales the
 * input's x and y values.
 * @param {!goog.math.Coordinate} pixelCoord A coordinate with x and y values
 *     in css pixel units.
 * @return {!goog.math.Coordinate} The input coordinate divided by the workspace
 *     scale.
 * @private
 */
Blockly.CommentDragger.prototype.pixelsToWorkspaceUnits_ = function(pixelCoord) {
  var result = new goog.math.Coordinate(pixelCoord.x / this.workspace_.scale,
      pixelCoord.y / this.workspace_.scale);
  if (this.workspace_.isMutator) {
    // If we're in a mutator, its scale is always 1, purely because of some
    // oddities in our rendering optimizations.  The actual scale is the same as
    // the scale on the parent workspace.
    // Fix that for dragging.
    var mainScale = this.workspace_.options.parentWorkspace.scale;
    result = result.scale(1 / mainScale);
  }
  return result;
};
