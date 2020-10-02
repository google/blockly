/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Leaphy theme.
 * Contains multi-coloured border to create shadow effect.
 */
'use strict';

goog.provide('Blockly.Themes.Leaphy');

goog.require('Blockly.Theme');

// Temporary holding object.
Blockly.Themes.Leaphy = {};

Blockly.Themes.Leaphy.defaultBlockStyles = {
  "leaphy_blocks": {
    "colourPrimary": "#1d2f6e",
    "hat": "cap"
  },
  "situation_blocks": {
    "colourPrimary": "#E0A830"
  },
  "numbers_blocks": {
    "colourPrimary": "#5FB627"
  },
  "variables_blocks": {
    "colourPrimary": "#EC7D2A"
  },
  "functions_blocks": {
    "colourPrimary": "#658FD7"
  }
};

Blockly.Themes.Leaphy.categoryStyles = {
  "leaphy_category": {
    "colour": "#444458"
  },
  "situation_category": {
    "colour": "#444458"
  },
  "numbers_category": {
    "colour": "#444458"
  },
  "variables_category": {
    "colour": "#444458"
  },
  "functions_category": {
    "colour": "#444458"
  }
};

Blockly.Themes.Leaphy.componentStyles = {
  'toolboxBackgroundColour': '#24253F',
    'toolboxForegroundColour': '#fff',
    'flyoutBackgroundColour': '#444458',
    'flyoutForegroundColour': '#ccc',
    'flyoutOpacity': 1
};

Blockly.Themes.Classic =
    new Blockly.Theme('leaphy', Blockly.Themes.Leaphy.defaultBlockStyles,
        Blockly.Themes.Leaphy.categoryStyles, Blockly.Themes.Leaphy.componentStyles);
