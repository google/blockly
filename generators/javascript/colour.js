/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for colour blocks.
 */

// Former goog.module ID: Blockly.JavaScript.colour

import {Order} from './javascript_generator.js';


export function colour_picker(block, generator) {
  // Colour picker.
  const code = generator.quote_(block.getFieldValue('COLOUR'));
  return [code, Order.ATOMIC];
};

export function colour_random(block, generator) {
  // Generate a random colour.
  const functionName = generator.provideFunction_('colourRandom', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
  var num = Math.floor(Math.random() * Math.pow(2, 24));
  return '#' + ('00000' + num.toString(16)).substr(-6);
}
`);
  const code = functionName + '()';
  return [code, Order.FUNCTION_CALL];
};

export function colour_rgb(block, generator) {
  // Compose a colour from RGB components expressed as percentages.
  const red = generator.valueToCode(block, 'RED', Order.NONE) || 0;
  const green =
      generator.valueToCode(block, 'GREEN', Order.NONE) || 0;
  const blue =
      generator.valueToCode(block, 'BLUE', Order.NONE) || 0;
  const functionName = generator.provideFunction_('colourRgb', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}(r, g, b) {
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
  return [code, Order.FUNCTION_CALL];
};

export function colour_blend(block, generator) {
  // Blend two colours together.
  const c1 = generator.valueToCode(block, 'COLOUR1', Order.NONE) ||
      "'#000000'";
  const c2 = generator.valueToCode(block, 'COLOUR2', Order.NONE) ||
      "'#000000'";
  const ratio =
      generator.valueToCode(block, 'RATIO', Order.NONE) || 0.5;
  const functionName = generator.provideFunction_('colourBlend', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}(c1, c2, ratio) {
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
  return [code, Order.FUNCTION_CALL];
};
