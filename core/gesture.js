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
 * @fileoverview The class representing an in-progress gesture, usually a drag
 * or a tap.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Gesture');

goog.require('goog.math.Coordinate');
goog.require('goog.asserts');

/**
 * NB: In this file "start" refers to touchstart, mousedown, and pointerstart
 * events.  "End" refers to touchend, mouseup, and pointerend events.
 * TODO: Consider touchcancel/pointercancel.
 */

/**
 * Class for one gesture.
 * @param {!Event} e The event that kicked off this gesture.
 * @param {string} touchId The touch identifier of the event.
 * @constructor
 */
Blockly.Gesture = function(e, touchId) {

  /**
   * @type {goog.math.Coordinate}
   * TODO: In what units?
   * @private
   */
  this.mouseDownXY_ = null;
  /**
   * @type {goog.math.Coordinate}
   * @private
   */
  this.currentXY_ = null;

  /**
   * @type {number}
   * private
   */
  this.currentDragDelta_ = 0;

  /**
   * @type {goog.math.Coordinate}
   * private
   */
  this.currentDragDeltaXY_ = 0;

  /**
   * @type {Blockly.Field}
   * @private
   */
  this.startField_ = null;

  /**
   * @type {Blockly.Field}
   * @private
   */
  this.endField_ = null;

  /**
   * @type {Blockly.BlockSvg}
   * @private
   */
  this.startBlock_ = null;

  /**
   * @type {Blockly.BlockSvg}
   * @private
   */
  this.endBlock_ = null;

  /**
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.startWorkspace_ = null;

  /**
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.endWorkspace_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.hasExceededDragRadius_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.isDraggingWorkspace_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.isDraggingBlock_ = false;

  /**
   * @type {string}
   * @private
   */
  this.touchIdentifier_ = touchId;

  /**
   * The event that most recently updated this gesture.
   * @type {!Event}
   * @private
   */
  this.mostRecentEvent_ = e;

  // TODO: Doc
  this.startDragMetrics_ = null;

  // TODO: Doc
  this.startScrollXY_ = null;

  // TODO: Doc
  this.onMoveWrapper_ = null;

  // TODO: Doc
  this.onUpWrapper_ = null;
};

Blockly.Gesture.prototype.dispose = function() {
  if (this.onMoveWrapper_) {
    Blockly.unbindEvent_(this.onMoveWrapper_);
  }
  if (this.onUpWrapper_) {
    Blockly.unbindEvent_(this.onUpWrapper_);
  }
};

Blockly.Gesture.prototype.update = function(e) {
  this.updateDragDelta_(e);
  if (!this.isDragging()) {
    this.updateIsDragging_();
  }
  this.mostRecentEvent_ = e;
};

/**
 * DO MATH to set currentDragDelta_ based on the most recent mouse position.
 * TODO: Figure out what units the coordinates are in.
 * @param {!Event} e The event for the most recent mouse/touch move.
 * @return {number} the new drag delta.
 * @private
 */
Blockly.Gesture.prototype.updateDragDelta_ = function(e) {
  this.currentXY_ = new goog.math.Coordinate(e.clientX, e.clientY);
  this.currentDragDeltaXY_ = goog.math.Coordinate.difference(this.currentXY_,
      this.mouseDownXY_);
  this.currentDragDelta_ = goog.math.Coordinate.magnitude(
      this.currentDragDeltaXY_);
  this.hasExceededDragRadius_ = this.currentDragDelta_ > Blockly.DRAG_RADIUS;
  return this.currentDragDelta_;
};

/**
 * Update this gesture to record whether anything is being dragged.
 * This function should be called on mouse/touch move events if isDragging
 * fields have not yet been set.
 * @return {boolean} true if anything is being dragged.
 */
Blockly.Gesture.prototype.updateIsDragging_ = function() {
  // TODO: Assert that the most recent event was a move?
  goog.asserts.assert(!this.isDragging(),
      'Don\'t call updateIsDragging_ when a drag is already in progress.');
  var startBlockMovable = this.startBlock_ && this.startBlock_.isMovable();
  if (startBlockMovable && this.hasExceededDragRadius_) {
    this.isDraggingBlock_ = true;
    console.log('dragging block');
    this.startBlockDrag();
    return true;
  }

  var wsMovable = this.startWorkspace_ && this.startWorkspace_.isDraggable();
  if (wsMovable && this.hasExceededDragRadius_) {
    this.isDraggingWorkspace_ = true;
    console.log('dragging workspace');
    this.startWorkspaceDrag();
    return true;
  }
  return false;
};

