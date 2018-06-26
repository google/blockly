/**
 * Blockly Demos: Plane Seat Calculator Blocks
 *
 * Copyright 2013 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Blocks for Blockly's Plane Seat Calculator application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks['plane_set_seats'] = {
  // Block seat variable setter.
  init: function() {
    this.setHelpUrl(Blockly.Msg['VARIABLES_SET_HELPURL']);
    this.setColour(330);
    this.appendValueInput('VALUE')
        .appendField(Plane.getMsg('Plane_setSeats'));
    this.setTooltip(Blockly.Msg['VARIABLES_SET_TOOLTIP']);
    this.setDeletable(false);
  }
};

Blockly.JavaScript['plane_set_seats'] = function(block) {
  // Generate JavaScript for seat variable setter.
  var argument0 = Blockly.JavaScript.valueToCode(block, 'VALUE',
      Blockly.JavaScript.ORDER_ASSIGNMENT) || 'NaN';
  return argument0 + ';';
};

Blockly.Blocks['plane_get_rows'] = {
  // Block for row variable getter.
  init: function() {
    this.setHelpUrl(Blockly.Msg['VARIABLES_GET_HELPURL']);
    this.setColour(330);
    this.appendDummyInput()
        .appendField(Plane.getMsg('Plane_getRows'), 'title');
    this.setOutput(true, 'Number');
  },
  customUpdate: function() {
    this.setFieldValue(
        Plane.getMsg('Plane_getRows').replace('%1', Plane.rows1st), 'title');
  }
};

Blockly.JavaScript['plane_get_rows'] = function(block) {
  // Generate JavaScript for row variable getter.
  return ['Plane.rows1st', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Blocks['plane_get_rows1st'] = {
  // Block for first class row variable getter.
  init: function() {
    this.setHelpUrl(Blockly.Msg['VARIABLES_GET_HELPURL']);
    this.setColour(330);
    this.appendDummyInput()
        .appendField(Plane.getMsg('Plane_getRows1'), 'title');
    this.setOutput(true, 'Number');
  },
  customUpdate: function() {
    this.setFieldValue(
        Plane.getMsg('Plane_getRows1').replace('%1', Plane.rows1st), 'title');
  }
};

Blockly.JavaScript['plane_get_rows1st'] = function(block) {
  // Generate JavaScript for first class row variable getter.
  return ['Plane.rows1st', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Blocks['plane_get_rows2nd'] = {
  // Block for second class row variable getter.
  init: function() {
    this.setHelpUrl(Blockly.Msg['VARIABLES_GET_HELPURL']);
    this.setColour(330);
    this.appendDummyInput()
        .appendField(Plane.getMsg('Plane_getRows2'), 'title');
    this.setOutput(true, 'Number');
  },
  customUpdate: function() {
    this.setFieldValue(
        Plane.getMsg('Plane_getRows2').replace('%1', Plane.rows2nd), 'title');
  }
};

Blockly.JavaScript['plane_get_rows2nd'] = function(block) {
  // Generate JavaScript for second class row variable getter.
  return ['Plane.rows2nd', Blockly.JavaScript.ORDER_MEMBER];
};
