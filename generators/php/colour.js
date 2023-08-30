/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for colour blocks.
 */

// Former goog.module ID: Blockly.PHP.colour

import {Order} from './php_generator.js';


export function colour_picker(block, generator) {
  // Colour picker.
  const code = generator.quote_(block.getFieldValue('COLOUR'));
  return [code, Order.ATOMIC];
};

export function colour_random(block, generator) {
  // Generate a random colour.
  const functionName = generator.provideFunction_('colour_random', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
  return '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
}
`);
  const code = functionName + '()';
  return [code, Order.FUNCTION_CALL];
};

export function colour_rgb(block, generator) {
  // Compose a colour from RGB components expressed as percentages.
  const red = generator.valueToCode(block, 'RED', Order.NONE) || 0;
  const green = generator.valueToCode(block, 'GREEN', Order.NONE) || 0;
  const blue = generator.valueToCode(block, 'BLUE', Order.NONE) || 0;
  const functionName = generator.provideFunction_('colour_rgb', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}($r, $g, $b) {
  $r = round(max(min($r, 100), 0) * 2.55);
  $g = round(max(min($g, 100), 0) * 2.55);
  $b = round(max(min($b, 100), 0) * 2.55);
  $hex = '#';
  $hex .= str_pad(dechex($r), 2, '0', STR_PAD_LEFT);
  $hex .= str_pad(dechex($g), 2, '0', STR_PAD_LEFT);
  $hex .= str_pad(dechex($b), 2, '0', STR_PAD_LEFT);
  return $hex;
}
`);
  const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Order.FUNCTION_CALL];
};

export function colour_blend(block, generator) {
  // Blend two colours together.
  const c1 =
      generator.valueToCode(block, 'COLOUR1', Order.NONE) || "'#000000'";
  const c2 =
      generator.valueToCode(block, 'COLOUR2', Order.NONE) || "'#000000'";
  const ratio = generator.valueToCode(block, 'RATIO', Order.NONE) || 0.5;
  const functionName = generator.provideFunction_('colour_blend', `
function ${generator.FUNCTION_NAME_PLACEHOLDER_}($c1, $c2, $ratio) {
  $ratio = max(min($ratio, 1), 0);
  $r1 = hexdec(substr($c1, 1, 2));
  $g1 = hexdec(substr($c1, 3, 2));
  $b1 = hexdec(substr($c1, 5, 2));
  $r2 = hexdec(substr($c2, 1, 2));
  $g2 = hexdec(substr($c2, 3, 2));
  $b2 = hexdec(substr($c2, 5, 2));
  $r = round($r1 * (1 - $ratio) + $r2 * $ratio);
  $g = round($g1 * (1 - $ratio) + $g2 * $ratio);
  $b = round($b1 * (1 - $ratio) + $b2 * $ratio);
  $hex = '#';
  $hex .= str_pad(dechex($r), 2, '0', STR_PAD_LEFT);
  $hex .= str_pad(dechex($g), 2, '0', STR_PAD_LEFT);
  $hex .= str_pad(dechex($b), 2, '0', STR_PAD_LEFT);
  return $hex;
}
`);
  const code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Order.FUNCTION_CALL];
};
