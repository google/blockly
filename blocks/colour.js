/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Colour blocks for Blockly.
 */
'use strict';

goog.module('Blockly.libraryBlocks.colour');

/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldColour');

/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  // Block for colour picker.
  {
    'type': 'colour_picker',
    'message0': '%1',
    'args0': [
      {
        'type': 'field_colour',
        'name': 'COLOUR',
        'colour': '#ff0000',
      },
    ],
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_PICKER_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_PICKER_TOOLTIP}',
    'extensions': ['parent_tooltip_when_inline'],
  },

  // Block for random colour.
  {
    'type': 'colour_random',
    'message0': '%{BKY_COLOUR_RANDOM_TITLE}',
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_RANDOM_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_RANDOM_TOOLTIP}',
  },

  // Block for composing a colour from RGB components.
  {
    'type': 'colour_rgb',
    'message0':
        '%{BKY_COLOUR_RGB_TITLE} %{BKY_COLOUR_RGB_RED} %1 %{BKY_COLOUR_RGB_GREEN} %2 %{BKY_COLOUR_RGB_BLUE} %3',
    'args0': [
      {
        'type': 'input_value',
        'name': 'RED',
        'check': 'Number',
        'align': 'RIGHT',
      },
      {
        'type': 'input_value',
        'name': 'GREEN',
        'check': 'Number',
        'align': 'RIGHT',
      },
      {
        'type': 'input_value',
        'name': 'BLUE',
        'check': 'Number',
        'align': 'RIGHT',
      },
    ],
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_RGB_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_RGB_TOOLTIP}',
  },

  // Block for blending two colours together.
  {
    'type': 'colour_blend',
    'message0': '%{BKY_COLOUR_BLEND_TITLE} %{BKY_COLOUR_BLEND_COLOUR1} ' +
        '%1 %{BKY_COLOUR_BLEND_COLOUR2} %2 %{BKY_COLOUR_BLEND_RATIO} %3',
    'args0': [
      {
        'type': 'input_value',
        'name': 'COLOUR1',
        'check': 'Colour',
        'align': 'RIGHT',
      },
      {
        'type': 'input_value',
        'name': 'COLOUR2',
        'check': 'Colour',
        'align': 'RIGHT',
      },
      {
        'type': 'input_value',
        'name': 'RATIO',
        'check': 'Number',
        'align': 'RIGHT',
      },
    ],
    'output': 'Colour',
    'helpUrl': '%{BKY_COLOUR_BLEND_HELPURL}',
    'style': 'colour_blocks',
    'tooltip': '%{BKY_COLOUR_BLEND_TOOLTIP}',
  },
]);
exports.blocks = blocks;

// Register provided blocks.
defineBlocks(blocks);
