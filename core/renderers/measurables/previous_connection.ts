/**
 * @fileoverview Class representing the space a previous connection takes up
 * during rendering.
 */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Class representing the space a previous connection takes up
 * during rendering.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import {RenderedConnection} from '../../rendered_connection.js';
/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

import {Connection} from './connection.js';
import {Types} from './types.js';


/**
 * An object containing information about the space a previous connection takes
 * up during rendering.
 * @struct
 * @alias Blockly.blockRendering.PreviousConnection
 */
export class PreviousConnection extends Connection {
  /**
   * @param constants The rendering constants provider.
   * @param connectionModel The connection object on the block that this
   *     represents.
   */
  constructor(
      constants: ConstantProvider, connectionModel: RenderedConnection) {
    super(constants, connectionModel);
    this.type |= Types.PREVIOUS_CONNECTION;
    this.height = this.shape.height as number;
    this.width = this.shape.width as number;
  }
}
