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
goog.require('Blockly.BlockDragger');
goog.require('Blockly.FlyoutDragger');
goog.require('Blockly.WorkspaceDragger');
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
   * The position of the mouse when the gesture started.  Units are css pixels,
   * with (0, 0) at the top left of the browser window (mouseEvent clientX/Y).
   * @type {goog.math.Coordinate}
   */
  this.mouseDownXY_ = null;

  /**
   * How far the mouse has moved during this drag, in pixel units.
   * (0, 0) is at this.mouseDownXY_.
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

  /**
   * A handle to use to unbind a mouse move listener at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {Array.<!Array>}
   * @private
   */
  this.onMoveWrapper_ = null;

  /**
   * A handle to use to unbind a mouse up listener at the end of a drag.
   * Opaque data returned from Blockly.bindEventWithChecks_.
   * @type {Array.<!Array>}
   * @private
   */
  this.onUpWrapper_ = null;

  /**
   * The object tracking a block drag, or null if none is in progress.
   * @type {Blockly.BlockDragger}
   * @private
   */
  this.blockDragger_ = null;

  /**
   * The object tracking a workspace or flyout workspace drag, or null if none
   * is in progress.
   * @type {Blockly.WorkspaceDragger}
   * @private
   */
  this.workspaceDragger_ = null;

  /**
   * The flyout a gesture started in, if any.
   * @type {Blockly.Flyout}
   * @private
   */
  this.flyout_ = null;
};

Blockly.Gesture.prototype.dispose = function() {
  if (this.onMoveWrapper_) {
    Blockly.unbindEvent_(this.onMoveWrapper_);
  }
  if (this.onUpWrapper_) {
    Blockly.unbindEvent_(this.onUpWrapper_);
  }
  this.blockDragger_ = null;
  this.workspaceDragger_ = null;
};

/**
 * Update internal state based on an event.
 * @param {!Event} e The most recent mouse or touch event.
 * @private
 */
Blockly.Gesture.prototype.updateFromEvent_ = function(e) {
  var currentXY = new goog.math.Coordinate(e.clientX, e.clientY);
  this.updateDragDelta_(currentXY);
  if (!this.isDragging()) {
    this.updateIsDragging_();
  }
  this.mostRecentEvent_ = e;
};

/**
 * DO MATH to set currentDragDeltaXY_ based on the most recent mouse position.
 * @param {!goog.math.Coordinate} currentXY The most recent mouse/pointer
 *     position, in pixel units, with (0, 0) at the window's top left corner.
 * @private
 */
Blockly.Gesture.prototype.updateDragDelta_ = function(currentXY) {
  this.currentDragDeltaXY_ = goog.math.Coordinate.difference(currentXY,
      this.mouseDownXY_);
  var currentDragDelta = goog.math.Coordinate.magnitude(
      this.currentDragDeltaXY_);
  this.hasExceededDragRadius_ = currentDragDelta > Blockly.DRAG_RADIUS;
};

/**
 * Update this gesture to record whether a block is being dragged from the
 * flyout.
 * This function should be called on mouse/touch move events if isDragging
 * fields have not yet been set.
 * If a block should be dragged from the flyout this function creates the new
 * block on the main workspace and updates startBlock_ and startWorkspace_.
 * @private
 */
Blockly.Gesture.prototype.updateIsDraggingFromFlyout_ = function() {
  if (this.flyout_.isDragTowardWorkspace_(this.currentDragDeltaXY_.x,
      this.currentDragDeltaXY_.y)) {
    Blockly.Events.disable();
    this.flyout_.targetWorkspace_.setResizesEnabled(false);
    try {
      this.startBlock_ = this.flyout_.placeNewBlock_(this.startBlock_);
      this.startBlock_.render();
      this.startWorkspace_ = this.flyout_.targetWorkspace_;
      this.isDraggingBlock_ = true;
      // Close the flyout.
      Blockly.hideChaff();
    } finally {
      Blockly.Events.enable();
    }
  }
};

/**
 * Update this gesture to record whether a block is being dragged.
 * This function should be called on mouse/touch move events if isDragging
 * fields have not yet been set.
 * If a block should be dragged, either from the flyout or in the workspace,
 * this function creates the necessary BlockDragger and starts the drag.
 * @return {boolean} true if a block is being dragged.
 */
Blockly.Gesture.prototype.updateIsDraggingBlock_ = function() {
  var startBlockInFlyout = this.startBlock_ && this.flyout_;
  if (startBlockInFlyout) {
    this.updateIsDraggingFromFlyout_();
  } else {
    var startBlockMovable = this.startBlock_ && this.startBlock_.isMovable();
    if (startBlockMovable && this.hasExceededDragRadius_) {
      this.isDraggingBlock_ = true;
    }
  }

  if (this.isDraggingBlock_) {
    this.startDraggingBlock_();
    return true;
  }
  return false;
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

  // First check if it was a block drag.
  if (this.updateIsDraggingBlock_()) {
    return true;
  }

  // Then check if it's a workspace drag.
  var wsMovable = this.flyout_ ?
      this.flyout_ && (this.flyout_.scrollbar_ != null) &&
      this.flyout_.scrollbar_.isVisible() :
      this.startWorkspace_ && this.startWorkspace_.isDraggable();
  if (wsMovable && this.hasExceededDragRadius_) {
    this.isDraggingWorkspace_ = true;

    if (this.flyout_) {
      this.workspaceDragger_ = new Blockly.FlyoutDragger(this.flyout_);
    } else {
      this.workspaceDragger_ = new Blockly.WorkspaceDragger(this.startWorkspace_);
    }

    this.workspaceDragger_.startDrag();
    return true;
  }
  return false;
};

