/** @fileoverview Contains custom errors thrown by the serialization system. */


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
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Contains custom errors thrown by the serialization system.
 * @namespace Blockly.serialization.exceptions
 */

/* eslint-disable-next-line no-unused-vars */
import {Block} from '../block.js';

// eslint-disable-next-line no-unused-vars
import {State} from './blocks.js';


/** @alias Blockly.serialization.exceptions.DeserializationError */
export class DeserializationError extends Error {}

/**
 * Represents an error where the serialized state is expected to provide a
 * block type, but it is not provided.
 * @alias Blockly.serialization.exceptions.MissingBlockType
 */
export class MissingBlockType extends DeserializationError {
  /** @param state The state object which is missing the block type. */
  constructor(public state: State) {
    super(`Expected to find a 'type' property, defining the block type`);
  }
}

/**
 * Represents an error where deserialization encountered a block that did
 * not have a connection that was defined in the serialized state.
 * @alias Blockly.serialization.exceptions.MissingConnection
 */
export class MissingConnection extends DeserializationError {
  /**
   * @param connection The name of the connection that is missing. E.g.
   *     'IF0', or 'next'.
   * @param block The block missing the connection.
   * @param state The state object containing the bad connection.
   * @internal
   * @internal
   * @internal
   * @internal
   */
  constructor(connection: string, public block: Block, public state: State) {
    super(`The block ${block.toDevString()} is missing a(n) ${connection}
connection`);
  }
}

/**
 * Represents an error where deserialization tried to connect two connections
 * that were not compatible.
 * @alias Blockly.serialization.exceptions.BadConnectionCheck
 */
export class BadConnectionCheck extends DeserializationError {
  /**
   * @param reason The reason the connections were not compatible.
   * @param childConnection The name of the incompatible child connection. E.g.
   *     'output' or 'previous'.
   * @param childBlock The child block that could not connect to its parent.
   * @param childState The state object representing the child block.
   */
  constructor(
      reason: string, childConnection: string, public childBlock: Block,
      public childState: State) {
    super(`The block ${childBlock.toDevString()} could not connect its
${childConnection} to its parent, because: ${reason}`);
  }
}

/**
 * Represents an error where deserialization encountered a real block as it
 * was deserializing children of a shadow.
 * This is an error because it is an invariant of Blockly that shadow blocks
 * do not have real children.
 * @alias Blockly.serialization.exceptions.RealChildOfShadow
 */
export class RealChildOfShadow extends DeserializationError {
  /** @param state The state object representing the real block. */
  constructor(public state: State) {
    super(`Encountered a real block which is defined as a child of a shadow
block. It is an invariant of Blockly that shadow blocks only have shadow
children`);
  }
}
