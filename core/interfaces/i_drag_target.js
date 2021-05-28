/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that has a handler for when a
 *    block is dropped on top of it.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IDragTarget');

goog.require('Blockly.IComponent');

goog.requireType('Blockly.utils.Rect');

/**
 * Interface for a component that can delete a block that has a handler for when
 * a block is dropped on top of it.
 * @extends {Blockly.IComponent}
 * @interface
 */
Blockly.IDragTarget = function() {};

/**
 * Return the drag target rectangle.
 * @return {Blockly.utils.Rect} Rectangle in which to block can be dragged over.
 */
Blockly.IDragTarget.prototype.getClientRect;

/**
 * Handles Drag enter.
 */
Blockly.IDragTarget.prototype.onDragEnter;

/**
 * Handles a drag exit.
 */
Blockly.IDragTarget.prototype.onDragExit;

/**
 * Computes the end location for a block after it is dropped on this component.
 * @param {!Blockly.utils.Coordinate} startXY The start xy.
 * @param {!Blockly.utils.Coordinate} delta The delta.
 * @return {!Blockly.utils.Coordinate} The end location.
 */
Blockly.IDragTarget.prototype.getEndDragLoc;

/**
 * Handles a block drop on this component. Should not handle delete here.
 * @param {!Blockly.BlockSvg} block The block.
 */
Blockly.IDragTarget.prototype.onBlockDrop;

/**
 * Returns whether the provided block would be deleted if dropped on this area.
 * @param {!Blockly.BlockSvg} block The block.
 * @param {boolean} couldConnect Whether the block could could connect to
 *     another.
 * @return {boolean} Whether the block provided would be deleted if dropped on
 *     this area.
 */
Blockly.IDragTarget.prototype.wouldDelete;

/**
 * Whether this is a bubble delete area.
 * @type {boolean}
 */
Blockly.IDragTarget.prototype.isBubbleDeleteArea;
