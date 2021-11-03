/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for colour blocks.
 */
'use strict';

goog.provide('Blockly.PHP.colour');

goog.require('Blockly.PHP');


Blockly.PHP['colour_picker'] = function(block) {
  // Colour picker.
  const code = Blockly.PHP.quote_(block.getFieldValue('COLOUR'));
  return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['colour_random'] = function(block) {
  // Generate a random colour.
  const functionName = Blockly.PHP.provideFunction_(
      'colour_random',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '() {',
       '  return \'#\' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), ' +
          '6, \'0\', STR_PAD_LEFT);',
       '}']);
  const code = functionName + '()';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  const red = Blockly.PHP.valueToCode(block, 'RED',
      Blockly.PHP.ORDER_NONE) || 0;
  const green = Blockly.PHP.valueToCode(block, 'GREEN',
      Blockly.PHP.ORDER_NONE) || 0;
  const blue = Blockly.PHP.valueToCode(block, 'BLUE',
      Blockly.PHP.ORDER_NONE) || 0;
  const functionName = Blockly.PHP.provideFunction_(
      'colour_rgb',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($r, $g, $b) {',
       '  $r = round(max(min($r, 100), 0) * 2.55);',
       '  $g = round(max(min($g, 100), 0) * 2.55);',
       '  $b = round(max(min($b, 100), 0) * 2.55);',
       '  $hex = \'#\';',
       '  $hex .= str_pad(dechex($r), 2, \'0\', STR_PAD_LEFT);',
       '  $hex .= str_pad(dechex($g), 2, \'0\', STR_PAD_LEFT);',
       '  $hex .= str_pad(dechex($b), 2, \'0\', STR_PAD_LEFT);',
       '  return $hex;',
       '}']);
  const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['colour_blend'] = function(block) {
  // Blend two colours together.
  const c1 = Blockly.PHP.valueToCode(block, 'COLOUR1',
      Blockly.PHP.ORDER_NONE) || '\'#000000\'';
  const c2 = Blockly.PHP.valueToCode(block, 'COLOUR2',
      Blockly.PHP.ORDER_NONE) || '\'#000000\'';
  const ratio = Blockly.PHP.valueToCode(block, 'RATIO',
      Blockly.PHP.ORDER_NONE) || 0.5;
  const functionName = Blockly.PHP.provideFunction_(
      'colour_blend',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
          '($c1, $c2, $ratio) {',
       '  $ratio = max(min($ratio, 1), 0);',
       '  $r1 = hexdec(substr($c1, 1, 2));',
       '  $g1 = hexdec(substr($c1, 3, 2));',
       '  $b1 = hexdec(substr($c1, 5, 2));',
       '  $r2 = hexdec(substr($c2, 1, 2));',
       '  $g2 = hexdec(substr($c2, 3, 2));',
       '  $b2 = hexdec(substr($c2, 5, 2));',
       '  $r = round($r1 * (1 - $ratio) + $r2 * $ratio);',
       '  $g = round($g1 * (1 - $ratio) + $g2 * $ratio);',
       '  $b = round($b1 * (1 - $ratio) + $b2 * $ratio);',
       '  $hex = \'#\';',
       '  $hex .= str_pad(dechex($r), 2, \'0\', STR_PAD_LEFT);',
       '  $hex .= str_pad(dechex($g), 2, \'0\', STR_PAD_LEFT);',
       '  $hex .= str_pad(dechex($b), 2, \'0\', STR_PAD_LEFT);',
       '  return $hex;',
       '}']);
  const code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};
