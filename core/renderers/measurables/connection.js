/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class representing the space a connection takes up during
 * rendering.
 */

/**
 * Base class representing the space a connection takes up during
 * rendering.
 * @class
 */
goog.module('Blockly.blockRendering.Connection');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {Measurable} = goog.require('Blockly.blockRendering.Measurable');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * The base class to represent a connection and the space that it takes up on
 * the block.
 * @extends {Measurable}
 * @alias Blockly.blockRendering.Connection
 */
class Connection extends Measurable {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!RenderedConnection} connectionModel The connection object on
   *     the block that this represents.
   * @package
   */
  constructor(constants, connectionModel) {
    super(constants);

    /** @type {!RenderedConnection} */
    this.connectionModel = connectionModel;

    /** @type {!Object} */
    this.shape = this.constants_.shapeFor(connectionModel);

    /** @type {boolean} */
    this.isDynamicShape = !!this.shape['isDynamic'];
    this.type |= Types.CONNECTION;
  }
}

exports.Connection = Connection;
