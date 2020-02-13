/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Generating Python for colour blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Python.colour');

goog.require('Blockly.Python');


Blockly.Python['colour_picker'] = function(block) {
  // Colour picker.
  var code = Blockly.Python.quote_(block.getFieldValue('COLOUR'));
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['colour_random'] = function(block) {
  // Generate a random colour.
  Blockly.Python.definitions_['import_random'] = 'import random';
  var code = '\'#%06x\' % random.randint(0, 2**24 - 1)';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var functionName = Blockly.Python.provideFunction_(
      'colour_rgb',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(r, g, b):',
       '  r = round(min(100, max(0, r)) * 2.55)',
       '  g = round(min(100, max(0, g)) * 2.55)',
       '  b = round(min(100, max(0, b)) * 2.55)',
       '  return \'#%02x%02x%02x\' % (r, g, b)']);
  var r = Blockly.Python.valueToCode(block, 'RED',
                                     Blockly.Python.ORDER_NONE) || 0;
  var g = Blockly.Python.valueToCode(block, 'GREEN',
                                     Blockly.Python.ORDER_NONE) || 0;
  var b = Blockly.Python.valueToCode(block, 'BLUE',
                                     Blockly.Python.ORDER_NONE) || 0;
  var code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['colour_blend'] = function(block) {
  // Blend two colours together.
  var functionName = Blockly.Python.provideFunction_(
      'colour_blend',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
          '(colour1, colour2, ratio):',
       '  r1, r2 = int(colour1[1:3], 16), int(colour2[1:3], 16)',
       '  g1, g2 = int(colour1[3:5], 16), int(colour2[3:5], 16)',
       '  b1, b2 = int(colour1[5:7], 16), int(colour2[5:7], 16)',
       '  ratio = min(1, max(0, ratio))',
       '  r = round(r1 * (1 - ratio) + r2 * ratio)',
       '  g = round(g1 * (1 - ratio) + g2 * ratio)',
       '  b = round(b1 * (1 - ratio) + b2 * ratio)',
       '  return \'#%02x%02x%02x\' % (r, g, b)']);
  var colour1 = Blockly.Python.valueToCode(block, 'COLOUR1',
      Blockly.Python.ORDER_NONE) || '\'#000000\'';
  var colour2 = Blockly.Python.valueToCode(block, 'COLOUR2',
      Blockly.Python.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Python.valueToCode(block, 'RATIO',
      Blockly.Python.ORDER_NONE) || 0;
  var code = functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python.colour_picker = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var hexcolor = block.getFieldValue('COLOUR');
  // /5 is a hack to get better colors, fix in firmware
  var r = parseInt(hexcolor.substring(1, 3), 16);
  var g = parseInt(hexcolor.substring(3, 5), 16);
  var b = parseInt(hexcolor.substring(5, 7), 16);

  // Map the color between 0 and 100
  r = Math.round(r * 100 / 255);
  g = Math.round(g * 100 / 255);
  b = Math.round(b * 100 / 255);

  var code = '[' + r + ', ' + g + ', ' + b + ']';

  return [code, order];
};

Blockly.Python.random_color = function (block) {
  Blockly.Python.definitions_.import_random = 'import random';

  return ['[random.randint(0, 100), random.randint(0, 100), random.randint(0, 100)]', Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python.custom_color = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  // Every color function (IN PYTHON!) is clamped manually.
  var red = Blockly.Python.valueToCode(block, 'RED', Blockly.Python.ORDER_NONE) || '0';
  var green = Blockly.Python.valueToCode(block, 'GREEN', Blockly.Python.ORDER_NONE) || '0';
  var blue = Blockly.Python.valueToCode(block, 'BLUE', Blockly.Python.ORDER_NONE) || '0';
  // var code = '[' + red + ', ' + green + ', ' + blue + ']';
  var code = 'api.customColor(' + red + ', ' + green + ', ' + blue + ')';

  return [code, order];
};

Blockly.Python.custom_color_blend = function (block) {
  var order = Blockly.Python.ORDER_ATOMIC;
  var color1 = Blockly.Python.valueToCode(block, 'FIRST', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  var color2 = Blockly.Python.valueToCode(block, 'SECOND', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  var ratio = Blockly.Python.valueToCode(block, 'RATIO', Blockly.Python.ORDER_NONE) || 0;
  var code = 'api.blendColors(' + color1 + ', ' + color2 + ', ' + ratio + ')';

  return [code, order];
};

Blockly.Python.color_distance = function (block) {
  const color1 = Blockly.Python.valueToCode(block, 'FIRST', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  const color2 = Blockly.Python.valueToCode(block, 'SECOND', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  const code = 'api.getColorDistance(' + color1 + ', ' + color2 + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python.color_channel = function (block) {
  const channel = block.getFieldValue('COLOR_CHANNEL');
  const color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_NONE) || '[0, 0, 0]';
  const code = 'api.getColorChannel(\'' + channel + '\', ' + color + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};
