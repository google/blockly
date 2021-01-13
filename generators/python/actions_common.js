/**
 * @fileoverview Generating Python for actions/common blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.actionsCommon');

goog.require('Blockly.Python');

Blockly.Python.fable_set_module_rgb = function (block) {
  var id = block.getDynamicIDFieldString();
  var rgbValues = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[None, None, None]';
  var code = 'api.setColor(' + rgbValues + ', ' + id + ')\n';

  return code;
};

Blockly.Python.fable_set_channel_color = function (block) {
  // var id = block.getDynamicIDFieldString();
  var id = block.getFieldValue('MODULE');
  var code = 'api.recoverChannelColor("' + id + '")\n';

  return code;
};

Blockly.Python.fable_speak = function (block) {
  var text = Blockly.Python.valueToCode(block, 'INPUT_TEXT', Blockly.Python.ORDER_NONE) || 'default value';
  var lang = block.getLanguage();
  if (lang === undefined) {
    lang = 'en';
  }

  const matchGroups = /(str\()(.*)(\)\s\+\s'\s'\s\+\sstr\()(.*)(\))/gm.exec(text);
  let croppedText = text;
  if (matchGroups && matchGroups.length >= 5) {
    croppedText = matchGroups[2] + matchGroups[4];
  }

  var code = 'api.fableSpeak(str(' + text + '), "' + lang + '")\n';

  if (croppedText.length && croppedText.length > 200) {
    // 666 is a special ID in order to support easily removing the warning later, without clearing OTHER warnings on the block
    block.setWarningText(Blockly.Msg.FABLE_FIELD_WRN_TEXT_TOO_LONG, 666);
  } else {
    block.setWarningText(null, 666);
  }

  return code;
};

Blockly.Python.fable_speak_lang = function (block) {
  var text = Blockly.Python.valueToCode(block, 'INPUT_TEXT', Blockly.Python.ORDER_NONE) || 'default value';
  var lang = block.getFieldValue('LANGUAGE');
  var code = 'api.fableSpeak(str(' + text + '), "' + lang + '")\n';

  const matchGroups = /(str\()(.*)(\)\s\+\s'\s'\s\+\sstr\()(.*)(\))/gm.exec(text);
  let croppedText = text;
  if (matchGroups && matchGroups.length >= 5) {
    croppedText = matchGroups[2] + matchGroups[4];
  }

  if (croppedText.length && croppedText.length > 200) {
    // 666 is a special ID in order to support easily removing the warning later, without clearing OTHER warnings on the block
    block.setWarningText(Blockly.Msg.FABLE_FIELD_WRN_TEXT_TOO_LONG, 666);
  } else {
    block.setWarningText(null, 666);
  }

  return code;
};

Blockly.Python.fable_play_sound = function (block) {
  var file = block.getFieldValue('SOUNDFILE');
  var device = block.getFieldValue('MODULE');
  var code = 'api.playSound("' + file + '", \'' + device + '\')\n';

  return code;
};

/**
 * Plays a specific mp3 or wave available in the designated "My Fable Sounds" folder
 */
Blockly.Python.fable_play_custom_sound = function (block) {
  var file = block.getFieldValue('SOUNDFILE');
  var code = 'api.playPCSound("' + file + '", \'' + 'custom' + '\')\n';

  return code;
};

Blockly.Python.fable_play_note = function (block) {
  var soundFile = block.getFieldValue('SOUNDFILE');
  var code = 'api.playNote(\'' + soundFile + '\');\n';

  return code;
};
