/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for colour blocks.
 */

// Former goog.module ID: Blockly.Dart.colour

import {Order} from './dart_generator.js';


// RESERVED WORDS: 'Math'

export function colour_picker(block, generator) {
  // Colour picker.
  const code = generator.quote_(block.getFieldValue('COLOUR'));
  return [code, Order.ATOMIC];
};

export function colour_random(block, generator) {
  // Generate a random colour.
  generator.definitions_['import_dart_math'] =
      "import 'dart:math' as Math;";
  const functionName = generator.provideFunction_('colour_random', `
String ${generator.FUNCTION_NAME_PLACEHOLDER_}() {
  String hex = '0123456789abcdef';
  var rnd = new Math.Random();
  return '#\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}'
      '\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}'
      '\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}';
}
`);
  const code = functionName + '()';
  return [code, Order.UNARY_POSTFIX];
};

export function colour_rgb(block, generator) {
  // Compose a colour from RGB components expressed as percentages.
  const red = generator.valueToCode(block, 'RED', Order.NONE) || 0;
  const green = generator.valueToCode(block, 'GREEN', Order.NONE) || 0;
  const blue = generator.valueToCode(block, 'BLUE', Order.NONE) || 0;

  generator.definitions_['import_dart_math'] =
      "import 'dart:math' as Math;";
  const functionName = generator.provideFunction_('colour_rgb', `
String ${generator.FUNCTION_NAME_PLACEHOLDER_}(num r, num g, num b) {
  num rn = (Math.max(Math.min(r, 100), 0) * 2.55).round();
  String rs = rn.toInt().toRadixString(16);
  rs = '0$rs';
  rs = rs.substring(rs.length - 2);
  num gn = (Math.max(Math.min(g, 100), 0) * 2.55).round();
  String gs = gn.toInt().toRadixString(16);
  gs = '0$gs';
  gs = gs.substring(gs.length - 2);
  num bn = (Math.max(Math.min(b, 100), 0) * 2.55).round();
  String bs = bn.toInt().toRadixString(16);
  bs = '0$bs';
  bs = bs.substring(bs.length - 2);
  return '#$rs$gs$bs';
}
`);
  const code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Order.UNARY_POSTFIX];
};

export function colour_blend(block, generator) {
  // Blend two colours together.
  const c1 =
      generator.valueToCode(block, 'COLOUR1', Order.NONE) || "'#000000'";
  const c2 =
      generator.valueToCode(block, 'COLOUR2', Order.NONE) || "'#000000'";
  const ratio =
      generator.valueToCode(block, 'RATIO', Order.NONE) || 0.5;

  generator.definitions_['import_dart_math'] =
      "import 'dart:math' as Math;";
  const functionName = generator.provideFunction_('colour_blend', `
String ${generator.FUNCTION_NAME_PLACEHOLDER_}(String c1, String c2, num ratio) {
  ratio = Math.max(Math.min(ratio, 1), 0);
  int r1 = int.parse('0x\${c1.substring(1, 3)}');
  int g1 = int.parse('0x\${c1.substring(3, 5)}');
  int b1 = int.parse('0x\${c1.substring(5, 7)}');
  int r2 = int.parse('0x\${c2.substring(1, 3)}');
  int g2 = int.parse('0x\${c2.substring(3, 5)}');
  int b2 = int.parse('0x\${c2.substring(5, 7)}');
  num rn = (r1 * (1 - ratio) + r2 * ratio).round();
  String rs = rn.toInt().toRadixString(16);
  num gn = (g1 * (1 - ratio) + g2 * ratio).round();
  String gs = gn.toInt().toRadixString(16);
  num bn = (b1 * (1 - ratio) + b2 * ratio).round();
  String bs = bn.toInt().toRadixString(16);
  rs = '0$rs';
  rs = rs.substring(rs.length - 2);
  gs = '0$gs';
  gs = gs.substring(gs.length - 2);
  bs = '0$bs';
  bs = bs.substring(bs.length - 2);
  return '#$rs$gs$bs';
}
`);
  const code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Order.UNARY_POSTFIX];
};
