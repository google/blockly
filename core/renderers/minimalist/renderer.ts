/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.minimalist.Renderer

import type {BlockSvg} from '../../block_svg.js';
import * as blockRendering from '../common/block_rendering.js';
import type {RenderInfo as BaseRenderInfo} from '../common/info.js';
import {Renderer as BaseRenderer} from '../common/renderer.js';
import * as deprecation from '../../utils/deprecation.js';

import {ConstantProvider} from './constants.js';
import {Drawer} from './drawer.js';
import {RenderInfo} from './info.js';

/**
 * The minimalist renderer.
 *
 * @deprecated Use Blockly.blockRendering.Renderer instead. To be removed
 *     in v11.
 */
export class Renderer extends BaseRenderer {
  /**
   * @param name The renderer name.
   * @deprecated Use Blockly.blockRendering.Renderer instead. To be removed
   *     in v11.
   */
  constructor(name: string) {
    super(name);
    deprecation.warn(
      'Blockly.minimalist.Renderer',
      'v10',
      'v11',
      'Blockly.blockRendering.Renderer',
    );
  }

  /**
   * Create a new instance of the renderer's constant provider.
   *
   * @returns The constant provider.
   */
  protected override makeConstants_(): ConstantProvider {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   *
   * @param block The block to measure.
   * @returns The render info object.
   */
  protected override makeRenderInfo_(block: BlockSvg): RenderInfo {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   *
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @returns The drawer.
   */
  protected override makeDrawer_(
    block: BlockSvg,
    info: BaseRenderInfo,
  ): Drawer {
    return new Drawer(block, info as RenderInfo);
  }
}

blockRendering.register('minimalist', Renderer);
