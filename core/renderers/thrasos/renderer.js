/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.thrasos.Renderer = function(name) {
  Blockly.thrasos.Renderer.superClass_.constructor.call(this, name);
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
