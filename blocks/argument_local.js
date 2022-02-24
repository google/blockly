/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Procedure blocks for Blockly.
 * @suppress {checkTypes|visibility}
 */

'use strict';

goog.module('Blockly.blocks.argumentLocal');

const Events = goog.require('Blockly.Events');
const {Blocks} = goog.require('Blockly.blocks');

 Blocks['argument_local'] = {


  init: function() {
    this.jsonInit({
      'message0': '%1 %2',
      'args0': [
        {
          'type': 'field_label_hover',
          'name': 'VALUE',
          'text': '',
        },
      ],
      'colour': '#ffbf00',
      'inputsInline': true,
      'output': null,
    });
  },


  onchange: function(event) {
    if (event.type !== Events.BLOCK_MOVE) {
      return;
    }

    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return; // Don't change state at the start of a drag.
    }

    let enable = true;

    if (!this.getParent()) {
      enable = false;
    }

    Events.disable();
    if (enable) {
      this.setEnabled(true);
    } else {
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false);
      }
    }
    Events.enable();
  },
};
