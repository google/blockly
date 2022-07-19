/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist render info object.
 */
'use strict';

/**
 * Minimalist render info object.
 * @class
 */
goog.module('Blockly.minimalist.RenderInfo');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {RenderInfo: BaseRenderInfo} = goog.require('Blockly.blockRendering.RenderInfo');
/* eslint-disable-next-line no-unused-vars */
const {Renderer} = goog.requireType('Blockly.minimalist.Renderer');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 * @extends {BaseRenderInfo}
 * @alias Blockly.minimalist.RenderInfo
 */
class RenderInfo extends BaseRenderInfo {
  /**
   * @param {!Renderer} renderer The renderer in use.
   * @param {!BlockSvg} block The block to measure.
   * @package
   */
  constructor(renderer, block) {
    super(renderer, block);
  }

  /**
   * Get the block renderer in use.
   * @return {!Renderer} The block renderer in use.
   * @package
   */
  getRenderer() {
    return /** @type {!Renderer} */ (this.renderer_);
  }
}

exports.RenderInfo = RenderInfo;
