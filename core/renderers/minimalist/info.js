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
 * @fileoverview Minimalist render info object.
 */
'use strict';

goog.provide('Blockly.minimalist');
goog.provide('Blockly.minimalist.RenderInfo');

goog.require('Blockly.utils.object');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.minimalist.Renderer} renderer The renderer in use.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.RenderInfo}
 */
Blockly.minimalist.RenderInfo = function(renderer, block) {
  Blockly.minimalist.RenderInfo.superClass_.constructor.call(this, renderer, block);

};
Blockly.utils.object.inherits(Blockly.minimalist.RenderInfo,
    Blockly.blockRendering.RenderInfo);

/**
 * Get the block renderer in use.
 * @return {!Blockly.minimalist.Renderer} The block renderer in use.
 * @package
 */
Blockly.minimalist.RenderInfo.prototype.getRenderer = function() {
  return /** @type {!Blockly.minimalist.Renderer} */ (this.renderer_);
};
