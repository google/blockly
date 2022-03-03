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
goog.declareModuleId('Blockly.thrasos.Renderer');

import * as blockRendering from '../common/block_rendering.js';
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
import {RenderInfo} from './info.js';
import {Renderer as BaseRenderer} from '../common/renderer.js';


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

export {Renderer};
