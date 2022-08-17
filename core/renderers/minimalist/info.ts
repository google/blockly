/**
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Minimalist render info object.
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.minimalist.RenderInfo');

import type {BlockSvg} from '../../block_svg.js';
import {RenderInfo as BaseRenderInfo} from '../common/info.js';

import type {Renderer} from './renderer.js';


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 * @alias Blockly.minimalist.RenderInfo
 */
export class RenderInfo extends BaseRenderInfo {
  /**
   * @param renderer The renderer in use.
   * @param block The block to measure.
   * @internal
   */
  constructor(renderer: Renderer, block: BlockSvg) {
    super(renderer, block);
  }

  /**
   * Get the block renderer in use.
   * @return The block renderer in use.
   * @internal
   */
  override getRenderer(): Renderer {
    // AnyDuringMigration because:  Property 'renderer_' does not exist on type
    // 'RenderInfo'.
    return (this as AnyDuringMigration).renderer_ as Renderer;
  }
}
