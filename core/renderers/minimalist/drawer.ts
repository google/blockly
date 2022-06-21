/** @fileoverview Minimalist rendering drawer. */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Minimalist rendering drawer.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from '../../block_svg.js';
import {Drawer as BaseDrawer} from '../common/drawer.js';

/* eslint-disable-next-line no-unused-vars */
import {RenderInfo} from './info.js';


/**
 * An object that draws a block based on the given rendering information.
 * @alias Blockly.minimalist.Drawer
 */
export class Drawer extends BaseDrawer {
  /**
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @internal
   */
  constructor(block: BlockSvg, info: RenderInfo) {
    super(block, info);
  }
}
