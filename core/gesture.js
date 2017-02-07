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
};

Blockly.Gesture.prototype.update = function(e) {
  this.updateDragDelta_();
  if (!this.isDragging()) {
    this.updateIsDragging_();
  }
};

/**
 * DO MATH to set currentDragDelta_ based on the most recent mouse position.
 * TODO: Figure out what units the coordinates are in.
 * @return {goog.math.Coordinate} the new drag delta.
 * @private
 */
Blockly.Gesture.prototype.updateDragDelta_ = function() {
  return this.currentDragDelta_;
};

/**
 * Update this gesture to record whether anything is being dragged.
 * This function should be called on mouse/touch move events if isDragging
 * fields have not yet been set.
 * @return {boolean} true if anything is being dragged.
 */
Blockly.Gesture.prototype.updateIsDragging_ = function() {
  goog.assert(!this.isDragging(),
      'Don\'t call updateIsDragging_ when a drag is already in progress.');
  var startBlockMovable = this.startBlock_ && this.startBlock_.isMovable();
  if (startBlockMovable && this.currentDragDelta_ > Blockly.DRAG_RADIUS) {
    this.isDraggingBlock_ = true;
    return true;
  }

  var workspaceMovable = this.startWorkspace_ && this.startWorkspace_.isMovable();
  // TODO: Assert that the most recent event was a move?
  return true;
};

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

Blockly.Gesture.prototype.isDragging_ = function() {
  return this.isDraggingWorkspace_ || this.isDraggingBlock_;
};

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
Blockly.Gesture.prototype.setStartBlock = function(ws) {
  if (!this.startWorkspace_) {
    this.startWorkspace_ = ws;
  }
};

/**
 * Handle a mouse move or touch move event.
 * @param {!Event} e A mouse move or touch move event.
 */
Blockly.Gesture.prototype.handleMove = function(e) {
  this.updateDragDelta_();
  if (!this.isDragging()) {
    this.updateIsDragging_();
  }

  if (this.isDraggingWorkspace_) {

  } else if (this.isDraggingBlock_) {

  }
};
