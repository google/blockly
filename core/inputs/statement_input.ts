/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {Block} from '../block.js';
import type {Connection} from '../connection.js';
import {Input} from './input.js';
import {inputTypes} from './input_types.js';

/** Represents an input on a block with a statement connection. */
export class StatementInput extends Input {
  readonly type = inputTypes.STATEMENT;

  /**
   * @param name Language-neutral identifier which may used to find this input
   *     again.
   * @param block The block containing this input.
   * @param connection The statement connection for this input.
   */
  constructor(
    public name: string,
    block: Block,
    public connection: Connection
  ) {
    // Errors are maintained for people not using typescript.
    if (!name) throw new Error('Statement inputs must have a non-empty name');
    if (!connection) throw new Error('Value inputs must have a connection');
    super(name, block, connection);
  }
}
