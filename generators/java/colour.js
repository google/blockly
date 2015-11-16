/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Java for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Java.colour');

goog.require('Blockly.Java');


Blockly.Java['colour_picker'] = function(block) {
  // Colour picker.
  var code = '"' + block.getFieldValue('COLOUR') + '"';
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['colour_random'] = function(block) {
  // Generate a random colour.
  Blockly.Java.addImport('java.util.Random');
  var functionName = Blockly.Java.provideFunction_(
      'colour_random',
      [ 'public static String ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
           '() {',
        '  double num = Math.floor(Math.random() * Math.pow(2, 24));',
        '  return String.format("#%06x", (int)num);',
        '}']);
  var code = functionName + '()';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var functionName = Blockly.Java.provideFunction_(
      'colour_rgb',
      [ 'public static String ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(double r, double g, double b) {',
        '  r = Math.round(Math.max(Math.min(r, 100), 0) * 2.55);',
        '  g = Math.round(Math.max(Math.min(g, 100), 0) * 2.55);',
        '  b = Math.round(Math.max(Math.min(b, 100), 0) * 2.55);',
        '  return String.format("#%02x%02x%02x", (int)r, (int)g, (int)b);',
        '}']);
  var r = Blockly.Java.valueToCode(block, 'RED',
                                     Blockly.Java.ORDER_NONE) || 0;
  var g = Blockly.Java.valueToCode(block, 'GREEN',
                                     Blockly.Java.ORDER_NONE) || 0;
  var b = Blockly.Java.valueToCode(block, 'BLUE',
                                     Blockly.Java.ORDER_NONE) || 0;
  var code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['colour_blend'] = function(block) {
  // Blend two colours together.
  var functionName = Blockly.Java.provideFunction_(
      'colour_blend',
      ['public static String ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(String c1, String c2, double ratio) {',
        '  int r = 0;',
        '  int g = 0;',
        '  int b = 0;',
        '  try {',
        '    ratio = Math.max(Math.min(ratio, 1), 0);',
        '    int r1 = Integer.parseInt(c1.substring(1, 3), 16);',
        '    int g1 = Integer.parseInt(c1.substring(3, 5), 16);',
        '    int b1 = Integer.parseInt(c1.substring(5, 7), 16);',
        '    int r2 = Integer.parseInt(c2.substring(1, 3), 16);',
        '    int g2 = Integer.parseInt(c2.substring(3, 5), 16);',
        '    int b2 = Integer.parseInt(c2.substring(5, 7), 16);',
        '    r = (int)Math.round(r1 * (1 - ratio) + r2 * ratio);',
        '    g = (int)Math.round(g1 * (1 - ratio) + g2 * ratio);',
        '    b = (int)Math.round(b1 * (1 - ratio) + b2 * ratio);',
        '  } catch (Exception ex) {',
        '  }',
        '  return String.format("#%02x%02x%02x", r, g, b);',
        '}']);
  var colour1 = Blockly.Java.valueToCode(block, 'COLOUR1',
      Blockly.Java.ORDER_NONE) || '"#000000"';
  var colour2 = Blockly.Java.valueToCode(block, 'COLOUR2',
      Blockly.Java.ORDER_NONE) || '"#000000"';
  var ratio = Blockly.Java.valueToCode(block, 'RATIO',
      Blockly.Java.ORDER_NONE) || 0;
  var code = functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};
