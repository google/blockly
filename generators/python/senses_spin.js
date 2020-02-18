/**
 * @fileoverview Generating Python for senses/spin blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.sensesSpin');

goog.require('Blockly.Python');

Blockly.Python.fable_spin_get_sensor = function (block) {
  const id = block.getDynamicIDFieldString();
  const measure = block.getFieldValue('MEASURE');
  const sensorID = block.getFieldValue('SPIN_SENSOR');

  const code = 'api.getSpinSensorReading(\'' + measure + '\', ' + sensorID + ', ' + id + ')';

  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_spin_obstacle_detected = function (block) {
  const id = block.getDynamicIDFieldString();
  const proximity = Blockly.Python.valueToCode(block, 'PROXIMITY_PERC', Blockly.Python.ORDER_NONE) || '0';
  const code = 'api.spinObstacleDetected(' + proximity + ', ' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_spin_color_found = function (block) {
  const id = block.getDynamicIDFieldString();
  const color = block.getFieldValue('COLOUR') || '[0, 0, 0]';
  const code = 'api.getSpinIsColorFound(' + color + ', ' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_spin_motor_moving = function (block) {
  const id = block.getDynamicIDFieldString();
  const motorCombo = block.getFieldValue('MOTOR'); // any, no, A, B

  const code = 'api.areSpinMotorsMoving(\'' + motorCombo + '\', ' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_spin_get_motor = function (block) {
  const id = block.getDynamicIDFieldString();
  const metric = block.getFieldValue('MEASURE');
  const code = 'api.getSpinMotorMetric(\'' + metric + '\', ' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_spin_has_reached_target = function (block) {
  const order = Blockly.Python.ORDER_ATOMIC;
  const id = block.getDynamicIDFieldString();
  const motor = block.getFieldValue('MOTOR');
  const code = 'api.getSpinHasReachedTarget(\'' + motor + '\', ' + id + ')';
  return [code, order];
};

Blockly.Python.fable_spin_get_ir_message = function (block) {
  const order = Blockly.Python.ORDER_ATOMIC;
  const message = block.getField('MESSAGE').convertKeyToCode();
  const id = block.getDynamicIDFieldString();
  const code = '(api.getSpinIrMsg(' + id + ') is ' + message + ')';
  return [code, order];
};