/**
 * Set the coordinate for the start of this gesture.
 * @param {!Event} e The event that starts the gesture.
 * @param {!Blockly.WorkspaceSvg} ws The workspace on which the gesture started.
 */
Blockly.Gesture.prototype.setStartLocation = function(e, ws) {
  this.mouseDownXY_ = new goog.math.Coordinate(e.clientX, e.clientY);
  // TODO: Do I need the start drag metrics to manage a workspace drag?
  this.startDragMetrics_ = ws.getMetrics();
  this.startScrollXY_ = new goog.math.Coordinate(ws.scrollX, ws.scrollY);
};

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.handleMove = function(e) {
  console.log('handlemove');
  this.update(e);
  // TODO: I should probably only call this once, when first exceeding the drag
  // radius.
  if (this.hasExceededDragRadius_) {
    Blockly.longStop_();
  }
  if (this.isDraggingWorkspace_) {
    // Move the visible workspace
    this.dragWorkspace();
  } else if (this.isDraggingBlock_) {
    // Move the dragging block.
    this.dragBlock();
  }
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse up or touch end event.
 * @param {!Event} e A mouse up or touch end event.
 */
Blockly.Gesture.prototype.handleUp = function(e) {
  console.log('handleup');
  this.update(e);
  Blockly.longStop_();
  if (this.isDraggingBlock_) {
    // Terminate block drag.
    this.endBlockDrag();
  } else if (this.isDraggingWorkspace_) {
    this.endWorkspaceDrag();
    // Terminate workspace drag.
  } else if (this.isFieldClick_()) {
    // End field click.
  } else if (this.isBlockClick_()) {
    // Click the block.
  } else if (this.isWorkspaceClick_()) {
    // Click the workspace.
  }
  this.endGesture(e);
};

Blockly.Gesture.prototype.endGesture = function(e) {
  Blockly.GestureHandler.removeGestureForId(this.touchIdentifier_);
  e.preventDefault();
  e.stopPropagation();
};

// Called externally.
Blockly.Gesture.prototype.handleWsStart = function(e, ws) {
  // TODO: Blockly.longStart_()
  console.log('handlewsstart');
  this.setStartWorkspace(ws);
  this.setStartLocation(e, ws);
  this.mostRecentEvent_ = e;

  this.onMoveWrapper_ = Blockly.bindEvent_(
      document, 'mousemove', null, this.handleMove.bind(this));

  this.onUpWrapper_ = Blockly.bindEvent_(
      document, 'mouseup', null, this.handleUp.bind(this));

  e.preventDefault();
  e.stopPropagation();
};

Blockly.Gesture.prototype.handleBlockStart = function(e, block) {
  console.log('handle block start');
  this.setStartBlock(block);
  this.mostRecentEvent_ = e;
};

// Block drags
Blockly.Gesture.prototype.startBlockDrag = function() {
  console.log('start block drag');
  // Workspace.startDrag just records the start position, which we already know.
  // TODO: Figure out where to get the list of bubbles to move when dragging.
  this.startWorkspace_.setResizesEnabled(false);
  // TODO: Add getParent() to blockSvg.
  if (this.startBlock_.parentBlock_) {
    this.startBlock_.unplug();
    this.startBlock_.disconnectUiEffect();
  }
  // TODO: Make setDragging_ package.
  this.startBlock_.setDragging_(true);
  // TODO: Consider where moveToDragSurface should live.
  this.startBlock_.moveToDragSurface_();
  this.dragBlock();
};

Blockly.Gesture.prototype.endBlockDrag = function() {
  Blockly.BlockSvg.disconnectUiStop_();
  console.log('end block drag');
  this.startWorkspace_.setResizesEnabled(true);
  // TODO: Consider where moveOffDragSurface should live.
  this.startBlock_.moveOffDragSurface_();
  this.startBlock_.setDragging_(false);
  this.startBlock_.render();
  //Blockly.terminateDrag_();
};

Blockly.Gesture.prototype.dragBlock = function() {
  if (this.startBlock_.useDragSurface_) {
    console.log(this.currentDragDeltaXY_);
    this.startWorkspace_.blockDragSurface_.translateSurface(
        this.currentDragDeltaXY_.x, this.currentDragDeltaXY_.y);
  }
  // TODO: Handle the case when we aren't using the drag surface.
};

// Workspace drags
Blockly.Gesture.prototype.startWorkspaceDrag = function() {
  // TODO: set cursor.
  this.startWorkspace_.setupDragSurface();
};


Blockly.Gesture.prototype.endWorkspaceDrag = function() {
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  this.startWorkspace_.resetDragSurface();
};

/**
 * Move the workspace based on the most recent mouse movements.
 */
Blockly.Gesture.prototype.dragWorkspace = function() {
  var metrics = this.startDragMetrics_;
  var newXY = goog.math.Coordinate.sum(
      this.startScrollXY_, this.currentDragDeltaXY_);

  // Bound the new XY based on workspace bounds.
  // TODO: Make this a separate function--is it called anywhere else?
  var x = Math.min(newXY.x, -metrics.contentLeft);
  var y = Math.min(newXY.y, -metrics.contentTop);
  x = Math.max(x, metrics.viewWidth - metrics.contentLeft -
               metrics.contentWidth);
  y = Math.max(y, metrics.viewHeight - metrics.contentTop -
               metrics.contentHeight);

  // Move the scrollbars and the page will scroll automatically.
  this.startWorkspace_.scrollbar.set(-x - metrics.contentLeft,
                          -y - metrics.contentTop);
};



// Simple setters

/**
 * Record the field that a gesture started on.
 * @param {Blockly.Field} field The field the gesture started on.
 */
Blockly.Gesture.prototype.setStartField = function(field) {
  if (!this.startField_) {
    this.startField_ = field;
  }
};

/**
 * Record the block that a gesture started on.
 * @param {Blockly.BlockSvg} block The block the gesture started on.
 */
Blockly.Gesture.prototype.setStartBlock = function(block) {
  if (!this.startBlock_) {
    this.startBlock_ = block;
  }
};

/**
 * Record the workspace that a gesture started on.
 * @param {Blockly.WorkspaceSvg} ws The workspace the gesture started on.
 */
Blockly.Gesture.prototype.setStartWorkspace = function(ws) {
  if (!this.startWorkspace_) {
    this.startWorkspace_ = ws;
  }
};

// Simple getters

/**
 * Check whether this gesture is a click on a block.  This should only be called
 * when ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a block.
 */
Blockly.Gesture.prototype.isBlockClick_ = function() {
  // TODO: Possibly have different behaviour for touch vs mouse.
  // TODO: Possibly assert that the most recent event was an end.

  // A block click starts on a block, never escapes the drag radius, and is not
  // a field click.
  var hasStartBlock = !!this.startBlock_;
  return hasStartBlock && !this.hasExceededDragRadius_ && !this.isFieldClick_();
};

/**
 * Check whether this gesture is a click on a field.  This should only be called
 * when ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a field.
 */
Blockly.Gesture.prototype.isFieldClick_ = function() {
  // TODO: Assert that the most recent event was an end?
  var fieldEditable = this.startField_ ?
      this.startField_.isCurrentlyEditable() : false;
  return fieldEditable && !this.hasExceededDragRadius_;
};

/**
 * Check whether this gesture is a click on a workspace.  This should only be
 * called when ending a gesture (mouse up, touch end).
 * @return {boolean} whether this gesture was a click on a workspace.
 */
Blockly.Gesture.prototype.isWorkspaceClick_ = function() {
  // TODO: Possibly assert that the most recent event was an end?
  var onlyTouchedWorkspace = !this.startBlock_ && !this.startField_;
  return onlyTouchedWorkspace && !this.hasExceededDragRadius_;
};

Blockly.Gesture.prototype.isWorkspaceDrag_ = function() {
  return this.isDraggingWorkspace_;
};

Blockly.Gesture.prototype.isBlockDrag_ = function() {
  return this.isDraggingBlock_;
};

Blockly.Gesture.prototype.isDragging = function() {
  return this.isDraggingWorkspace_ || this.isDraggingBlock_;
};


/**
 * Check whether this gesture started on the given workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace to compare against.
 * @return {boolean} True if this gesture started on the given workspace.
 */
Blockly.Gesture.prototype.isOnWorkspace = function(ws) {
  return this.startWorkspace_ == ws;
};
