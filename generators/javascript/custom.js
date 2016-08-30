/**
 * @fileoverview Generating JavaScript for custom language blocks.
 * @author jstn@cs.washington.edu (Justin Huang)
 */
'use strict';

goog.provide('Blockly.JavaScript.custom');

goog.require('Blockly.JavaScript');

Blockly.JavaScript['custom_controls_repeat_forever'] = function(block) {
  var statements_do = Blockly.JavaScript.statementToCode(block, 'DO');
  var code = 'while (true) {\n' + statements_do + '}\n';
  return code;
};
