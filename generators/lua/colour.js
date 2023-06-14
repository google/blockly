/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for colour blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.colour');

import {luaGenerator, Order} from '../lua.js';


luaGenerator.forBlock['colour_picker'] = function(block) {
  // Colour picker.
  const code = luaGenerator.quote_(block.getFieldValue('COLOUR'));
  return [code, Order.ATOMIC];
};

luaGenerator.forBlock['colour_random'] = function(block) {
  // Generate a random colour.
  const code = 'string.format("#%06x", math.random(0, 2^24 - 1))';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  const functionName = luaGenerator.provideFunction_('colour_rgb', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(r, g, b)
  r = math.floor(math.min(100, math.max(0, r)) * 2.55 + .5)
  g = math.floor(math.min(100, math.max(0, g)) * 2.55 + .5)
  b = math.floor(math.min(100, math.max(0, b)) * 2.55 + .5)
  return string.format("#%02x%02x%02x", r, g, b)
end
`);
  const r = luaGenerator.valueToCode(block, 'RED', Order.NONE) || 0;
  const g = luaGenerator.valueToCode(block, 'GREEN', Order.NONE) || 0;
  const b = luaGenerator.valueToCode(block, 'BLUE', Order.NONE) || 0;
  const code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['colour_blend'] = function(block) {
  // Blend two colours together.
  const functionName = luaGenerator.provideFunction_('colour_blend', `
function ${luaGenerator.FUNCTION_NAME_PLACEHOLDER_}(colour1, colour2, ratio)
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
      luaGenerator.valueToCode(block, 'COLOUR1', Order.NONE) || "'#000000'";
  const colour2 =
      luaGenerator.valueToCode(block, 'COLOUR2', Order.NONE) || "'#000000'";
  const ratio = luaGenerator.valueToCode(block, 'RATIO', Order.NONE) || 0;
  const code =
      functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Order.HIGH];
};
