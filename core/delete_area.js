/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The abstract class for a component that can delete a block that
 *   is dropped on top of it.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.DeleteArea');

goog.require('Blockly.IDragTarget');

goog.requireType('Blockly.utils.Rect');


/**
 * Abstract class for a component that can delete a block that is dropped on top
 * of it.
 * @implements {Blockly.IDragTarget}
 */
Blockly.DeleteArea = function() {};

/**
 * Return the drag target rectangle.
 * @return {Blockly.utils.Rect} Rectangle in which to block can be dragged over.
 */
Blockly.DeleteArea.prototype.getClientRect;

/**
 * Handles Drag enter.
 */
Blockly.DeleteArea.prototype.onDragEnter = function() {
  // no-op
};

/**
 * Handles a drag exit.
 */
Blockly.DeleteArea.prototype.onDragExit = function() {
  // no-op
};

/**
 * Computes the end location for a block after it is dropped on this component.
 * @param {!Blockly.utils.Coordinate} startXY The start xy.
 * @param {!Blockly.utils.Coordinate} delta The delta.
 * @return {!Blockly.utils.Coordinate} The end location.
 */
Blockly.DeleteArea.prototype.getEndDragLoc = function(startXY, delta) {
  return Blockly.utils.Coordinate.sum(startXY, delta);
};

/**
 * Handles a block drop on this component.
 * @param {!Blockly.BlockSvg} block The block.
 * @param {boolean} couldConnect Whether the block could could connect to
 *     another.
 */
Blockly.DeleteArea.prototype.onBlockDrop = function(block, couldConnect) {
  if (this.wouldDelete(block, couldConnect)) {
    block.dispose(false, true);
    Blockly.draggingConnections = [];
  }
};

/**
 * Returns whether the provided block would be deleted if dropped on this area.
 * @param {!Blockly.BlockSvg} block The block.
 * @param {boolean} couldConnect Whether the block could could connect to
 *     another.
 * @return {boolean} Whether the block provided would be deleted if dropped on
 *     this area.
 */
Blockly.DeleteArea.prototype.wouldDelete = function(block, couldConnect) {
  var couldDelete = !block.getParent() && block.isDeletable();
  return couldDelete && !couldConnect;
};

/**
 * Whether this is a delete area.
 * @type {boolean}
 */
Blockly.DeleteArea.prototype.isDeleteArea = true;
