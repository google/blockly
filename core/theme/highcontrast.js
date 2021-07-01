/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview High contrast theme.
 * Darker colours to contrast the white font.
 */
'use strict';

goog.provide('Blockly.Themes.HighContrast');

goog.require('Blockly.Theme');


// Temporary holding object.
Blockly.Themes.HighContrast = {};

Blockly.Themes.HighContrast.defaultBlockStyles = {
  "colour_blocks": {
    "colourPrimary": "#a52714",
    "colourSecondary": "#FB9B8C",
    "colourTertiary": "#FBE1DD"
  },
  "list_blocks": {
    "colourPrimary": "#4a148c",
    "colourSecondary": "#AD7BE9",
    "colourTertiary": "#CDB6E9"
  },
  "logic_blocks": {
    "colourPrimary": "#01579b",
    "colourSecondary": "#64C7FF",
    "colourTertiary": "#C5EAFF"
  },
  "loop_blocks": {
    "colourPrimary": "#33691e",
    "colourSecondary": "#9AFF78",
    "colourTertiary": "#E1FFD7"
  },
  "math_blocks": {
    "colourPrimary": "#1a237e",
    "colourSecondary": "#8A9EFF",
    "colourTertiary": "#DCE2FF"
  },
  "procedure_blocks": {
    "colourPrimary": "#006064",
    "colourSecondary": "#77E6EE",
    "colourTertiary": "#CFECEE"
  },
  "text_blocks": {
    "colourPrimary": "#004d40",
    "colourSecondary": "#5ae27c",
    "colourTertiary": "#D2FFDD"
  },
  "variable_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary": "#FF73BE",
    "colourTertiary": "#FFD4EB"
  },
  "variable_dynamic_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary": "#FF73BE",
    "colourTertiary": "#FFD4EB"
  },
  "hat_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary": "#FF73BE",
    "colourTertiary": "#FFD4EB",
    "hat": "cap"
  }
};

Blockly.Themes.HighContrast.categoryStyles = {
  "colour_category": {
    "colour": "#a52714"
  },
  "list_category": {
    "colour": "#4a148c"
  },
  "logic_category": {
    "colour": "#01579b"
  },
  "loop_category": {
    "colour": "#33691e"
  },
  "math_category": {
    "colour": "#1a237e"
  },
  "procedure_category": {
    "colour": "#006064"
  },
  "text_category": {
    "colour": "#004d40"
  },
  "variable_category": {
    "colour": "#880e4f"
  },
  "variable_dynamic_category": {
    "colour": "#880e4f"
  }
};

// This style is still being fleshed out and may change.
Blockly.Themes.HighContrast =
    new Blockly.Theme('highcontrast',
        Blockly.Themes.HighContrast.defaultBlockStyles,
        Blockly.Themes.HighContrast.categoryStyles);

Blockly.Themes.HighContrast.setComponentStyle('selectedGlowColour', '#000000');
Blockly.Themes.HighContrast.setComponentStyle('selectedGlowSize', 1);
Blockly.Themes.HighContrast.setComponentStyle('replacementGlowColour', '#000000');

Blockly.Themes.HighContrast.setFontStyle({
  'family': null,  // Use default font-family.
  'weight': null,  // Use default font-weight.
  'size': 16
});
