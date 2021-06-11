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

goog.requireType('Blockly.IDraggable');


/**
 * Interface for a component that can delete a block or bubble that is dropped
 * on top of it.
 * @extends {Blockly.IDragTarget}
 * @interface
 */
Blockly.IDeleteArea = function() {};

/**
 * Returns whether the provided block or bubble would be deleted if dropped on
 * this area.
 * This method should check if the element is deletable and is always called
 * before onDragEnter/onDragOver/onDragExit.
 * @param {!Blockly.IDraggable} element The block or bubble currently being
 *   dragged.
 * @param {boolean} couldConnect Whether the element could could connect to
 *     another.
 * @return {boolean} Whether the element provided would be deleted if dropped on
 *     this area.
 */
Blockly.IDeleteArea.prototype.wouldDelete;
