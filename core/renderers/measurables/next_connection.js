/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing the space a next connection takes up during
 * rendering.
 */

/**
 * Class representing the space a next connection takes up during
 * rendering.
 * @class
 */
goog.declareModuleId('Blockly.blockRendering.NextConnection');

import {Connection} from './connection.js';
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
import {Types} from './types.js';


/**
 * An object containing information about the space a next connection takes
 * up during rendering.
 * @extends {Connection}
 * @struct
 * @alias Blockly.blockRendering.NextConnection
 */
class NextConnection extends Connection {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!RenderedConnection} connectionModel The connection object on
   *     the block that this represents.
   * @package
   */
  constructor(constants, connectionModel) {
    super(constants, connectionModel);
    this.type |= Types.NEXT_CONNECTION;
    this.height = this.shape.height;
    this.width = this.shape.width;
  }
}

export {NextConnection};
