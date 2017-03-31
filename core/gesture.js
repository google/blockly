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

goog.require('Blockly.BlockDragger');
goog.require('Blockly.constants');
goog.require('Blockly.FlyoutDragger');
goog.require('Blockly.Touch');
goog.require('Blockly.WorkspaceDragger');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


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
   * @type {Blockly.BlockSvg}
   * @private
   */
  this.startBlock_ = null;

  /**
   * @type {Blockly.WorkspaceSvg}
   * @private
   */
  this.startWorkspace_ = null;

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

  /**
   * Boolean for sanity-checking that some code is only called once.
   * @type {boolean}
   * @private
   */
  this.calledUpdateIsDragging_ = false;

  /**
   * Boolean for sanity-checking that some code is only called once.
   * @type {boolean}
   * @private
   */
  this.hasStarted_ = false;
};

Blockly.Gesture.prototype.dispose = function() {
  if (this.onMoveWrapper_) {
    Blockly.unbindEvent_(this.onMoveWrapper_);
  }
  if (this.onUpWrapper_) {
    Blockly.unbindEvent_(this.onUpWrapper_);
  }
};

/**
 * Update internal state based on an event.
 * @param {!Event} e The most recent mouse or touch event.
 * @private
 */
Blockly.Gesture.prototype.updateFromEvent_ = function(e) {
  var currentXY = new goog.math.Coordinate(e.clientX, e.clientY);
  var changed = this.updateDragDelta_(currentXY);
  // Exceeded the drag radius for the first time.
  if (changed){
    this.updateIsDragging_();
    Blockly.longStop_();
  }
  this.mostRecentEvent_ = e;
};

/**
 * DO MATH to set currentDragDeltaXY_ based on the most recent mouse position.
 * @param {!goog.math.Coordinate} currentXY The most recent mouse/pointer
 *     position, in pixel units, with (0, 0) at the window's top left corner.
 * @return {boolean} True if the drag just exceeded the drag radius for the
 *     first time.
 * @private
 */
Blockly.Gesture.prototype.updateDragDelta_ = function(currentXY) {
  this.currentDragDeltaXY_ = goog.math.Coordinate.difference(currentXY,
      this.mouseDownXY_);

  if (!this.hasExceededDragRadius_) {
    var currentDragDelta = goog.math.Coordinate.magnitude(
        this.currentDragDeltaXY_);

    // The flyout has a different drag radius from the rest of Blockly.
    var limitRadius = this.flyout_ ? Blockly.FLYOUT_DRAG_RADIUS :
        Blockly.DRAG_RADIUS;

    this.hasExceededDragRadius_ = currentDragDelta > limitRadius;
    return this.hasExceededDragRadius_;
  }
  return false;
};

/**
 * Update this gesture to record whether a block is being dragged from the
 * flyout.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a block should be dragged from the flyout this function creates the new
 * block on the main workspace and updates startBlock_ and startWorkspace_.
 * @return {boolean} True if a block is being dragged from the flyout.
 * @private
 */
Blockly.Gesture.prototype.updateIsDraggingFromFlyout_ = function() {
  // Disabled blocks may not be dragged from the flyout.
  if (this.startBlock_.disabled) {
    return false;
  }
  if (!this.flyout_.isScrollable() ||
      this.flyout_.isDragTowardWorkspace(this.currentDragDeltaXY_)) {
    this.startWorkspace_ = this.flyout_.targetWorkspace_;
    this.startBlock_ = this.flyout_.createBlock(this.startBlock_);
    this.startBlock_.select();
    return true;
  }
  return false;
};

/**
 * Update this gesture to record whether a block is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a block should be dragged, either from the flyout or in the workspace,
 * this function creates the necessary BlockDragger and starts the drag.
 * @return {boolean} true if a block is being dragged.
 */
Blockly.Gesture.prototype.updateIsDraggingBlock_ = function() {
  if (!this.startBlock_) {
    return false;
  }

  if (this.flyout_) {
    this.isDraggingBlock_ = this.updateIsDraggingFromFlyout_();
  } else if (this.startBlock_.isMovable()){
    this.isDraggingBlock_ = true;
  }

  if (this.isDraggingBlock_) {
    this.startDraggingBlock_();
    return true;
  }
  return false;
};

/**
 * Update this gesture to record whether a workspace is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 * If a workspace is being dragged this function creates the necessary
 * WorkspaceDragger or FlyoutDragger and starts the drag.
 */
Blockly.Gesture.prototype.updateIsDraggingWorkspace_ = function() {
  var wsMovable = this.flyout_ ? this.flyout_.isScrollable() :
      this.startWorkspace_ && this.startWorkspace_.isDraggable();

  if (!wsMovable) {
    return;
  }

  if (this.flyout_) {
    this.workspaceDragger_ = new Blockly.FlyoutDragger(this.flyout_);
  } else {
    this.workspaceDragger_ = new Blockly.WorkspaceDragger(this.startWorkspace_);
  }

  this.isDraggingWorkspace_ = true;
  this.workspaceDragger_.startDrag();
};

/**
 * Update this gesture to record whether anything is being dragged.
 * This function should be called on a mouse/touch move event the first time the
 * drag radius is exceeded.  It should be called no more than once per gesture.
 */
