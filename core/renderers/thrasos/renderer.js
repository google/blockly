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

goog.module('Blockly.thrasos.Renderer');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.thrasos.RenderInfo');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.BlockSvg');


/**
 * The thrasos renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
const Renderer = function(name) {
  Renderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(Renderer,
    Blockly.blockRendering.Renderer);

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.thrasos.RenderInfo} The render info object.
 * @protected
 * @override
 */
Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.thrasos.RenderInfo(this, block);
};


Blockly.blockRendering.register('thrasos', Renderer);

exports = Renderer;
