/**
 * @fileoverview Classic theme.
 * Contains multi-coloured border to create shadow effect.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Classic theme.
 * Contains multi-coloured border to create shadow effect.
 * @namespace Blockly.Themes.Classic
 */

import { Theme } from '../theme';


const defaultBlockStyles = {
  'colour_blocks': { 'colourPrimary': '20' },
  'list_blocks': { 'colourPrimary': '260' },
  'logic_blocks': { 'colourPrimary': '210' },
  'loop_blocks': { 'colourPrimary': '120' },
  'math_blocks': { 'colourPrimary': '230' },
  'procedure_blocks': { 'colourPrimary': '290' },
  'text_blocks': { 'colourPrimary': '160' },
  'variable_blocks': { 'colourPrimary': '330' },
  'variable_dynamic_blocks': { 'colourPrimary': '310' },
  'hat_blocks': { 'colourPrimary': '330', 'hat': 'cap' },
};

const categoryStyles = {
  'colour_category': { 'colour': '20' },
  'list_category': { 'colour': '260' },
  'logic_category': { 'colour': '210' },
  'loop_category': { 'colour': '120' },
  'math_category': { 'colour': '230' },
  'procedure_category': { 'colour': '290' },
  'text_category': { 'colour': '160' },
  'variable_category': { 'colour': '330' },
  'variable_dynamic_category': { 'colour': '310' },
};

/**
 * Classic theme.
 * Contains multi-coloured border to create shadow effect.
 * @alias Blockly.Themes.Classic
 */
export const Classic = new Theme('classic', defaultBlockStyles, categoryStyles);
