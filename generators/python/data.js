/**
 * @fileoverview Generating Python for data blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.data');

goog.require('Blockly.Python');

Blockly.Python.fable_log = function (block) {
  var value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_ATOMIC) || 'None';
  var filename = block.getFieldValue('FILENAME');
  var code = 'api.log(' + value + ', \'' + filename + '\')\n';

  return code;
};

Blockly.Python.fable_make_plot = function (block) {
  var value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
  var sid = block.getFieldValue('SERIES_ID');
  var code = 'api.plot(' + value + ', "' + sid + '")\n';

  return code;
};

Blockly.Python.fable_make_plot_xy = function (block) {
  var valueX = Blockly.Python.valueToCode(block, 'VALUE_X', Blockly.Python.ORDER_NONE) || 'None';
  var valueY = Blockly.Python.valueToCode(block, 'VALUE_Y', Blockly.Python.ORDER_NONE) || 'None';
  var sid = block.getFieldValue('SERIES_ID');
  var code = 'api.plotXY(' + valueX + ', ' + valueY + ', "' + sid + '")\n';

  return code;
};

Blockly.Python.fable_make_scatter_plot = function (block) {
  var valueX = Blockly.Python.valueToCode(block, 'VALUE_X', Blockly.Python.ORDER_NONE) || 'None';
  var valueY = Blockly.Python.valueToCode(block, 'VALUE_Y', Blockly.Python.ORDER_NONE) || 'None';
  var sid = block.getFieldValue('SERIES_ID');
  var code = 'api.plotScatter(' + valueX + ', ' + valueY + ', "' + sid + '")\n';

  return code;
};
