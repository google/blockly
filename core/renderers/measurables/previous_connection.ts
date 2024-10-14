/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.blockRendering.PreviousConnection

import type {RenderedConnection} from '../../rendered_connection.js';
import type {ConstantProvider} from '../common/constants.js';

import {Connection} from './connection.js';
import {Types} from './types.js';

/**
 * An object containing information about the space a previous connection takes
 * up during rendering.
 */
export class PreviousConnection extends Connection {
  /**
   * @param constants The rendering constants provider.
   * @param connectionModel The connection object on the block that this
   *     represents.
   */
  constructor(
    constants: ConstantProvider,
    connectionModel: RenderedConnection,
  ) {
    super(constants, connectionModel);
    this.type |= Types.PREVIOUS_CONNECTION;
    this.height = this.shape.height as number;
    this.width = this.shape.width as number;
  }
}
