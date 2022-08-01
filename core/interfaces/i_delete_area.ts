/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
 */

'use strict';

/**
 * The interface for a component that can delete a block or bubble
 * that is dropped on top of it.
 * @namespace Blockly.IDeleteArea
 */
goog.module('Blockly.IDeleteArea');

/* eslint-disable-next-line no-unused-vars */
const {IDragTarget} = goog.require('Blockly.IDragTarget');
/* eslint-disable-next-line no-unused-vars */
const {IDraggable} = goog.requireType('Blockly.IDraggable');


/**
 * Interface for a component that can delete a block or bubble that is dropped
 * on top of it.
 * @extends {IDragTarget}
 * @interface
 * @alias Blockly.IDeleteArea
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

exports.IDeleteArea = IDeleteArea;
