/**
 * Blockly Apps: Graphing Calculator Blocks
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Blocks for Blockly's Graphing Calculator application.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

Blockly.Blocks['graph_get_x'] = {
  // x variable getter.
  init: function() {
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setColour(330);
    this.appendDummyInput()
        .appendField('x');
    this.setOutput(true, 'Number');
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
  }
};

Blockly.JavaScript['graph_get_x'] = function(block) {
  // x variable getter.
  return ['x', Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['graph_set_y'] = {
  // y variable setter.
  init: function() {
    this.setHelpUrl(Blockly.Msg.VARIABLES_SET_HELPURL);
    this.setColour(330);
    this.appendValueInput('VALUE')
        .appendField('y =');
    this.setTooltip(Blockly.Msg.VARIABLES_SET_TOOLTIP);
  }
};

Blockly.JavaScript['graph_set_y'] = function(block) {
  // y variable setter.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || '';
  return argument0 + ';';
};
