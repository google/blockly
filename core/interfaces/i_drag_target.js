/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that has a handler for when a
 * block is dropped on top of it.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IDragTarget');

goog.require('Blockly.IComponent');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.IBubble');
goog.requireType('Blockly.utils.Rect');

/**
 * Interface for a component with custom behaviour when a block or bubble is
 * dragged over or dropped on top of it.
 * @extends {Blockly.IComponent}
 * @interface
 */
Blockly.IDragTarget = function() {};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to the viewport.
 * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
 *   target area should be ignored.
 */
Blockly.IDragTarget.prototype.getClientRect;

/**
 * Handles when a cursor with a block or bubble enters this drag target.
 */
Blockly.IDragTarget.prototype.onDragEnter;

/**
 * Handles when a cursor with a block or bubble is dragged over this drag
 * target.
 */
Blockly.IDragTarget.prototype.onDragOver;


/**
 * Handles when a cursor with a block or bubble exits this drag target.
 */
Blockly.IDragTarget.prototype.onDragExit;

/**
 * Handles when a block is dropped on this component. Should not handle delete
 * here.
 * @param {!Blockly.BlockSvg} block The block.
 */
Blockly.IDragTarget.prototype.onBlockDrop;

/**
 * Handles when a bubble is dropped on this component. Should not handle delete
 * here.
 * @param {!Blockly.IBubble} bubble The bubble.
 */
Blockly.IDragTarget.prototype.onBubbleDrop;

/**
 * Returns whether the provided block should not be moved after being dropped
 * on this component. If true, block will return to where it was when the drag
 * started.
 * @param {!Blockly.BlockSvg} block The block.
 * @return {boolean} Whether the block provided should be returned to drag
 *     start.
 */
Blockly.IDragTarget.prototype.shouldPreventBlockMove;

/**
 * Returns whether the provided bubble should not be moved after being dropped
 * on this component. If true, bubble will return to where it was when the drag
 * started.
 * @param {!Blockly.IBubble} bubble The bubble.
 * @return {boolean} Whether the bubble provided should be returned to drag
 *    start.
 */
Blockly.IDragTarget.prototype.shouldPreventBubbleMove;
