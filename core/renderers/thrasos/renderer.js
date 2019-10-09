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
 * @fileoverview Thrasos renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.thrasos.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.thrasos.RenderInfo');
goog.require('Blockly.utils.object');

/**
 * The thrasos renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.thrasos.Renderer = function() {
  Blockly.thrasos.Renderer.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.thrasos.Renderer,
    Blockly.blockRendering.Renderer);

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.thrasos.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.thrasos.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.thrasos.RenderInfo(this, block);
};


Blockly.blockRendering.register('thrasos', Blockly.thrasos.Renderer);
