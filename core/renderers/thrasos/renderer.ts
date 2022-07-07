/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Thrasos renderer.
 */

/**
 * Thrasos renderer.
 * @class
 */


/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from '../../block_svg';
import * as blockRendering from '../common/block_rendering';
import {Renderer as BaseRenderer} from '../common/renderer';

import {RenderInfo} from './info';


/**
 * The thrasos renderer.
 * @alias Blockly.thrasos.Renderer
 */
export class Renderer extends BaseRenderer {
  /**
   * @param name The renderer name.
   * @internal
   */
  constructor(name: string) {
    super(name);
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param block The block to measure.
   * @return The render info object.
   */
  protected override makeRenderInfo_(block: BlockSvg): RenderInfo {
    return new RenderInfo(this, block);
  }
}

blockRendering.register('thrasos', Renderer);
