/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for colour blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.colour');

const JavaScript = goog.require('Blockly.JavaScript');


JavaScript['colour_picker'] = function(block) {
  // Colour picker.
  const code = JavaScript.quote_(block.getFieldValue('COLOUR'));
  return [code, JavaScript.ORDER_ATOMIC];
};

JavaScript['colour_random'] = function(block) {
  // Generate a random colour.
  const functionName = JavaScript.provideFunction_('colourRandom', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}() {
  var num = Math.floor(Math.random() * Math.pow(2, 24));
  return '#' + ('00000' + num.toString(16)).substr(-6);
}
`);
  const code = functionName + '()';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  const red = JavaScript.valueToCode(block, 'RED', JavaScript.ORDER_NONE) || 0;
  const green =
      JavaScript.valueToCode(block, 'GREEN', JavaScript.ORDER_NONE) || 0;
  const blue =
      JavaScript.valueToCode(block, 'BLUE', JavaScript.ORDER_NONE) || 0;
  const functionName = JavaScript.provideFunction_('colourRgb', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(r, g, b) {
  r = Math.max(Math.min(Number(r), 100), 0) * 2.55;
  g = Math.max(Math.min(Number(g), 100), 0) * 2.55;
  b = Math.max(Math.min(Number(b), 100), 0) * 2.55;
  r = ('0' + (Math.round(r) || 0).toString(16)).slice(-2);
  g = ('0' + (Math.round(g) || 0).toString(16)).slice(-2);
  b = ('0' + (Math.round(b) || 0).toString(16)).slice(-2);
  return '#' + r + g + b;
}
`);
  const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['colour_blend'] = function(block) {
  // Blend two colours together.
  const c1 = JavaScript.valueToCode(block, 'COLOUR1', JavaScript.ORDER_NONE) ||
      "'#000000'";
  const c2 = JavaScript.valueToCode(block, 'COLOUR2', JavaScript.ORDER_NONE) ||
      "'#000000'";
  const ratio =
      JavaScript.valueToCode(block, 'RATIO', JavaScript.ORDER_NONE) || 0.5;
  const functionName = JavaScript.provideFunction_('colourBlend', `
function ${JavaScript.FUNCTION_NAME_PLACEHOLDER_}(c1, c2, ratio) {
  ratio = Math.max(Math.min(Number(ratio), 1), 0);
  var r1 = parseInt(c1.substring(1, 3), 16);
  var g1 = parseInt(c1.substring(3, 5), 16);
  var b1 = parseInt(c1.substring(5, 7), 16);
  var r2 = parseInt(c2.substring(1, 3), 16);
  var g2 = parseInt(c2.substring(3, 5), 16);
  var b2 = parseInt(c2.substring(5, 7), 16);
  var r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  var g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  var b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  r = ('0' + (r || 0).toString(16)).slice(-2);
  g = ('0' + (g || 0).toString(16)).slice(-2);
  b = ('0' + (b || 0).toString(16)).slice(-2);
  return '#' + r + g + b;
}
`);
  const code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};
