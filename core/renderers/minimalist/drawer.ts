/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.minimalist.Drawer

import type {BlockSvg} from '../../block_svg.js';
import {Drawer as BaseDrawer} from '../common/drawer.js';
import * as deprecation from '../../utils/deprecation.js';

import type {RenderInfo} from './info.js';

/**
 * An object that draws a block based on the given rendering information.
 *
 * @deprecated Use Blockly.blockRendering.Drawer instead.
 *     To be removed in v11.
 */
export class Drawer extends BaseDrawer {
  /**
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   *
   * @deprecated Use Blockly.blockRendering.Drawer instead.
   *     To be removed in v11.
   */
  constructor(block: BlockSvg, info: RenderInfo) {
    super(block, info);
    deprecation.warn(
      'Blockly.minimalist.Drawer',
      'v10',
      'v11',
      'Blockly.blockRendering.Drawer',
    );
  }
}
