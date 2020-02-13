/**
 * @fileoverview Generating Python for senses/common blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.sensesCommon');

goog.require('Blockly.Python');

Blockly.Python.fable_get_module_id = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var id = block.getDynamicIDFieldString();
  var code = id;

  return [code, order];
};

Blockly.Python.fable_get_time = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var code = 'api.getTime()';

  return [code, order];
};

Blockly.Python.fable_get_microphone = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var code = 'api.getSoundLevel()';

  return [code, order];
};

Blockly.Python.fable_get_module_battery = function (block) {
  var id = block.getDynamicIDFieldString();
  var code = 'api.getBattery(' + id + ')';
  var order = Blockly.Python.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Python.fable_check_key = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var key = block.getFieldValue('CHECK_KEY');
  var code = 'api.isPressed(\'' + key + '\')';

  return [code, order];
};

Blockly.Python.fable_check_custom_key = function (block) {
  // Important: this only works because the KEYBUTTON field is of type ButtonInput.
  var keyString = block.getField('KEYBUTTON').convertKeyToCode();
  var code = 'api.isPressed(\'' + keyString + '\')';
  var order = Blockly.Python.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Python.fable_get_chromebook_sensor = function (block) {
  return '';
};

Blockly.Python.fable_get_chromebook_gesture = function (block) {
  return '';
};
