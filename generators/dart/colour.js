/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for colour blocks.
 */
'use strict';

goog.module('Blockly.Dart.colour');

const Dart = goog.require('Blockly.Dart');


Dart.addReservedWords('Math');

Dart['colour_picker'] = function(block) {
  // Colour picker.
  const code = Dart.quote_(block.getFieldValue('COLOUR'));
  return [code, Dart.ORDER_ATOMIC];
};

Dart['colour_random'] = function(block) {
  // Generate a random colour.
  Dart.definitions_['import_dart_math'] = "import 'dart:math' as Math;";
  const functionName = Dart.provideFunction_('colour_random', `
String ${Dart.FUNCTION_NAME_PLACEHOLDER_}() {
  String hex = '0123456789abcdef';
  var rnd = new Math.Random();
  return '#\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}'
      '\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}'
      '\${hex[rnd.nextInt(16)]}\${hex[rnd.nextInt(16)]}';
}
`);
  const code = functionName + '()';
  return [code, Dart.ORDER_UNARY_POSTFIX];
};

Dart['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  const red = Dart.valueToCode(block, 'RED',
      Dart.ORDER_NONE) || 0;
  const green = Dart.valueToCode(block, 'GREEN',
      Dart.ORDER_NONE) || 0;
  const blue = Dart.valueToCode(block, 'BLUE',
      Dart.ORDER_NONE) || 0;

  Dart.definitions_['import_dart_math'] = "import 'dart:math' as Math;";
  const functionName = Dart.provideFunction_('colour_rgb', `
String ${Dart.FUNCTION_NAME_PLACEHOLDER_}(num r, num g, num b) {
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
  return [code, Dart.ORDER_UNARY_POSTFIX];
};

Dart['colour_blend'] = function(block) {
  // Blend two colours together.
  const c1 = Dart.valueToCode(block, 'COLOUR1', Dart.ORDER_NONE) || "'#000000'";
  const c2 = Dart.valueToCode(block, 'COLOUR2', Dart.ORDER_NONE) || "'#000000'";
  const ratio = Dart.valueToCode(block, 'RATIO', Dart.ORDER_NONE) || 0.5;

  Dart.definitions_['import_dart_math'] = "import 'dart:math' as Math;";
  const functionName = Dart.provideFunction_('colour_blend', `
String ${Dart.FUNCTION_NAME_PLACEHOLDER_}(String c1, String c2, num ratio) {
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
  return [code, Dart.ORDER_UNARY_POSTFIX];
};
