/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Leaphy theme.
 */
 'use strict';

/**
* Leaphy theme.
* @namespace Blockly.Themes.Leaphy
*/
goog.module('Blockly.Themes.Leaphy');
 
const {Theme} = goog.require('Blockly.Theme');


const defaultBlockStyles = {
  "leaphy_blocks": {
    "colourPrimary": "#06778f",
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

const categoryStyles = {
  "leaphy_category": {
    "colour": "#06778f"
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

const componentStyles = {
  'workspaceBackgroundColour': "#E5E5E5",
  'toolboxBackgroundColour': '#343444',
  'toolboxForegroundColour': '#fff',
  'flyoutBackgroundColour': '#FFFFFF',
  'flyoutForegroundColour': '#ccc',
  'flyoutOpacity': 1
};

/**
 * Leaphy theme.
 * @type {Theme}
 * @alias Blockly.Themes.Leaphy
 */
 const Leaphy = new Theme('leaphy', defaultBlockStyles, categoryStyles, componentStyles);

 exports.Leaphy = Leaphy;