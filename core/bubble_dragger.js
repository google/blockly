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
 * @fileoverview Methods for dragging a bubble visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BubbleDragger');

goog.require('Blockly.DraggedConnectionManager');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 * @param {!Blockly.Bubble} bubble The bubble to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.BubbleDragger = function(bubble, workspace) {
  /**
   * The top block in the stack that is being dragged.
   * @type {!Blockly.BlockSvg}
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
   * Object that keeps track of connections on dragged blocks.
   * @type {!Blockly.DraggedConnectionManager}
   * @private
   */
  this.draggedConnectionManager_ = null;
  // new Blockly.DraggedConnectionManager(
  //     this.draggingBubble_);

  /**
   * Which delete area the mouse pointer is over, if any.
   * One of {@link Blockly.DELETE_AREA_TRASH},
   * {@link Blockly.DELETE_AREA_TOOLBOX}, or {@link Blockly.DELETE_AREA_NONE}.
   * @type {?number}
   * @private
   */
  this.deleteArea_ = null;

  /**
   * Whether the block would be deleted if dropped immediately.
   * @type {boolean}
   * @private
   */
  this.wouldDeleteBlock_ = false;

  /**
   * The location of the top left corner of the dragging block at the beginning
   * of the drag in workspace coordinates.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.startXY_ = this.draggingBubble_.getRelativeToSurfaceXY();

  // TODO: validate, getters, etc.
  this.dragSurface_ = workspace.blockDragSurface_;
};

/**
 * Sever all links from this object.
 * @package
 */
Blockly.BubbleDragger.prototype.dispose = function() {
  this.draggingBubble_ = null;
  this.workspace_ = null;
  this.startWorkspace_ = null;
  this.dragIconData_.length = 0;

  if (this.draggedConnectionManager_) {
    this.draggedConnectionManager_.dispose();
    this.draggedConnectionManager_ = null;
  }
};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @package
 */
Blockly.BubbleDragger.prototype.startBubbleDrag = function(currentDragDeltaXY) {
  console.log('starting bubble drag');
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }

  this.workspace_.setResizesEnabled(false);

  // if (this.draggingBubble_.getParent()) {
  //   this.draggingBubble_.unplug();
  //   var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  //   var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

  //   this.draggingBubble_.translate(newLoc.x, newLoc.y);
  //   this.draggingBubble_.disconnectUiEffect();
  // }
  //this.draggingBubble_.setDragging(true);
  // For future consideration: we may be able to put moveToDragSurface inside
  // the block dragger, which would also let the block not track the block drag
  // surface.
  this.draggingBubble_.moveToDragSurface(this.dragSurface_);

  if (this.workspace_.toolbox_) {
    var style = this.draggingBubble_.isDeletable() ? 'blocklyToolboxDelete' :
        'blocklyToolboxGrab';
    this.workspace_.toolbox_.addStyle(style);
  }
};

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BubbleDragger.prototype.dragBubble = function(e, currentDragDeltaXY) {
  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);

  this.draggingBubble_.moveDuringDrag(this.dragSurface_, newLoc);
  //this.dragIcons_(delta);

  this.deleteArea_ = this.workspace_.isDeleteArea(e);
  //this.draggedConnectionManager_.update(delta, this.deleteArea_);

  //this.updateCursorDuringBubbleDrag_();
};

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 * @package
 */
Blockly.BubbleDragger.prototype.endBubbleDrag = function(e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragBubble(e, currentDragDeltaXY);
  this.dragIconData_ = [];

  Blockly.BlockSvg.disconnectUiStop_();

  var delta = this.pixelsToWorkspaceUnits_(currentDragDeltaXY);
  var newLoc = goog.math.Coordinate.sum(this.startXY_, delta);
  this.draggingBubble_.moveOffDragSurface(this.dragSurface_, newLoc);

  var deleted = true;//this.maybeDeleteBlock_();
  if (!deleted) {
    // These are expensive and don't need to be done if we're deleting.
    this.draggingBubble_.moveConnections_(delta.x, delta.y);
    this.draggingBubble_.setDragging(false);
    //this.draggedConnectionManager_.applyConnections();
    this.draggingBubble_.render();
    this.fireMoveEvent_();
    this.draggingBubble_.scheduleSnapAndBump();
  }
  this.workspace_.setResizesEnabled(true);

  if (this.workspace_.toolbox_) {
    var style = this.draggingBubble_.isDeletable() ? 'blocklyToolboxDelete' :
        'blocklyToolboxGrab';
    this.workspace_.toolbox_.removeStyle(style);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Fire a move event at the end of a block drag.
 * @private
 */
Blockly.BubbleDragger.prototype.fireMoveEvent_ = function() {
  var event = new Blockly.Events.BlockMove(this.draggingBubble_);
  event.oldCoordinate = this.startXY_;
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Shut the trash can and, if necessary, delete the dragging block.
 * Should be called at the end of a block drag.
 * @return {boolean} whether the block was deleted.
 * @private
 */
Blockly.BubbleDragger.prototype.maybeDeleteBubble_ = function() {
  var trashcan = this.workspace_.trashcan;

  if (this.wouldDeleteBlock_) {
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
    }
    // Fire a move event, so we know where to go back to for an undo.
    this.fireMoveEvent_();
    this.draggingBubble_.dispose(false, true);
  } else if (trashcan) {
    // Make sure the trash can is closed.
    trashcan.close();
  }
  return this.wouldDeleteBlock_;
};

/**
 * Update the cursor (and possibly the trash can lid) to reflect whether the
 * dragging block would be deleted if released immediately.
 * @private
 */
Blockly.BubbleDragger.prototype.updateCursorDuringBubbleDrag_ = function() {
  this.wouldDeleteBlock_ = false; //this.draggedConnectionManager_.wouldDeleteBlock();
  var trashcan = this.workspace_.trashcan;
  if (this.wouldDeleteBlock_) {
    this.draggingBubble_.setDeleteStyle(true);
    if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
      trashcan.setOpen_(true);
    }
  } else {
    this.draggingBubble_.setDeleteStyle(false);
    if (trashcan) {
      trashcan.setOpen_(false);
    }
  }
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
Blockly.BubbleDragger.prototype.pixelsToWorkspaceUnits_ = function(pixelCoord) {
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
