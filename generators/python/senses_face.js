/**
 * @fileoverview Generating Python for senses/face blocks.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.Python.sensesFace');

goog.require('Blockly.Python');

Blockly.Python.fable_read_face_sensor = function (block) {
  var metric = block.getFieldValue('METRIC');
  var code = 'api.readFaceSensor(' + metric + ')';
  var order = Blockly.Python.ORDER_ATOMIC;

  return [code, order];
};