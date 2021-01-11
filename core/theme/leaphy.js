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
    "colourPrimary": "#06778F",
    "hat": "cap"
  },
  "situation_blocks": {
    "colourPrimary": "#D9B53F"
  },
  "numbers_blocks": {
    "colourPrimary": "#75B342"
  },
  "variables_blocks": {
    "colourPrimary": "#DE7C3B"
  },
  "functions_blocks": {
    "colourPrimary": "#4095CE"
  }
};

Blockly.Themes.Leaphy.categoryStyles = {
  "leaphy_category": {
    "colour": "#06778F"
  },
  "situation_category": {
    "colour": "#D9B53F"
  },
  "numbers_category": {
    "colour": "#75B342"
  },
  "variables_category": {
    "colour": "#DE7C3B"
  },
  "functions_category": {
    "colour": "#4095CE"
  }
};

Blockly.Themes.Leaphy.componentStyles = {
  'workspaceBackgroundColour': "#E5E5E5",
  'toolboxBackgroundColour': '#343444',
  'toolboxForegroundColour': '#fff',
  'flyoutBackgroundColour': '#FFFFFF',
  'flyoutForegroundColour': '#ccc',
  'flyoutOpacity': 1
};




Blockly.Themes.Classic =
    new Blockly.Theme('leaphy', Blockly.Themes.Leaphy.defaultBlockStyles,
        Blockly.Themes.Leaphy.categoryStyles, Blockly.Themes.Leaphy.componentStyles);
