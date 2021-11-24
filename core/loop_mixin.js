/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The mixin that holds logic for setting a warning on a block if
 * it is not inside a loop.
 */
'use strict';

goog.module('Blockly.loopMixin');

/* eslint-disable-next-line no-unused-vars */
const Abstract = goog.requireType('Blockly.Events.Abstract');
const Events = goog.require('Blockly.Events');
const Extensions = goog.require('Blockly.Extensions');
const Msg = goog.require('Blockly.Msg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * This mixin adds a check to make sure the 'controls_flow_statements' block
 * is contained in a loop. Otherwise a warning is added to the block.
 * @mixin
 * @augments Block
 * @readonly
 */
const CONTROL_FLOW_IN_LOOP_CHECK_MIXIN = {
  /**
   * List of block types that are loops and thus do not need warnings.
   * To add a new loop type add this to your code:
   * Blockly.loopMixin.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.LOOP_TYPES.push('custom_loop');
   */
  LOOP_TYPES: [
    'controls_repeat',
    'controls_repeat_ext',
    'controls_forEach',
    'controls_for',
    'controls_whileUntil',
  ],

  /**
   * Is the given block enclosed (at any level) by a loop?
   * @param {!Block} block Current block.
   * @return {?Block} The nearest surrounding loop, or null if none.
   */
  getSurroundLoop: function(block) {
    let searchBlock = block;
    // Is the block nested in a loop?
    do {
      if (CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.LOOP_TYPES.indexOf(
              searchBlock.type) !== -1) {
        return searchBlock;
      }
      searchBlock = searchBlock.getSurroundParent();
    } while (searchBlock);
    return null;
  },

  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Abstract} e Change event.
   * @this {Block}
   */
  onchange: function(e) {
    // Don't change state if:
    //   * It's at the start of a drag.
    //   * It's not a move event.
    if (!this.workspace.isDragging || this.workspace.isDragging() ||
        e.type !== Events.BLOCK_MOVE) {
      return;
    }
    const enabled = !!CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(this);
    this.setWarningText(
        enabled ? null : Msg['CONTROLS_FLOW_STATEMENTS_WARNING']);
    if (!this.isInFlyout) {
      const group = Events.getGroup();
      // Makes it so the move and the disable event get undone together.
      Events.setGroup(e.group);
      this.setEnabled(enabled);
      Events.setGroup(group);
    }
  },
};
exports.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN = CONTROL_FLOW_IN_LOOP_CHECK_MIXIN;

Extensions.registerMixin(
    'controls_flow_in_loop_check', CONTROL_FLOW_IN_LOOP_CHECK_MIXIN);