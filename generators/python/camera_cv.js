/**
 * @fileoverview Generating Python for camera/ComputerVision blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.cameraCompVision');

goog.require('Blockly.Python');

Blockly.Python.camera_take_picture = function (block) {
  var code = 'api.takePicture()\n';
  return code;
};

Blockly.Python.camera_check_for_simple_color = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE);
  var code = 'api.foundSimpleColor(' + color + ')';

  return [code, order];
};

Blockly.Python.camera_check_for_advanced_color = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  var nuances = Blockly.Python.valueToCode(block, 'NUANCES', Blockly.Python.ORDER_NONE) || 'None';
  var size = Blockly.Python.valueToCode(block, 'SIZE', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.foundAdvancedColor(' + color + ', ' + nuances + ', ' + size + ')';

  return [code, order];
};

Blockly.Python.camera_get_center_from_simple_color = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var coord = block.getFieldValue('COLOR_CENTER');
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  var code = 'api.getSimpleColorCenter(' + color + ')';
  code += (coord[1] === 'x') ? '[0]' : '[1]';

  return [code, order];
};

Blockly.Python.camera_get_center_from_advanced_color = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var coord = block.getFieldValue('COLOR_CENTER');
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  var nuances = Blockly.Python.valueToCode(block, 'NUANCES', Blockly.Python.ORDER_NONE) || 'None';
  var size = Blockly.Python.valueToCode(block, 'SIZE', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.getAdvancedColorCenter(' + color + ',' + nuances + ',' + size + ')';
  code += (coord[1] === 'x') ? '[0]' : '[1]';

  return [code, order];
};

Blockly.Python.camera_check_for_motion = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var amount = Blockly.Python.valueToCode(block, 'AMOUNT', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.detectedMotion(' + amount + ')';

  return [code, order];
};

Blockly.Python.camera_get_center_of_motion = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var coord = block.getFieldValue('MOTION_CENTER');
  var amount = Blockly.Python.valueToCode(block, 'AMOUNT', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.getMotionCenter(' + amount + ')';
  code += (coord[1] === 'x') ? '[0]' : '[1]';

  return [code, order];
};
