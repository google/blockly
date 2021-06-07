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
 * @constructor
 */
Blockly.DeleteArea = function() {};

/**
 * Return the drag target rectangle.
 * @return {Blockly.utils.Rect} Rectangle in which a block can be dragged over.
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
 * Handles a block drop on this component. Should not handle delete here.
 * @param {!Blockly.BlockSvg} _block The block.
 */
Blockly.DeleteArea.prototype.onBlockDrop = function(_block) {
  // no-op
};

/**
 * Returns whether the provided block would be deleted if dropped on this area.
 * @param {!Blockly.BlockSvg} _block The block.
 * @param {boolean} couldConnect Whether the block could could connect to
 *     another.
 * @return {boolean} Whether the block provided would be deleted if dropped on
 *     this area.
 */
Blockly.DeleteArea.prototype.wouldDeleteBlock = function(_block, couldConnect) {
  return !couldConnect;
};

/**
 * Whether this is a bubble delete area.
 * @type {boolean}
 */
Blockly.DeleteArea.prototype.isBubbleDeleteArea = true;
