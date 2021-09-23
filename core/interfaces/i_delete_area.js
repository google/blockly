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

goog.module('Blockly.IDeleteArea');

/* eslint-disable-next-line no-unused-vars */
const IDraggable = goog.requireType('Blockly.IDraggable');
/* eslint-disable-next-line no-unused-vars */
const IDragTarget = goog.requireType('Blockly.IDragTarget');


/**
 * Interface for a component that can delete a block or bubble that is dropped
 * on top of it.
 * @extends {IDragTarget}
 * @interface
 */
const IDeleteArea = function() {};

/**
 * Returns whether the provided block or bubble would be deleted if dropped on
 * this area.
 * This method should check if the element is deletable and is always called
 * before onDragEnter/onDragOver/onDragExit.
 * @param {!IDraggable} element The block or bubble currently being
 *   dragged.
 * @param {boolean} couldConnect Whether the element could could connect to
 *     another.
 * @return {boolean} Whether the element provided would be deleted if dropped on
 *     this area.
 */
IDeleteArea.prototype.wouldDelete;

exports = IDeleteArea;
