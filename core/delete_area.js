/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The abstract class for a component that can delete a block or
 * bubble that is dropped on top of it.
 */

'use strict';

/**
 * The abstract class for a component that can delete a block or
 * bubble that is dropped on top of it.
 * @class
 */
goog.module('Blockly.DeleteArea');

const object = goog.require('Blockly.utils.object');
const {BlockSvg} = goog.require('Blockly.BlockSvg');
const {DragTarget} = goog.require('Blockly.DragTarget');
/* eslint-disable-next-line no-unused-vars */
const {IDeleteArea} = goog.require('Blockly.IDeleteArea');
/* eslint-disable-next-line no-unused-vars */
const {IDraggable} = goog.requireType('Blockly.IDraggable');


/**
 * Abstract class for a component that can delete a block or bubble that is
 * dropped on top of it.
 * @extends {DragTarget}
 * @implements {IDeleteArea}
 * @constructor
 * @alias Blockly.DeleteArea
 */
const DeleteArea = function() {
  DeleteArea.superClass_.constructor.call(this);

  /**
   * Whether the last block or bubble dragged over this delete area would be
   * deleted if dropped on this component.
   * This property is not updated after the block or bubble is deleted.
   * @type {boolean}
   * @protected
   */
  this.wouldDelete_ = false;
};
object.inherits(DeleteArea, DragTarget);

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
DeleteArea.prototype.wouldDelete = function(element, couldConnect) {
  if (element instanceof BlockSvg) {
    const block = /** @type {BlockSvg} */ (element);
    const couldDeleteBlock = !block.getParent() && block.isDeletable();
    this.updateWouldDelete_(couldDeleteBlock && !couldConnect);
  } else {
    this.updateWouldDelete_(element.isDeletable());
  }
  return this.wouldDelete_;
};

/**
 * Updates the internal wouldDelete_ state.
 * @param {boolean} wouldDelete The new value for the wouldDelete state.
 * @protected
 */
DeleteArea.prototype.updateWouldDelete_ = function(wouldDelete) {
  this.wouldDelete_ = wouldDelete;
};

exports.DeleteArea = DeleteArea;
