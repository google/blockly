/**
 * @fileoverview Generating Python for actions/spin blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.actionsSpin');

goog.require('Blockly.Python');

Blockly.Python.fable_set_speed_simple = function (block) {
  const id = block.getDynamicIDFieldString();

  const selection = block.getFieldValue('MOVEMENT');

  let code = 'api.setSpinSpeed(-50, 50, ' + id + ')\n';

  if (selection === 'backward') {
    code = 'api.setSpinSpeed(50, -50, ' + id + ')\n';
  } else if (selection === 'stop') {
    code = 'api.setSpinSpeed(0, 0, ' + id + ')\n';
  } else if (selection === 'left') {
    code = 'api.setSpinSpeed(-50, -50, ' + id + ')\n';
  } else if (selection === 'right') {
    code = 'api.setSpinSpeed(50, 50, ' + id + ')\n';
  }

  return code;
};

Blockly.Python.fable_spin_set_speed = function (block) {
  const id = block.getDynamicIDFieldString();
  const speedA = Blockly.Python.valueToCode(block, 'MOTOR_A_SPEED', Blockly.Python.ORDER_NONE) || 'None';
  const speedB = Blockly.Python.valueToCode(block, 'MOTOR_B_SPEED', Blockly.Python.ORDER_NONE) || 'None';

  const code = 'api.setSpinSpeed(' + speedA + ', ' + speedB + ', ' + id + ')\n';
  return code;
};

Blockly.Python.fable_spin_drive = function (block) {
  const id = block.getDynamicIDFieldString();
  const distance = Blockly.Python.valueToCode(block, 'DISTANCE', Blockly.Python.ORDER_NONE) || 'None';
  const metric = block.getFieldValue('METRIC');

  const code = 'api.driveByMetric(' + distance + ', ' + metric + ', ' + id + ')\n';

  return code;
};

Blockly.Python.fable_spin_drive_with_speed = function (block) {
  const id = block.getDynamicIDFieldString();
  const distance = Blockly.Python.valueToCode(block, 'DISTANCE', Blockly.Python.ORDER_NONE) || 'None';
  const metric = block.getFieldValue('METRIC');
  const speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE) || 'None';

  const code = 'api.driveByMetric(' + distance + ', ' + metric + ', ' + id + ', ' + speed + ')\n';

  return code;
};

Blockly.Python.fable_spin_spin = function (block) {
  const id = block.getDynamicIDFieldString();
  const turns = Blockly.Python.valueToCode(block, 'TURNS', Blockly.Python.ORDER_NONE) || 'None';
  const metric = block.getFieldValue('METRIC');
  const code = 'api.spinByMetric(' + turns + ', ' + metric + ', ' + id + ')\n';
  return code;
};

Blockly.Python.fable_spin_spin_with_speed = function (block) {
  const id = block.getDynamicIDFieldString();
  const turns = Blockly.Python.valueToCode(block, 'TURNS', Blockly.Python.ORDER_NONE) || 'None';
  const metric = block.getFieldValue('METRIC');
  const speed = Blockly.Python.valueToCode(block, 'SPEED', Blockly.Python.ORDER_NONE) || 'None';

  const code = 'api.spinByMetric(' + turns + ', ' + metric + ', ' + id + ', ' + speed + ')\n';
  return code;
};

Blockly.Python.fable_spin_headlights = function (block) {
  const id = block.getDynamicIDFieldString();
  var selection = block.getFieldValue('HEADLIGHTS_ACTION');

  const code = "api.setSpinHeadlight('" + selection + "', " + id + ')\n';
  return code;
};

Blockly.Python.fable_spin_set_ir_message = function (block) {
  const id = block.getDynamicIDFieldString();
  const message = block.getField('MESSAGE').convertKeyToCode();
  const code = 'api.setSpinIrMsg(' + message + ', ' + id + ')\n';
  return code;
};

Blockly.Python.fable_spin_reset_encoder = function (block) {
  const id = block.getDynamicIDFieldString();
  // let motorID = Blockly.Python.valueToCode(block, 'MOTOR_ID', Blockly.Python.ORDER_NONE) || 'None';
  const motorID = block.getFieldValue('MOTOR_ID');
  const code = 'api.spinResetEncoder(\'' + motorID + '\', ' + id + ')\n';
  return code;
};
