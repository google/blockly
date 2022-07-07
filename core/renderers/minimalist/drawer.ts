/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist rendering drawer.
 */

/**
 * Minimalist rendering drawer.
 * @class
 */
import * as goog from '../../../closure/goog/goog';
goog.declareModuleId('Blockly.minimalist.Drawer');

/* eslint-disable-next-line no-unused-vars */
import {BlockSvg} from '../../block_svg';
import {Drawer as BaseDrawer} from '../common/drawer';

/* eslint-disable-next-line no-unused-vars */
import {RenderInfo} from './info';


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
