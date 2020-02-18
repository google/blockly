/**
 * @fileoverview Generating Python for actions/face blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.actionsFace');

goog.require('Blockly.Python');

Blockly.Python.fable_set_face_focus = function (block) {
  var x = Blockly.Python.valueToCode(block, 'POS_X', Blockly.Python.ORDER_NONE) || '0';
  var y = Blockly.Python.valueToCode(block, 'POS_Y', Blockly.Python.ORDER_NONE) || '0';
  var z = Blockly.Python.valueToCode(block, 'POS_Z', Blockly.Python.ORDER_NONE) || '0';
  var code = 'api.setFaceFocus(' + x + ', ' + y + ', ' + z + ')\n';

  return code;
};

Blockly.Python.fable_set_face_emotion = function (block) {
  var emo = block.getFieldValue('EMOTION_ID');
  var code = 'api.setFaceEmotion(' + emo + ')\n';

  return code;
};

Blockly.Python.fable_set_face_animation = function (block) {
  var anim = block.getFieldValue('EMOTION_ID');
  var code = 'api.setFaceAnimation(' + anim + ')\n';

  return code;
};

Blockly.Python.fable_blend_face_emotion = function (block) {
  var emo1 = block.getFieldValue('FIRST_ID');
  var emo2 = block.getFieldValue('SECOND_ID');
  var ratio = Blockly.Python.valueToCode(block, 'RATIO', Blockly.Python.ORDER_NONE) || 0;
  var code = 'api.blendFaceEmotions(' + emo1 + ', ' + emo2 + ', ' + ratio + ')\n';

  return code;
};

Blockly.Python.fable_set_eyes_color = function (block) {
  var target = block.getFieldValue('TARGET');
  var color = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[247, 148, 27]';
  var code = 'api.setEyeColor(' + target + ', ' + color + ')\n';

  return code;
};

Blockly.Python.fable_face_vibrate = function (block) {
  var code = 'api.setFaceVibrate()\n';

  return code;
};
