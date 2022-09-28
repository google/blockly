/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for colour blocks.
 */
'use strict';

goog.module('Blockly.Lua.colour');

const Lua = goog.require('Blockly.Lua');


Lua['colour_picker'] = function(block) {
  // Colour picker.
  const code = Lua.quote_(block.getFieldValue('COLOUR'));
  return [code, Lua.ORDER_ATOMIC];
};

Lua['colour_random'] = function(block) {
  // Generate a random colour.
  const code = 'string.format("#%06x", math.random(0, 2^24 - 1))';
  return [code, Lua.ORDER_HIGH];
};

Lua['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  const functionName = Lua.provideFunction_('colour_rgb', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(r, g, b)
  r = math.floor(math.min(100, math.max(0, r)) * 2.55 + .5)
  g = math.floor(math.min(100, math.max(0, g)) * 2.55 + .5)
  b = math.floor(math.min(100, math.max(0, b)) * 2.55 + .5)
  return string.format("#%02x%02x%02x", r, g, b)
end
`);
  const r = Lua.valueToCode(block, 'RED', Lua.ORDER_NONE) || 0;
  const g = Lua.valueToCode(block, 'GREEN', Lua.ORDER_NONE) || 0;
  const b = Lua.valueToCode(block, 'BLUE', Lua.ORDER_NONE) || 0;
  const code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['colour_blend'] = function(block) {
  // Blend two colours together.
  const functionName = Lua.provideFunction_('colour_blend', `
function ${Lua.FUNCTION_NAME_PLACEHOLDER_}(colour1, colour2, ratio)
  local r1 = tonumber(string.sub(colour1, 2, 3), 16)
  local r2 = tonumber(string.sub(colour2, 2, 3), 16)
  local g1 = tonumber(string.sub(colour1, 4, 5), 16)
  local g2 = tonumber(string.sub(colour2, 4, 5), 16)
  local b1 = tonumber(string.sub(colour1, 6, 7), 16)
  local b2 = tonumber(string.sub(colour2, 6, 7), 16)
  local ratio = math.min(1, math.max(0, ratio))
  local r = math.floor(r1 * (1 - ratio) + r2 * ratio + .5)
  local g = math.floor(g1 * (1 - ratio) + g2 * ratio + .5)
  local b = math.floor(b1 * (1 - ratio) + b2 * ratio + .5)
  return string.format("#%02x%02x%02x", r, g, b)
end
`);
  const colour1 =
      Lua.valueToCode(block, 'COLOUR1', Lua.ORDER_NONE) || "'#000000'";
  const colour2 =
      Lua.valueToCode(block, 'COLOUR2', Lua.ORDER_NONE) || "'#000000'";
  const ratio = Lua.valueToCode(block, 'RATIO', Lua.ORDER_NONE) || 0;
  const code =
      functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Lua.ORDER_HIGH];
};
