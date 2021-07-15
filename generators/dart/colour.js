/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart.colour');

goog.require('Blockly.Dart');


Blockly.Dart.addReservedWords('Math');

Blockly.Dart['colour_picker'] = function(block) {
  // Colour picker.
  var code = Blockly.Dart.quote_(block.getFieldValue('COLOUR'));
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['colour_random'] = function(block) {
  // Generate a random colour.
  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Dart.provideFunction_(
      'colour_random',
      ['String ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ + '() {',
       '  String hex = \'0123456789abcdef\';',
       '  var rnd = new Math.Random();',
       '  return \'#${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
       '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\'',
       '      \'${hex[rnd.nextInt(16)]}${hex[rnd.nextInt(16)]}\';',
       '}']);
  var code = functionName + '()';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var red = Blockly.Dart.valueToCode(block, 'RED',
      Blockly.Dart.ORDER_NONE) || 0;
  var green = Blockly.Dart.valueToCode(block, 'GREEN',
      Blockly.Dart.ORDER_NONE) || 0;
  var blue = Blockly.Dart.valueToCode(block, 'BLUE',
      Blockly.Dart.ORDER_NONE) || 0;

  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Dart.provideFunction_(
      'colour_rgb',
      ['String ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
          '(num r, num g, num b) {',
       '  num rn = (Math.max(Math.min(r, 100), 0) * 2.55).round();',
       '  String rs = rn.toInt().toRadixString(16);',
       '  rs = \'0$rs\';',
       '  rs = rs.substring(rs.length - 2);',
       '  num gn = (Math.max(Math.min(g, 100), 0) * 2.55).round();',
       '  String gs = gn.toInt().toRadixString(16);',
       '  gs = \'0$gs\';',
       '  gs = gs.substring(gs.length - 2);',
       '  num bn = (Math.max(Math.min(b, 100), 0) * 2.55).round();',
       '  String bs = bn.toInt().toRadixString(16);',
       '  bs = \'0$bs\';',
       '  bs = bs.substring(bs.length - 2);',
       '  return \'#$rs$gs$bs\';',
       '}']);
  var code = functionName + '(' + red + ', ' + green + ', ' + blue + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['colour_blend'] = function(block) {
  // Blend two colours together.
  var c1 = Blockly.Dart.valueToCode(block, 'COLOUR1',
      Blockly.Dart.ORDER_NONE) || '\'#000000\'';
  var c2 = Blockly.Dart.valueToCode(block, 'COLOUR2',
      Blockly.Dart.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Dart.valueToCode(block, 'RATIO',
      Blockly.Dart.ORDER_NONE) || 0.5;

  Blockly.Dart.definitions_['import_dart_math'] =
      'import \'dart:math\' as Math;';
  var functionName = Blockly.Dart.provideFunction_(
      'colour_blend',
      ['String ' + Blockly.Dart.FUNCTION_NAME_PLACEHOLDER_ +
          '(String c1, String c2, num ratio) {',
       '  ratio = Math.max(Math.min(ratio, 1), 0);',
       '  int r1 = int.parse(\'0x${c1.substring(1, 3)}\');',
       '  int g1 = int.parse(\'0x${c1.substring(3, 5)}\');',
       '  int b1 = int.parse(\'0x${c1.substring(5, 7)}\');',
       '  int r2 = int.parse(\'0x${c2.substring(1, 3)}\');',
       '  int g2 = int.parse(\'0x${c2.substring(3, 5)}\');',
       '  int b2 = int.parse(\'0x${c2.substring(5, 7)}\');',
       '  num rn = (r1 * (1 - ratio) + r2 * ratio).round();',
       '  String rs = rn.toInt().toRadixString(16);',
       '  num gn = (g1 * (1 - ratio) + g2 * ratio).round();',
       '  String gs = gn.toInt().toRadixString(16);',
       '  num bn = (b1 * (1 - ratio) + b2 * ratio).round();',
       '  String bs = bn.toInt().toRadixString(16);',
       '  rs = \'0$rs\';',
       '  rs = rs.substring(rs.length - 2);',
       '  gs = \'0$gs\';',
       '  gs = gs.substring(gs.length - 2);',
       '  bs = \'0$bs\';',
       '  bs = bs.substring(bs.length - 2);',
       '  return \'#$rs$gs$bs\';',
       '}']);
  var code = functionName + '(' + c1 + ', ' + c2 + ', ' + ratio + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};
