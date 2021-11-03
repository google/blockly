/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Pitch field demo blocks.
 */

Blockly.Blocks['test_pitch_field'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('pitch')
        .appendField(new CustomFields.FieldPitch('7'), 'PITCH');
    this.setStyle('loop_blocks');
  }
};
