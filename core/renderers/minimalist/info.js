/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist render info object.
 */
'use strict';

goog.module('Blockly.minimalist.RenderInfo');
goog.module.declareLegacyNamespace();

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
const RenderInfo = function(renderer, block) {
  Blockly.minimalist.RenderInfo.superClass_.constructor.call(this, renderer, block);

};
Blockly.utils.object.inherits(RenderInfo,
    Blockly.blockRendering.RenderInfo);

/**
 * Get the block renderer in use.
 * @return {!Blockly.minimalist.Renderer} The block renderer in use.
 * @package
 */
RenderInfo.prototype.getRenderer = function() {
  return /** @type {!Blockly.minimalist.Renderer} */ (this.renderer_);
};

exports = RenderInfo;
