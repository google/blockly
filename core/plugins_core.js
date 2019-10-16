/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Register all of the standard core plugins.
 * @author jollytoad@gmail.com (Mark Gibson)
 */
'use strict';

goog.provide('Blockly.Plugins.core');

goog.require('Blockly.Plugins');
goog.require('Blockly.BlockSvg.plugin');

Blockly.Plugins.register('block_menu_duplicate', Blockly.BlockSvg.plugin.duplicateOption);
Blockly.Plugins.register('block_menu_comment', Blockly.BlockSvg.plugin.commentOption);
Blockly.Plugins.register('block_menu_inline', Blockly.BlockSvg.plugin.inlineOption);
Blockly.Plugins.register('block_menu_collapse', Blockly.BlockSvg.plugin.collapseOption);
Blockly.Plugins.register('block_menu_disable', Blockly.BlockSvg.plugin.disableOption);
Blockly.Plugins.register('block_menu_delete', Blockly.BlockSvg.plugin.deleteOption);
Blockly.Plugins.register('block_menu_help', Blockly.BlockSvg.plugin.helpOption);
