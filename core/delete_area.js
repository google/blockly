/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The abstract class for a component that can delete a block or
 * bubble that is dropped on top of it.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.DeleteArea');

goog.require('Blockly.DragTarget');
goog.require('Blockly.IDeleteArea');


/**
 * Abstract class for a component that can delete a block or bubble that is
 * dropped on top of it.
 * @extends {Blockly.DragTarget}
 * @implements {Blockly.IDeleteArea}
 * @constructor
 */
Blockly.DeleteArea = function() {
  Blockly.DeleteArea.superClass_.constructor.call(this);

  /**
   * Whether the current block or bubble dragged over this delete area would be
   * deleted if dropped on this component.
   * @type {boolean}
   * @protected
   */
  this.wouldDelete_ = false;
};
Blockly.utils.object.inherits(Blockly.DeleteArea, Blockly.DragTarget);

/**
 * Returns whether the provided block would be deleted if dropped on this area.
 * @param {!Blockly.BlockSvg} _block The block.
 * @param {boolean} couldConnect Whether the block could could connect to
 *     another.
 * @return {boolean} Whether the block provided would be deleted if dropped on
 *     this area.
 */
Blockly.DeleteArea.prototype.wouldDeleteBlock = function(_block, couldConnect) {
  this.wouldDelete_ = !couldConnect;
  return this.wouldDelete_;
};

/**
 * Returns whether the provided bubble would be deleted if dropped on this area.
 * @param {!Blockly.IBubble} _bubble The bubble.
 * @return {boolean} Whether the bubble provided would be deleted if dropped on
 *     this area.
 */
Blockly.DeleteArea.prototype.wouldDeleteBubble = function(_bubble) {
  this.wouldDelete_ = true;
  return true;
};

/**
 * Handles when a cursor with a block or bubble exits this drag target.
 * @override
 */
Blockly.DeleteArea.prototype.onDragExit = function() {
  this.wouldDelete_ = false;
};

/**
 * Handles when a block is dropped on this component. Should not handle delete
 * here.
 * @param {!Blockly.BlockSvg} _block The block.
 * @override
 */
Blockly.DeleteArea.prototype.onBlockDrop = function(_block) {
  this.wouldDelete_ = false;
};

/**
 * Handles when a bubble is dropped on this component. Should not handle delete
 * here.
 * @param {!Blockly.IBubble} _bubble The bubble.
 * @override
 */
Blockly.DeleteArea.prototype.onBubbleDrop = function(_bubble) {
  this.wouldDelete_ = false;
};
