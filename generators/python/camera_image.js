/**
 * @fileoverview Generating Python for Camera/Image blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.cameraImage');

goog.require('Blockly.Python');

Blockly.Python.fable_imshow = function (block) {
  var image = Blockly.Python.valueToCode(block, 'IMAGE', Blockly.Python.ORDER_NONE) || '\'None\'';
  // var code = 'api.imshow("' + file + '", ' + 'default' + '\')\n';
  var code = 'api.showImage(' + image + ')\n';

  return code;
};

Blockly.Python.fable_imread = function (block) {
  var file = block.getFieldValue('IMAGEFILE');
  var code = 'api.readImage("' + file + '")';
  var order = Blockly.Python.ORDER_ATOMIC;

  return [code, order];
};

Blockly.Python.fable_imfilter = function (block) {
  var filter = block.getMutatedDropdownValue(['canny', 'gaussian', 'thresholding'], 'SENSITIVITY');
  var filterType = filter[0];
  var sensitivity = filter[1];

  var image = Blockly.Python.valueToCode(block, 'IMAGE', Blockly.Python.ORDER_NONE) || '\'None\'';
  var code;

  if (sensitivity != null) {
    code = 'api.applyFilter("' + filterType + '", ' + image + ', ' + sensitivity + ')';
  } else {
    code = 'api.applyFilter("' + filterType + '", ' + image + ')';
  }

  var order = Blockly.Python.ORDER_ATOMIC;

  return [code, order];
};

Blockly.Python.fable_imsave = function (block) {
  var image = Blockly.Python.valueToCode(block, 'IMAGE', Blockly.Python.ORDER_NONE) || '\'None\'';
  var filename = block.getFieldValue('FILENAME');
  var code = 'api.saveImage(' + image + ', "' + filename + '")\n';

  return code;
};