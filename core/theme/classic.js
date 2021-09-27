/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Classic theme.
 * Contains multi-coloured border to create shadow effect.
 */
'use strict';

goog.module('Blockly.Themes.Classic');

const Theme = goog.require('Blockly.Theme');


// Temporary holding object.
let Classic = {};

Classic.defaultBlockStyles = {
  'colour_blocks': {'colourPrimary': '20'},
  'list_blocks': {'colourPrimary': '260'},
  'logic_blocks': {'colourPrimary': '210'},
  'loop_blocks': {'colourPrimary': '120'},
  'math_blocks': {'colourPrimary': '230'},
  'procedure_blocks': {'colourPrimary': '290'},
  'text_blocks': {'colourPrimary': '160'},
  'variable_blocks': {'colourPrimary': '330'},
  'variable_dynamic_blocks': {'colourPrimary': '310'},
  'hat_blocks': {'colourPrimary': '330', 'hat': 'cap'}
};

Classic.categoryStyles = {
  'colour_category': {'colour': '20'},
  'list_category': {'colour': '260'},
  'logic_category': {'colour': '210'},
  'loop_category': {'colour': '120'},
  'math_category': {'colour': '230'},
  'procedure_category': {'colour': '290'},
  'text_category': {'colour': '160'},
  'variable_category': {'colour': '330'},
  'variable_dynamic_category': {'colour': '310'}
};

Classic =
    new Theme('classic', Classic.defaultBlockStyles, Classic.categoryStyles);

exports = Classic;