Blockly.Gesture.prototype.updateIsDragging_ = function() {
  // Sanity check.
  goog.asserts.assert(!this.calledUpdateIsDragging_,
      "updateIsDragging_ should only be called once per gesture.");
  this.calledUpdateIsDragging_ = true;

  // First check if it was a block drag.
  if (this.updateIsDraggingBlock_()) {
    return;
  }
  // Then check if it's a workspace drag.
  this.updateIsDraggingWorkspace_();
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
  this.hasStarted_ = true;

  this.startWorkspace_.updateScreenCalculationsIfScrolled();
  this.startWorkspace_.markFocused();
  this.mostRecentEvent_ = e;

  // Hide chaff also hides the flyout, so don't do it if the click is in a flyout.
  Blockly.hideChaff(!!this.flyout_);

  if (this.startBlock_) {
    this.startBlock_.select();
  }

  if (Blockly.utils.isRightButton(e)) {
    this.handleRightClick(e);
    return;
  }

  if (goog.string.caseInsensitiveEquals(e.type, 'touchstart')) {
    Blockly.longStart_(e);
  }

  this.mouseDownXY_ = new goog.math.Coordinate(e.clientX, e.clientY);

  this.onMoveWrapper_ = Blockly.bindEventWithChecks_(
      document, 'mousemove', null, this.handleMove.bind(this));
  this.onUpWrapper_ = Blockly.bindEventWithChecks_(
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
  if (this.isDraggingWorkspace_) {
    this.workspaceDragger_.drag(this.currentDragDeltaXY_);
  } else if (this.isDraggingBlock_) {
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
 * Cancel an in-progress gesture.  If a workspace or block drag is in progress,
 * end the drag at the most recent location.
 *
 */
Blockly.Gesture.prototype.cancelGesture = function() {
  Blockly.longStop_();
  if (this.isDraggingBlock_) {
    this.blockDragger_.endBlockDrag(this.mostRecentEvent_,
        this.currentDragDeltaXY_);
  } else if (this.isDraggingWorkspace_) {
    this.workspaceDragger_.endDrag(this.currentDragDeltaXY_);
  }
  this.endGesture();
};

/**
 * End the gesture associated and remove it from the gesture database.
 * If an event is passed in, stop that event from doing anything else on the
 * page.
 * @param {Event} opt_e A mouse move or touch move event, if this gesture is
 *     being ended with an event.
 */
Blockly.Gesture.prototype.endGesture = function(opt_e) {
  Blockly.GestureDB.removeGestureForId(this.touchIdentifier_);
  Blockly.Touch.clearTouchIdentifier();
  if (opt_e) {
    opt_e.preventDefault();
    opt_e.stopPropagation();
  }
};

/**
 * Handle a real or faked right-click event by showing a context menu.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.handleRightClick = function(e) {
  if (this.startBlock_) {
    if (this.flyout_) {
      // TODO: Possibly hide chaff in the non-flyout case as well.
      Blockly.hideChaff(true);
    }
    this.startBlock_.showContextMenu_(e);
  } else if (this.startWorkspace_ && !this.flyout_) {
    this.startWorkspace_.showContextMenu_(e);
  }

  e.preventDefault();
  e.stopPropagation();

  this.endGesture(e);
};

// Called externally.
/**
 * Handle a mousedown/touchstart event on a workspace.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.Workspace} ws The workspace the event hit.
 */
Blockly.Gesture.prototype.handleWsStart = function(e, ws) {
  goog.asserts.assert(!this.hasStarted_,
     'Tried to call gesture.handleWsStart, but the gesture had already been ' +
     'started.');
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
  goog.asserts.assert(!this.hasStarted_,
     'Tried to call gesture.handleFlyoutStart, but the gesture had already been ' +
     'started.');
  this.setStartFlyout(flyout);
  this.handleWsStart(e, flyout.getWorkspace());
};

/**
 * Handle a mousedown/touchstart event on a block.
 * @param {!Event} e A mouse down or touch start event.
 * @param {!Blockly.BlockSvg} block The block the event hit.
 */
Blockly.Gesture.prototype.handleBlockStart = function(e, block) {
  goog.asserts.assert(!this.hasStarted_,
     'Tried to call gesture.handleBlockStart, but the gesture had already been ' +
     'started.');
  this.setStartBlock(block);
  this.mostRecentEvent_ = e;
};

// Field clicks
Blockly.Gesture.prototype.doFieldClick_ = function() {
  this.startField_.showEditor_();
};

// Block clicks
Blockly.Gesture.prototype.doBlockClick_ = function() {
  if (this.flyout_ && this.flyout_.autoClose) {
    var newBlock = this.flyout_.createBlock(this.startBlock_);
    // Ensure that any snap and bump are part of this move's event group.
    var group = Blockly.Events.getGroup();
    setTimeout(function() {
      Blockly.Events.setGroup(group);
      newBlock.snapToGrid();
      Blockly.Events.setGroup(false);
    }, Blockly.BUMP_DELAY / 2);
    setTimeout(function() {
      Blockly.Events.setGroup(group);
      newBlock.bumpNeighbours_();
      Blockly.Events.setGroup(false);
    }, Blockly.BUMP_DELAY);
  } else {
    // TODO: Check if anything else needs to happen on a block click.
    Blockly.Events.fire(
        new Blockly.Events.Ui(this.startBlock_, 'click', undefined, undefined));
  }
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
  goog.asserts.assert(!this.hasStarted_,
     'Tried to call gesture.setStartField, but the gesture had already been ' +
     'started.');
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
