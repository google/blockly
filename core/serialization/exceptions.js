
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Contains custom errors thrown by the serialization system.
 */
'use strict';

/**
 * Contains custom errors thrown by the serialization system.
 * @namespace Blockly.serialization.exceptions
 */
goog.module('Blockly.serialization.exceptions');

/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
// eslint-disable-next-line no-unused-vars
const {State} = goog.requireType('Blockly.serialization.blocks');


/**
 * @alias Blockly.serialization.exceptions.DeserializationError
 */
class DeserializationError extends Error {}
exports.DeserializationError = DeserializationError;

/**
 * Represents an error where the serialized state is expected to provide a
 * block type, but it is not provided.
 * @alias Blockly.serialization.exceptions.MissingBlockType
 */
class MissingBlockType extends DeserializationError {
  /**
   * @param {!State} state The state object which is missing the block type.
   * @package
   */
  constructor(state) {
    super(`Expected to find a 'type' property, defining the block type`);

    /**
     * The state object containing the bad name.
     * @type {!State}
     */
    this.state = state;
  }
}
exports.MissingBlockType = MissingBlockType;

/**
 * Represents an error where deserialization encountered a block that did
 * not have a connection that was defined in the serialized state.
 * @alias Blockly.serialization.exceptions.MissingConnection
 */
class MissingConnection extends DeserializationError {
  /**
   * @param {string} connection The name of the connection that is missing. E.g.
   *     'IF0', or 'next'.
   * @param {!Block} block The block missing the connection.
   * @param {!State} state The state object containing the bad connection.
   * @package
   */
  constructor(connection, block, state) {
    super(`The block ${block.toDevString()} is missing a(n) ${connection}
connection`);

    /**
     * The block missing the connection.
     * @type {!Block}
     */
    this.block = block;

    /**
     * The state object containing the bad name.
     * @type {!State}
     */
    this.state = state;
  }
}
exports.MissingConnection = MissingConnection;

/**
 * Represents an error where deserialization tried to connect two connections
 * that were not compatible.
 * @alias Blockly.serialization.exceptions.BadConnectionCheck
 */
class BadConnectionCheck extends DeserializationError {
  /**
   * @param {string} reason The reason the connections were not compatible.
   * @param {string} childConnection The name of the incompatible child
   *     connection. E.g. 'output' or 'previous'.
   * @param {!Block} childBlock The child block that could not connect
   *     to its parent.
   * @param {!State} childState The state object representing the child block.
   * @package
   */
  constructor(reason, childConnection, childBlock, childState) {
    super(`The block ${childBlock.toDevString()} could not connect its
${childConnection} to its parent, because: ${reason}`);

    /**
     * The block that could not connect to its parent.
     * @type {!Block}
     */
    this.childBlock = childBlock;

    /**
     * The state object representing the block that could not connect to its
     * parent.
     * @type {!State}
     */
    this.childState = childState;
  }
}
exports.BadConnectionCheck = BadConnectionCheck;

/**
 * Represents an error where deserialization encountered a real block as it
 * was deserializing children of a shadow.
 * This is an error because it is an invariant of Blockly that shadow blocks
 * do not have real children.
 * @alias Blockly.serialization.exceptions.RealChildOfShadow
 */
class RealChildOfShadow extends DeserializationError {
  /**
   * @param {!State} state The state object representing the real block.
   * @package
   */
  constructor(state) {
    super(`Encountered a real block which is defined as a child of a shadow
block. It is an invariant of Blockly that shadow blocks only have shadow
children`);

    /**
     * The state object representing the real block.
     * @type {!State}
     */
    this.state = state;
  }
}
exports.RealChildOfShadow = RealChildOfShadow;
