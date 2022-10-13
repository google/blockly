/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Leaphy theme.
 *
 * @namespace Blockly.Themes.Leaphy
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Themes.Leaphy');

import {Theme} from '../theme.js';


const defaultBlockStyles = {
  'leaphy_blocks': {'colourPrimary': '#06778f', 'hat': 'cap'},
  'situation_blocks': {'colourPrimary': '#D9B53F'},
  'numbers_blocks': {'colourPrimary': '#75B342'},
  'variable_blocks': {'colourPrimary': '#DE7C3B'},
  'procedure_blocks': {'colourPrimary': '#4095CE'},
};

const categoryStyles = {
  'leaphy_category': {'colour': '#06778f'},
  'situation_category': {'colour': '#D9B53F'},
  'numbers_category': {'colour': '#75B342'},
  'variables_category': {'colour': '#DE7C3B'},
  'functions_category': {'colour': '#4095CE'},
};

const componentStyles = {
  'workspaceBackgroundColour': '#E5E5E5',
  'toolboxBackgroundColour': '#343444',
  'toolboxForegroundColour': '#fff',
  'flyoutBackgroundColour': '#FFFFFF',
  'flyoutForegroundColour': '#ccc',
  'flyoutOpacity': 1,
};

/**
 * Leaphy theme.
 *
 * @alias Blockly.Themes.Leaphy
 */
export const Leaphy =
    new Theme('leaphy', defaultBlockStyles, categoryStyles, componentStyles);
