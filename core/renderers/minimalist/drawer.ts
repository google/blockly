/** @fileoverview Minimalist rendering drawer. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import { BlockSvg } from '../../block_svg';

import { Drawer as BaseDrawer } from '../common/drawer';

/* eslint-disable-next-line no-unused-vars */
import { RenderInfo } from './info';


/**
 * An object that draws a block based on the given rendering information.
 * @alias Blockly.minimalist.Drawer
 */
export class Drawer extends BaseDrawer {
  /**
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   */
  constructor(block: BlockSvg, info: RenderInfo) {
    super(block, info);
  }
}
