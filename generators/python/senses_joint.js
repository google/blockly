/**
 * @fileoverview Generating Python for senses/joint blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.sensesJoint');

goog.require('Blockly.Python');

Blockly.Python.fable_get_module_motor_position = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var id = block.getDynamicIDFieldString();
  var mid = block.getFieldValue('MOTOR_ID');
  var code = 'api.getPos(' + mid + ', ' + id + ')';

  return [code, order];
};

Blockly.Python.fable_get_module_motor_speed = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var id = block.getDynamicIDFieldString();
  var mid = block.getFieldValue('MOTOR_ID');
  var code = 'api.getSpeed(' + mid + ', ' + id + ')';

  return [code, order];
};

Blockly.Python.fable_get_module_motor_torque = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var id = block.getDynamicIDFieldString();
  var mid = block.getFieldValue('MOTOR_ID');
  var code = 'api.getTorque(' + mid + ', ' + id + ')';

  return [code, order];
};

Blockly.Python.fable_read_joint_sensor = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var id = block.getDynamicIDFieldString();
  var metric = block.getFieldValue('METRIC');
  var code = 'api.readJointSensor(' + metric + ', ' + id + ')';

  return [code, order];
};