/**
 * Create a block dragger and start dragging the selected block.
 * TODO(fenichel): Consider folding all of this into the BlockDragger
 * constructor.
 * @private
 */
Blockly.Gesture.prototype.startDraggingBlock_ = function() {
  this.blockDragger_ = new Blockly.BlockDragger(this.startBlock_,
      this.startWorkspace_);
  this.blockDragger_.startBlockDrag(this.currentDragDeltaXY_);
  this.blockDragger_.dragBlock(this.mostRecentEvent_,
      this.currentDragDeltaXY_);
};

/**
 * Start a gesture: update the workspace to indicate that a gesture is in
 * progress and bind mousemove and mouseup handlers.
 * @param {!Event} e A mouse down or touch start event.
 */
Blockly.Gesture.prototype.doStart = function(e) {
  // TODO: Blockly.longStart_()
  this.startWorkspace_.updateScreenCalculationsIfScrolled();
  this.startWorkspace_.markFocused();
  this.mostRecentEvent_ = e;

  // Hide chaff also hides the flyout, so don't do it if the click is in a flyout.
  Blockly.hideChaff(!!this.flyout_);

  if (Blockly.utils.isRightButton(e)) {
    this.handleRightClick(e);
    return;
  }
  if (this.startBlock_) {
    this.startBlock_.select();
  }

  this.mouseDownXY_ = new goog.math.Coordinate(e.clientX, e.clientY);

  this.onMoveWrapper_ = Blockly.bindEvent_(
      document, 'mousemove', null, this.handleMove.bind(this));

  this.onUpWrapper_ = Blockly.bindEvent_(
      document, 'mouseup', null, this.handleUp.bind(this));

  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.handleMove = function(e) {
  this.updateFromEvent_(e);
  // TODO: I should probably only call this once, when first exceeding the drag
  // radius.
  if (this.hasExceededDragRadius_) {
    Blockly.longStop_();
  }
  if (this.isDraggingWorkspace_) {
    // Move the visible workspace
    this.workspaceDragger_.drag(this.currentDragDeltaXY_);
  } else if (this.isDraggingBlock_) {
    // Move the dragging block.
    this.blockDragger_.dragBlock(this.mostRecentEvent_,
        this.currentDragDeltaXY_);
  }
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a mouse up or touch end event.
 * @param {!Event} e A mouse up or touch end event.
 */
Blockly.Gesture.prototype.handleUp = function(e) {
  this.updateFromEvent_(e);
  Blockly.longStop_();

  // The ordering of these checks is important: drags have higher priority than
  // clicks.  Fields have higher priority than blocks; blocks have higher
  // priority than workspaces.
  if (this.isDraggingBlock_) {
    this.blockDragger_.endBlockDrag(e, this.currentDragDeltaXY_);
  } else if (this.isDraggingWorkspace_) {
    this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
  } else if (this.isFieldClick_()) {
    this.doFieldClick_();
  } else if (this.isBlockClick_()) {
    this.doBlockClick_();
  } else if (this.isWorkspaceClick_()) {
    this.doWorkspaceClick_();
  }
  this.endGesture(e);
};

/**
 * End the gesture associated with the given event, and remove it from the
 * gesture database.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.endGesture = function(e) {
  Blockly.GestureDB.removeGestureForId(this.touchIdentifier_);
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Handle a right-click event by showing a context menu.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.handleRightClick = function(e) {
  if (this.startBlock_) {
    this.startBlock_.showContextMenu_(e);
  } else if (this.startWorkspace_) {
    this.startWorkspace_.showContextMenu_(e);
  }
  this.endGesture(e);
};

// Called externally.
/**
 * Handle a mousedown/touchstart event on a workspace.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Workspace} ws The workspace the event hit.
 */
Blockly.Gesture.prototype.handleWsStart = function(e, ws) {
  this.setStartWorkspace(ws);
  this.mostRecentEvent_ = e;
  this.doStart(e);
};

/**
 * Handle a mousedown/touchstart event on a flyout.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Flyout} flyout The flyout the event hit.
 */
Blockly.Gesture.prototype.handleFlyoutStart = function(e, flyout) {
  this.setStartFlyout(flyout);
  this.handleWsStart(e, flyout.getWorkspace());
};

/**
 * Handle a mousedown/touchstart event on a block.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.BlockSvg} block The block the event hit.
 */
Blockly.Gesture.prototype.handleBlockStart = function(e, block) {
  this.setStartBlock(block);
  this.mostRecentEvent_ = e;
};

// Field clicks
Blockly.Gesture.prototype.doFieldClick_ = function() {
  this.startField_.showEditor_();
};

// Block clicks
Blockly.Gesture.prototype.doBlockClick_ = function() {
  // TODO: Implement.
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.startBlock_, 'click', undefined, undefined));
  Blockly.Css.setCursor(Blockly.Css.Cursor.OPEN);
  Blockly.Events.setGroup(false);
};

// Workspace clicks
Blockly.Gesture.prototype.doWorkspaceClick_ = function() {
  // TODO: Implement.
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
    if (block.isShadow()) {
      this.setStartBlock(block.parentBlock_);
    } else {
      this.startBlock_ = block;
    }
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

/**
 * Record the flyout that a gesture started on.
 * @param {Blockly.Flyout} flyout The flyout the gesture started on.
 */
Blockly.Gesture.prototype.setStartFlyout = function(flyout) {
  if (!this.flyout_) {
    this.flyout_ = flyout;
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
