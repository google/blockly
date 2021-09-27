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

const BaseRenderInfo = goog.require('Blockly.blockRendering.RenderInfo');
/* eslint-disable-next-line no-unused-vars */
const Renderer = goog.requireType('Blockly.minimalist.Renderer');
const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Renderer} renderer The renderer in use.
 * @param {!BlockSvg} block The block to measure.
 * @constructor
 * @package
 * @extends {BaseRenderInfo}
 */
const RenderInfo = function(renderer, block) {
  RenderInfo.superClass_.constructor.call(this, renderer, block);
};
object.inherits(RenderInfo, BaseRenderInfo);

/**
 * Get the block renderer in use.
 * @return {!Renderer} The block renderer in use.
 * @package
 */
RenderInfo.prototype.getRenderer = function() {
  return /** @type {!Renderer} */ (this.renderer_);
};

exports = RenderInfo;
