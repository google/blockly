/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Generating Lua for colour blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.colour');

goog.require('Blockly.Lua');


Blockly.Lua['colour_picker'] = function(block) {
  // Colour picker.
  var code = Blockly.Lua.quote_(block.getFieldValue('COLOUR'));
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['colour_random'] = function(block) {
  // Generate a random colour.
  var code = 'string.format("#%06x", math.random(0, 2^24 - 1))';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var functionName = Blockly.Lua.provideFunction_(
      'colour_rgb',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(r, g, b)',
       '  r = math.floor(math.min(100, math.max(0, r)) * 2.55 + .5)',
       '  g = math.floor(math.min(100, math.max(0, g)) * 2.55 + .5)',
       '  b = math.floor(math.min(100, math.max(0, b)) * 2.55 + .5)',
       '  return string.format("#%02x%02x%02x", r, g, b)',
       'end']);
  var r = Blockly.Lua.valueToCode(block, 'RED',
      Blockly.Lua.ORDER_NONE) || 0;
  var g = Blockly.Lua.valueToCode(block, 'GREEN',
      Blockly.Lua.ORDER_NONE) || 0;
  var b = Blockly.Lua.valueToCode(block, 'BLUE',
      Blockly.Lua.ORDER_NONE) || 0;
  var code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['colour_blend'] = function(block) {
  // Blend two colours together.
  var functionName = Blockly.Lua.provideFunction_(
      'colour_blend',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
           '(colour1, colour2, ratio)',
       '  local r1 = tonumber(string.sub(colour1, 2, 3), 16)',
       '  local r2 = tonumber(string.sub(colour2, 2, 3), 16)',
       '  local g1 = tonumber(string.sub(colour1, 4, 5), 16)',
       '  local g2 = tonumber(string.sub(colour2, 4, 5), 16)',
       '  local b1 = tonumber(string.sub(colour1, 6, 7), 16)',
       '  local b2 = tonumber(string.sub(colour2, 6, 7), 16)',
       '  local ratio = math.min(1, math.max(0, ratio))',
       '  local r = math.floor(r1 * (1 - ratio) + r2 * ratio + .5)',
       '  local g = math.floor(g1 * (1 - ratio) + g2 * ratio + .5)',
       '  local b = math.floor(b1 * (1 - ratio) + b2 * ratio + .5)',
       '  return string.format("#%02x%02x%02x", r, g, b)',
       'end']);
  var colour1 = Blockly.Lua.valueToCode(block, 'COLOUR1',
      Blockly.Lua.ORDER_NONE) || '\'#000000\'';
  var colour2 = Blockly.Lua.valueToCode(block, 'COLOUR2',
      Blockly.Lua.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Lua.valueToCode(block, 'RATIO',
      Blockly.Lua.ORDER_NONE) || 0;
  var code = functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};
