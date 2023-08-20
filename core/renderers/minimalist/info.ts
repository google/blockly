/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.minimalist.RenderInfo

import type {BlockSvg} from '../../block_svg.js';
import {RenderInfo as BaseRenderInfo} from '../common/info.js';
import * as deprecation from '../../utils/deprecation.js';

import type {Renderer} from './renderer.js';

/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @deprecated Use Blockly.blockRendering.RenderInfo instead. To be removed
 *     in v11.
 */
export class RenderInfo extends BaseRenderInfo {
  // Exclamation is fine b/c this is assigned by the super constructor.
  protected override renderer_!: Renderer;

  /**
   * @param renderer The renderer in use.
   * @param block The block to measure.
   * @deprecated Use Blockly.blockRendering.RenderInfo instead. To be removed
   *     in v11.
   */
  constructor(renderer: Renderer, block: BlockSvg) {
    super(renderer, block);
    deprecation.warn(
      'Blockly.minimalist.RenderInfo',
      'v10',
      'v11',
      'Blockly.blockRendering.RenderInfo',
    );
  }

  /**
   * Get the block renderer in use.
   *
   * @returns The block renderer in use.
   */
  override getRenderer(): Renderer {
    return this.renderer_;
  }
}
