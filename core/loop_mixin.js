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

const Extensions = goog.require('Blockly.Extensions');


/**
 * This mixin adds a check to make sure the 'controls_flow_statements' block
 * is contained in a loop. Otherwise a warning is added to the block.
 * @mixin
 * @augments Blockly.Block
 * @readonly
 */
const CONTROL_FLOW_IN_LOOP_CHECK_MIXIN = {
    /**
     * List of block types that are loops and thus do not need warnings.
     * To add a new loop type add this to your code:
     * Blockly.LoopMixin.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.LOOP_TYPES.push('custom_loop');
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
     * @param {!Blockly.Block} block Current block.
     * @return {Blockly.Block} The nearest surrounding loop, or null if none.
     */
    getSurroundLoop: function(block) {
        // Is the block nested in a loop?
        do {
            if (this.LOOP_TYPES.indexOf(block.type) !== -1) {
                return block;
            }
            block = block.getSurroundParent();
        } while (block);
        return null;
    },

    /**
     * Called whenever anything on the workspace changes.
     * Add warning if this flow block is not nested inside a loop.
     * @param {!Blockly.Events.Abstract} e Change event.
     * @this {Blockly.Block}
     */
    onchange: function(e) {
        // Don't change state if:
        //   * It's at the start of a drag.
        //   * It's not a move event.
        if (!this.workspace.isDragging || this.workspace.isDragging() ||
            e.type !== Blockly.Events.BLOCK_MOVE) {
            return;
        }
        const enabled = this.getSurroundLoop(this);
        this.setWarningText(enabled ? null :
            Blockly.Msg['CONTROLS_FLOW_STATEMENTS_WARNING']);
        if (!this.isInFlyout) {
            const group = Blockly.Events.getGroup();
            // Makes it so the move and the disable event get undone together.
            Blockly.Events.setGroup(e.group);
            this.setEnabled(enabled);
            Blockly.Events.setGroup(group);
        }
    },
};
exports.CONTROL_FLOW_IN_LOOP_CHECK_MIXIN = CONTROL_FLOW_IN_LOOP_CHECK_MIXIN;

Extensions.registerMixin('controls_flow_in_loop_check', CONTROL_FLOW_IN_LOOP_CHECK_MIXIN);