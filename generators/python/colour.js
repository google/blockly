/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for colour blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.colour');

import {pythonGenerator, Order} from '../python.js';


pythonGenerator.forBlock['colour_picker'] = function(block) {
  // Colour picker.
  const code = pythonGenerator.quote_(block.getFieldValue('COLOUR'));
  return [code, Order.ATOMIC];
};

pythonGenerator.forBlock['colour_random'] = function(block) {
  // Generate a random colour.
  pythonGenerator.definitions_['import_random'] = 'import random';
  const code = '\'#%06x\' % random.randint(0, 2**24 - 1)';
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  const functionName = pythonGenerator.provideFunction_('colour_rgb', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(r, g, b):
  r = round(min(100, max(0, r)) * 2.55)
  g = round(min(100, max(0, g)) * 2.55)
  b = round(min(100, max(0, b)) * 2.55)
  return '#%02x%02x%02x' % (r, g, b)
`);
  const r = pythonGenerator.valueToCode(block, 'RED', Order.NONE) || 0;
  const g = pythonGenerator.valueToCode(block, 'GREEN', Order.NONE) || 0;
  const b = pythonGenerator.valueToCode(block, 'BLUE', Order.NONE) || 0;
  const code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Order.FUNCTION_CALL];
};

pythonGenerator.forBlock['colour_blend'] = function(block) {
  // Blend two colours together.
  const functionName = pythonGenerator.provideFunction_('colour_blend', `
def ${pythonGenerator.FUNCTION_NAME_PLACEHOLDER_}(colour1, colour2, ratio):
  r1, r2 = int(colour1[1:3], 16), int(colour2[1:3], 16)
  g1, g2 = int(colour1[3:5], 16), int(colour2[3:5], 16)
  b1, b2 = int(colour1[5:7], 16), int(colour2[5:7], 16)
  ratio = min(1, max(0, ratio))
  r = round(r1 * (1 - ratio) + r2 * ratio)
  g = round(g1 * (1 - ratio) + g2 * ratio)
  b = round(b1 * (1 - ratio) + b2 * ratio)
  return '#%02x%02x%02x' % (r, g, b)
`);
  const colour1 =
      pythonGenerator.valueToCode(block, 'COLOUR1', Order.NONE)
      || '\'#000000\'';
  const colour2 =
      pythonGenerator.valueToCode(block, 'COLOUR2', Order.NONE)
      || '\'#000000\'';
  const ratio = pythonGenerator.valueToCode(block, 'RATIO', Order.NONE) || 0;
  const code =
      functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Order.FUNCTION_CALL];
};
