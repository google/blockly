/**
 * @fileoverview Generating Python for actions/joint blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.actionsJoint');

goog.require('Blockly.Python');

Blockly.Python.fable_set_module_motor_positions = function (block) {
  var id = block.getDynamicIDFieldString();
  var posX = Blockly.Python.valueToCode(block, 'MOTOR_POSITION_X', Blockly.Python.ORDER_NONE) || 'None';
  var posY = Blockly.Python.valueToCode(block, 'MOTOR_POSITION_Y', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.setPos(' + posX + ', ' + posY + ', ' + id + ')\n';
  code += 'api.setSpeed(50, 50, ' + id + ')\n';

  return code;
};

Blockly.Python.fable_set_module_motor_pos_speed = function (block) {
  var id = block.getDynamicIDFieldString();
  var posX = Blockly.Python.valueToCode(block, 'MOTOR_POSITION_X', Blockly.Python.ORDER_NONE) || 'None';
  var posY = Blockly.Python.valueToCode(block, 'MOTOR_POSITION_Y', Blockly.Python.ORDER_NONE) || 'None';
  var v = Blockly.Python.valueToCode(block, 'MOTORS_SPEEDS', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.setPos(' + posX + ', ' + posY + ', ' + id + ')\n';
  code += 'api.setSpeed(' + v + ', ' + v + ', ' + id + ')\n';

  return code;
};

Blockly.Python.fable_set_module_accuracy = function (block) {
  var id = block.getDynamicIDFieldString();
  var accuracy = block.getFieldValue('MOTOR_ACCURACY_VALUE');
  accuracy = '\'' + accuracy + '\'';
  var code = 'api.setAccurate(' + accuracy + ', ' + accuracy + ', ' + id + ')\n';

  return code;
};