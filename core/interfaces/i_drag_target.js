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

goog.module('Blockly.IDragTarget');
goog.module.declareLegacyNamespace();

goog.require('Blockly.IComponent');

goog.requireType('Blockly.IDraggable');
goog.requireType('Blockly.utils.Rect');

/**
 * Interface for a component with custom behaviour when a block or bubble is
 * dragged over or dropped on top of it.
 * @extends {Blockly.IComponent}
 * @interface
 */
const IDragTarget = function() {};

/**
 * Returns the bounding rectangle of the drag target area in pixel units
 * relative to viewport.
 * @return {?Blockly.utils.Rect} The component's bounding box. Null if drag
 *   target area should be ignored.
 */
IDragTarget.prototype.getClientRect;

/**
 * Handles when a cursor with a block or bubble enters this drag target.
 * @param {!Blockly.IDraggable} dragElement The block or bubble currently being
 *   dragged.
 */
IDragTarget.prototype.onDragEnter;

/**
 * Handles when a cursor with a block or bubble is dragged over this drag
 * target.
 * @param {!Blockly.IDraggable} dragElement The block or bubble currently being
 *   dragged.
 */
IDragTarget.prototype.onDragOver;


/**
 * Handles when a cursor with a block or bubble exits this drag target.
 * @param {!Blockly.IDraggable} dragElement The block or bubble currently being
 *   dragged.
 */
IDragTarget.prototype.onDragExit;

/**
 * Handles when a block or bubble is dropped on this component.
 * Should not handle delete here.
 * @param {!Blockly.IDraggable} dragElement The block or bubble currently being
 *   dragged.
 */
IDragTarget.prototype.onDrop;

/**
 * Returns whether the provided block or bubble should not be moved after being
 * dropped on this component. If true, the element will return to where it was
 * when the drag started.
 * @param {!Blockly.IDraggable} dragElement The block or bubble currently being
 *   dragged.
 * @return {boolean} Whether the block or bubble provided should be returned to
 *     drag start.
 */
IDragTarget.prototype.shouldPreventMove;

exports = IDragTarget;
