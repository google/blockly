/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Makecode/scratch-style renderer.
 * Zelos: spirit of eager rivalry, emulation, envy, jealousy, and zeal.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos');
goog.provide('Blockly.zelos.RenderInfo');

goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.TopRow');

goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.StatementInput');

goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');

goog.require('Blockly.RenderedConnection');

/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.RenderInfo}
 */
Blockly.zelos.RenderInfo = function(block) {
  Blockly.zelos.RenderInfo.superClass_.constructor.call(this, block);
};
goog.inherits(Blockly.zelos.RenderInfo, Blockly.blockRendering.RenderInfo);
