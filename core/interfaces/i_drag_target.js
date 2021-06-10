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
 * relative to viewport.
 * @return {Blockly.utils.Rect} The component's bounding box.
 */
Blockly.IDragTarget.prototype.getClientRect;

/**
 * Handles when a cursor with a block or bubble enters this drag target.
 * @param {!Blockly.BlockSvg|!Blockly.IBubble} dragElement The block or bubble
 *     currently being dragged.
 */
Blockly.IDragTarget.prototype.onDragEnter;

/**
 * Handles when a cursor with a block or bubble exits this drag target.
 * @param {!Blockly.BlockSvg|!Blockly.IBubble} dragElement The block or bubble
 *     currently being dragged.
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
