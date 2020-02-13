/**
 * @fileoverview Generating Python for obsolete blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.obsolete');

goog.require('Blockly.Python');

Blockly.Python.fable_is_face_playing_sound = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var code = 'api.getIsFacePlayingSound()';

  return [code, order];
};

Blockly.Python.fable_set_module_buzzer = function (block) {
  var toneValue = Blockly.Python.valueToCode(block, 'TONE', Blockly.Python.ORDER_NONE) || '0';
  var code = 'api.playBeep(' + toneValue + ')\n';
  return code;
};

Blockly.Python.fable_tts = function (block) {
  let text = block.getFieldValue('text');
  let name = block.getFieldValue('file_name');
  const lang = block.getFieldValue('language');

  const wRegEx = '^\s*$'; // checks if empty string or arbitrary number of spaces

  if (text.match(wRegEx)) {
    // set default string if empty string or spaces
    text = 'Your text here';
  } else if (name.match(wRegEx)) {
    // and default file name + ISO date string
    name = 'text_to_speech' + (new Date().toISOString()).toString();
  }
  const code = 'api.generateTextToSpeech("' + text + '", "' + name + '", "' + lang + '")\n';

  return code;
};

Blockly.Python.fable_percentage = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var value = block.getFieldValue('PERCENTAGE');

  return [value, order];
};

Blockly.Python.fable_code = function (block) {
  var value = block.getFieldValue('CODE');
  var code = value + '\n';

  return code;
};

Blockly.Python.fable_make_advanced_plot = function (block) {
  var value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  var type = block.getFieldValue('LEGEND');
  var code = 'api.plot(' + value + ', "' + type + '","' + color + '")\n';
  return code;
};

Blockly.Python.fable_print = function (block) {
  var value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.output(' + value + ')\n';

  return code;
};

Blockly.Python.fable_set_module_motor_position = function (block) {
  var id = block.getDynamicIDFieldString();
  var pos = Blockly.Python.valueToCode(block, 'MOTOR_POSITION', Blockly.Python.ORDER_NONE) || 'None';
  var code = 'api.setPos(' + pos + ', None,' + id + ')\n';

  return code;
};

Blockly.Python.fable_set_iris_color = function (block) {
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[247, 148, 27]';
  var code = 'api.setIrisColor(' + color + ')\n';
  return code;
};

Blockly.Python.fable_set_eyelid_color = function (block) {
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[247, 148, 27]';
  var code = 'api.setEyelidColor(' + color + ')\n';

  return code;
};

Blockly.Python.fable_set_face_focus_single_eye = function (block) {
  var x = Blockly.Python.valueToCode(block, 'POS_X', Blockly.Python.ORDER_NONE) || '0';
  var y = Blockly.Python.valueToCode(block, 'POS_Y', Blockly.Python.ORDER_NONE) || '0';
  var z = Blockly.Python.valueToCode(block, 'POS_Z', Blockly.Python.ORDER_NONE) || '0';
  var eye = block.getFieldValue('EYE');
  var code = 'api.setFaceFocus(' + x + ', ' + y + ', ' + z + ', ' + eye + ')\n';

  return code;
};

Blockly.Python.fable_set_face_blink = function (block) {
  var duration = Blockly.Python.valueToCode(block, 'BLINK_DURATION', Blockly.Python.ORDER_NONE) || '0';
  var code = 'api.setFaceBlink(' + duration + ')\n';

  return code;
};

Blockly.Python.fable_set_face_blink_single_eye = function (block) {
  var duration = Blockly.Python.valueToCode(block, 'BLINK_DURATION', Blockly.Python.ORDER_NONE) || '0';
  var eye = block.getFieldValue('EYE');
  var code = 'api.setFaceBlink(' + duration + ', ' + eye + ')\n';

  return code;
};

Blockly.Python.test_key = function (block) {
  var argument0 = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '0';
  var varName = Blockly.Python.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);

  return varName + ' = ' + argument0 + '\n';
};

Blockly.Python.test_variables_set = function (block) {
  var argument0 = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || '0';
  var varName = Blockly.Python.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);

  return varName + ' = ' + argument0 + '\n';
};

Blockly.Python.fable_spin_lift_and_hold = function (block) {
  const id = block.getDynamicIDFieldString();
  const angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_NONE) || 'None';
  const motorID = block.getFieldValue('MOTOR_ID');

  const code = 'api.spinLiftPos(' + angle + ', \'' + motorID + '\', moduleID=' + id + ')\n';

  return code;
};

Blockly.Python.fable_spin_turn_with_radius = function (block) {
  const id = block.getDynamicIDFieldString();
  const angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_NONE) || '0';
  const radius = Blockly.Python.valueToCode(block, 'RADIUS', Blockly.Python.ORDER_NONE) || '0';
  const metric = block.getFieldValue('METRIC');
  // let motor_speed = Blockly.Python.valueToCode(block, 'MOTOR_SPEED', Blockly.Python.ORDER_NONE) || '50';

  const code = 'api.spinTurn(' + angle + ', ' + radius + ', ' + metric + ', ' + id + ')\n';

  return code;
};

Blockly.Python.fable_spin_reset = function (block) {
  const id = block.getDynamicIDFieldString();
  const target = block.getFieldValue('TARGET_MOTOR');
  const code = 'api.spinReset(\'' + target + '\', ' + id + ')\n';

  return code;
};

Blockly.Python.fable_spin_signal = function (block) {
  const id = block.getDynamicIDFieldString();
  const signalValue = Blockly.Python.valueToCode(block, 'SIGNAL_VALUE', Blockly.Python.ORDER_NONE) || '100';

  const code = 'api.setSpinSignal(' + signalValue + ', ' + id + ')\n';
  return code;
};

Blockly.Python.fable_spin_get_odometry = function (block) {
  const id = block.getDynamicIDFieldString();
  const coord = block.getFieldValue('COORDINATE');

  const code = 'api.getSpinOdometry(\'' + coord + '\', ' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_spin_reset_odometry = function (block) {
  const id = block.getDynamicIDFieldString();

  const code = 'api.resetSpinOdometry(' + id + ')\n';
  return code;
};

Blockly.Python.fable_spin_get_signal = function (block) {
  const id = block.getDynamicIDFieldString();
  const code = 'api.getSpinSignal(' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.fable_play_face_sound = function (block) {
  var value = block.getFieldValue('SOUNDFILE');
  var code = 'api.playFaceSound(\'' + value + '\')\n';

  return code;
};

Blockly.Python.camera_check_for_face = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var code = 'api.detectedFace()';

  return [code, order];
};

Blockly.Python.camera_get_center_of_face = function (block) {
  var coord = block.getFieldValue('FACE_CENTER');
  var code = 'api.getFaceCenter()';
  code += (coord[1] === 'x') ? '[0]' : '[1]';
  var order = Blockly.Python.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Python.fable_spin_gesture_detected = function (block) {
  const id = block.getDynamicIDFieldString();
  const gesture = block.getFieldValue('GESTURE');
  var code = 'api.getGestureDetected("' + gesture + '", ' + id + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};
