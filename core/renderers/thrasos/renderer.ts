/** @fileoverview Thrasos renderer. */


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
 * Thrasos renderer.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from '../../block_svg';

import * as blockRendering from '../common/block_rendering';
import { Renderer as BaseRenderer } from '../common/renderer';

import { RenderInfo } from './info';


/**
 * The thrasos renderer.
 * @alias Blockly.thrasos.Renderer
 */
export class Renderer extends BaseRenderer {
  /** @param name The renderer name. */
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
