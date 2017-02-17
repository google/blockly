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
 * @fileoverview Methods for dragging a block visually.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.BlockDragger');

goog.require('Blockly.DraggedConnectionManager');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');


/**
 * Class for a block dragger.  It moves blocks around the workspace when they
 * are being dragged by a mouse or touch.
 * @param {!Blockly.Block} block The block to drag.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace to drag on.
 * @constructor
 */
Blockly.BlockDragger = function(block, workspace) {
  /**
   * The top block in the stack that is being dragged.
   * @type {!Blockly.BlockSvg}
   * @private
   */
  this.draggingBlock_ = block;

  /**
   * The workspace on which the block is being dragged.
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * Object that keeps track of connections on dragged blocks.
   * @type {!Blockly.DraggedConnectionManager}
   * @private
   */
  this.draggedConnectionManager_ = new Blockly.DraggedConnectionManager(
      this.draggingBlock_);

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
   * True if there is a {Blockly.BlockDragSurfaceSvg} that can be used to drag
   * the block.
   * @type {boolean}
   * @private
   */
  this.useDragSurface_ = this.draggingBlock_.useDragSurface_;

  /**
   * The drag surface that should be used to drag the block, or null if none is
   * being used.
   * @type {BlockDragSurfaceSvg}
   * @private
   */
  this.dragSurface_ = this.useDragSurface_ ?
      workspace.blockDragSurface_ : null;

  /**
   * The location of the top left corner of the dragging block at the beginning
   * of the drag, relative to the surface that it started on.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.blockRelativeToSurfaceXY_ = this.draggingBlock_.getRelativeToSurfaceXY();
};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 */
Blockly.BlockDragger.prototype.startBlockDrag = function() {
  if (!Blockly.Events.getGroup()) {
    Blockly.Events.setGroup(true);
  }
  // Workspace.startDrag just records the start position, which we already know.
  // TODO: Figure out where to get the list of bubbles to move when dragging.
  // TODO: Can setResizesEnabled be done at the same time for both types of drags?
  this.workspace_.setResizesEnabled(false);
  // TODO: Add getParent() to blockSvg.
  if (this.draggingBlock_.parentBlock_) {
    this.draggingBlock_.unplug();
    this.draggingBlock_.disconnectUiEffect();
  }
  // TODO: Make setDragging_ package.
  this.draggingBlock_.setDragging_(true);
  // TODO: Consider where moveToDragSurface should live.
  this.draggingBlock_.moveToDragSurface_();
  Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
};

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 */
Blockly.BlockDragger.prototype.dragBlock = function(e, currentDragDeltaXY) {
  if (this.useDragSurface_) {
    var newLoc = goog.math.Coordinate.sum(this.blockRelativeToSurfaceXY_,
        currentDragDeltaXY);
    this.dragSurface_.translateSurface(newLoc.x, newLoc.y);
  }
  this.deleteArea_ = this.workspace_.isDeleteArea(e);
  // TODO: Handle the case when we aren't using the drag surface.
  this.draggedConnectionManager_.update(currentDragDeltaXY, this.deleteArea_);
  this.updateCursorDuringBlockDrag_();
};

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!goog.math.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel coordinates.
 */
Blockly.BlockDragger.prototype.endBlockDrag = function(e, currentDragDeltaXY) {
  // Make sure internal state is fresh.
  this.dragBlock(e, currentDragDeltaXY);
  Blockly.BlockSvg.disconnectUiStop_();
  // TODO: Consider where moveOffDragSurface should live.
  this.draggingBlock_.moveConnections_(currentDragDeltaXY.x,
      currentDragDeltaXY.y);
  this.draggingBlock_.moveOffDragSurface_();
  var deleted = this.maybeDeleteBlock_();
  if (!deleted) {
    // setDragging_ is expensive and doesn't need to be done if we're deleting.
    this.draggingBlock_.setDragging_(false);
    this.draggedConnectionManager_.applyConnections();
    this.draggingBlock_.render();
    this.fireMoveEvent_();
  }
  this.workspace_.setResizesEnabled(true);
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  Blockly.Events.setGroup(false);
};

/**
 * Fire a move event at the end of a block drag.
 * @private
 */
Blockly.BlockDragger.prototype.fireMoveEvent_ = function() {
  var event = new Blockly.Events.Move(this.draggingBlock_);
  event.oldCoordinate = this.blockRelativeToSurfaceXY_;
  event.recordNew();
  Blockly.Events.fire(event);
  var draggingBlock = this.draggingBlock_;
  // Ensure that any snap and bump are part of this move's event group.
  var group = Blockly.Events.getGroup();
  setTimeout(function() {
    Blockly.Events.setGroup(group);
    draggingBlock.snapToGrid();
    Blockly.Events.setGroup(false);
  }, Blockly.BUMP_DELAY / 2);
  setTimeout(function() {
    Blockly.Events.setGroup(group);
    draggingBlock.bumpNeighbours_();
    Blockly.Events.setGroup(false);
  }, Blockly.BUMP_DELAY);
};

/**
 * Shut the trash can and, if necessary, delete the dragging block.
 * Should be called at the end of a block drag.
 * @return {boolean} whether the block was deleted.
 * @private
 */
Blockly.BlockDragger.prototype.maybeDeleteBlock_ = function() {
  // TODO: is there an event to fire?
  var trashcan = this.workspace_.trashcan;

  if (this.wouldDeleteBlock_) {
    if (trashcan) {
      goog.Timer.callOnce(trashcan.close, 100, trashcan);
    }
    this.draggingBlock_.dispose(false, true);
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
Blockly.BlockDragger.prototype.updateCursorDuringBlockDrag_ = function() {
  this.wouldDeleteBlock_ = this.draggedConnectionManager_.wouldDeleteBlock();
  var trashcan = this.workspace_.trashcan;
  if (this.wouldDeleteBlock_) {
    // Update the cursor, regardless of whether it's over the trash can or the
    // toolbox.
    Blockly.Css.setCursor(Blockly.Css.Cursor.DELETE);
    if (this.deleteArea_ == Blockly.DELETE_AREA_TRASH && trashcan) {
      trashcan.setOpen_(true);
    }
  } else {
    Blockly.Css.setCursor(Blockly.Css.Cursor.CLOSED);
    if (trashcan) {
      trashcan.setOpen_(false);
    }
  }
};
