/**
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class representing the space a output connection takes up
 * during rendering.
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.blockRendering.OutputConnection');

import type {RenderedConnection} from '../../rendered_connection.js';
import type {ConstantProvider} from '../common/constants.js';

import {Connection} from './connection.js';
import {Types} from './types.js';


/**
 * An object containing information about the space an output connection takes
 * up during rendering.
 *
 * @alias Blockly.blockRendering.OutputConnection
 */
export class OutputConnection extends Connection {
  startX: number;
  connectionOffsetY: number;
  connectionOffsetX = 0;

  /**
   * @param constants The rendering constants provider.
   * @param connectionModel The connection object on the block that this
   *     represents.
   * @internal
   */
  constructor(
      constants: ConstantProvider, connectionModel: RenderedConnection) {
    super(constants, connectionModel);
    this.type |= Types.OUTPUT_CONNECTION;

    this.height = !this.isDynamicShape ? this.shape.height as number : 0;
    this.width = !this.isDynamicShape ? this.shape.width as number : 0;

    this.startX = this.width;

    this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
  }
}
