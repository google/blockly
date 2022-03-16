/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Thrasos renderer.
 */
'use strict';

/**
 * Thrasos renderer.
 * @class
 */
goog.module('Blockly.thrasos.Renderer');

const blockRendering = goog.require('Blockly.blockRendering');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {RenderInfo} = goog.require('Blockly.thrasos.RenderInfo');
const {Renderer: BaseRenderer} = goog.require('Blockly.blockRendering.Renderer');


/**
 * The thrasos renderer.
 * @extends {BaseRenderer}
 * @alias Blockly.thrasos.Renderer
 */
class Renderer extends BaseRenderer {
  /**
   * @param {string} name The renderer name.
   * @package
   */
  constructor(name) {
    super(name);
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param {!BlockSvg} block The block to measure.
   * @return {!RenderInfo} The render info object.
   * @protected
   * @override
   */
  makeRenderInfo_(block) {
    return new RenderInfo(this, block);
  }
}

blockRendering.register('thrasos', Renderer);

exports.Renderer = Renderer;
