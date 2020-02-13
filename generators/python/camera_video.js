/**
 * @fileoverview Generating Python for camera/Video blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.cameraVideo');

goog.require('Blockly.Python');

Blockly.Python.fable_video_filter = function (block) {
  // var order = Blockly.Python.ORDER_ATOMIC;
  var filter = block.getMutatedDropdownValue(['canny', 'gaussian', 'thresholding', 'smear'], 'SENSITIVITY');
  var filterType = filter[0];
  var sensitivity = filter[1];
  var code;

  if (sensitivity != null) {
    code = 'api.feedFilter("' + filterType + '", ' + sensitivity + ')\n';
  } else {
    code = 'api.feedFilter("' + filterType + '")\n';
  }

  return code;
};

Blockly.Python.fable_clear_video_filters = function (block) {
  var code = 'api.resetVideoFilters()\n';
  return code;
};

Blockly.Python.fable_draw_circle = function (block) {
  var x = Blockly.Python.valueToCode(block, 'CENTROID_X', Blockly.Python.ORDER_NONE) || '0';
  var y = Blockly.Python.valueToCode(block, 'CENTROID_Y', Blockly.Python.ORDER_NONE) || '0';
  var r = Blockly.Python.valueToCode(block, 'RADIUS', Blockly.Python.ORDER_NONE) || '0';
  var rgbValues = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[None, None, None]';

  // var code = 'api.drawCircle((' + x + ',' + y + '), ' + r + ', ' + rgbValues + ')\n';
  var code = 'api.drawCircle((%x, %y), %r, %rgb)\n'
    .replace('%x', x)
    .replace('%y', y)
    .replace('%r', r)
    .replace('%rgb', rgbValues);

  return code;
};

Blockly.Python.fable_draw_rect = function (block) {
  var x = Blockly.Python.valueToCode(block, 'ORIGIN_X', Blockly.Python.ORDER_NONE) || '0';
  var y = Blockly.Python.valueToCode(block, 'ORIGIN_Y', Blockly.Python.ORDER_NONE) || '0';
  var w = Blockly.Python.valueToCode(block, 'WIDTH', Blockly.Python.ORDER_NONE) || '0';
  var h = Blockly.Python.valueToCode(block, 'HEIGHT', Blockly.Python.ORDER_NONE) || '0';
  var rgbValues = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[None, None, None]';

  // var code = 'api.drawRect((' + x + ',' + y + '), ' + w + ', ' + h + ', ' + rgbValues + ')\n';
  var code = 'api.drawRect((%x, %y), %w, %h, %rgb)\n'
    .replace('%x', x)
    .replace('%y', y)
    .replace('%w', w)
    .replace('%h', h)
    .replace('%rgb', rgbValues);

  return code;
};

Blockly.Python.fable_draw_text = function (block) {
  var s = Blockly.Python.valueToCode(block, 'INPUT_TEXT', Blockly.Python.ORDER_NONE) || 'Fable Blockly';
  var x = Blockly.Python.valueToCode(block, 'CENTROID_X', Blockly.Python.ORDER_NONE) || '0';
  var y = Blockly.Python.valueToCode(block, 'CENTROID_Y', Blockly.Python.ORDER_NONE) || '0';
  var rgbValues = Blockly.Python.valueToCode(block, 'COLOUR', Blockly.Python.ORDER_NONE) || '[None, None, None]';

  // var code = "api.drawText(" + s + ", (" + x + "," + y + "), " + rgbValues + ")\n";
  var code = 'api.drawText(%s, (%x, %y), %rgb)\n'
    .replace('%s', s)
    .replace('%x', x)
    .replace('%y', y)
    .replace('%rgb', rgbValues);

  return code;
};
