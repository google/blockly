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
 * @fileoverview Minimalist rendering drawer.
 */
'use strict';

goog.provide('Blockly.minimalist.Drawer');

goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.utils.object');
goog.require('Blockly.minimalist.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.minimalist.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.minimalist.Drawer = function(block, info) {
  Blockly.minimalist.Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Blockly.minimalist.Drawer,
    Blockly.blockRendering.Drawer);
