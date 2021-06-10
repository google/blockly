/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IDeleteArea');

goog.require('Blockly.IDragTarget');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.IBubble');


/**
 * Interface for a component that can delete a block or bubble that is dropped
 * on top of it.
 * @extends {Blockly.IDragTarget}
 * @interface
 */
Blockly.IDeleteArea = function() {};

/**
 * Returns whether the provided block would be deleted if dropped on this area.
 * This method should check if the block is deletable and is always called
 * before onDragEnter/onDragOver/onDragExit.
 * @param {!Blockly.BlockSvg} block The block.
 * @param {boolean} couldConnect Whether the block could could connect to
 *     another.
 * @return {boolean} Whether the block provided would be deleted if dropped on
 *     this area.
 */
Blockly.IDeleteArea.prototype.wouldDeleteBlock;

/**
 * Returns whether the provided bubble would be deleted if dropped on this area.
 * This method should check if the bubble is deletable and is always called
 * before onDragEnter/onDragOver/onDragExit.
 * @param {!Blockly.IBubble} bubble The bubble.
 * @return {boolean} Whether the bubble provided would be deleted if dropped on
 *     this area.
 */
Blockly.IDeleteArea.prototype.wouldDeleteBubble;
