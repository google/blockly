/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist renderer.
 */
'use strict';

/**
 * Minimalist renderer.
 * @class
 */
goog.declareModuleId('Blockly.minimalist.Renderer');

import * as blockRendering from '../common/block_rendering.js';
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
import {ConstantProvider} from './constants.js';
import {Drawer} from './drawer.js';
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo: BaseRenderInfo} = goog.requireType('Blockly.blockRendering.RenderInfo');
import {RenderInfo} from './info.js';
import {Renderer as BaseRenderer} from '../common/renderer.js';


/**
 * The minimalist renderer.
 * @extends {BaseRenderer}
 * @alias Blockly.minimalist.Renderer
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
   * Create a new instance of the renderer's constant provider.
   * @return {!ConstantProvider} The constant provider.
   * @protected
   * @override
   */
  makeConstants_() {
    return new ConstantProvider();
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

  /**
   * Create a new instance of the renderer's drawer.
   * @param {!BlockSvg} block The block to render.
   * @param {!BaseRenderInfo} info An object containing all
   *   information needed to render this block.
   * @return {!Drawer} The drawer.
   * @protected
   * @override
   */
  makeDrawer_(block, info) {
    return new Drawer(block, /** @type {!RenderInfo} */ (info));
  }
}

blockRendering.register('minimalist', Renderer);

export {Renderer};
