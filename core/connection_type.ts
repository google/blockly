/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

<<<<<<<< HEAD:core/connection_type.js
/**
 * @fileoverview An enum for the possible types of connections.
 */

'use strict';

/**
 * An enum for the possible types of connections.
 * @namespace Blockly.ConnectionType
 */
goog.module('Blockly.ConnectionType');


/**
 * Enum for the type of a connection or input.
 * @enum {number}
 * @alias Blockly.ConnectionType
 */
const ConnectionType = {
========
// Former goog.module ID: Blockly.ConnectionType

/**
 * Enum for the type of a connection or input.
 */
export enum ConnectionType {
>>>>>>>> 0e22a7982ee99f9efd258c68826806189729d096:core/connection_type.ts
  // A right-facing value input.  E.g. 'set item to' or 'return'.
  INPUT_VALUE = 1,
  // A left-facing value output.  E.g. 'random fraction'.
  OUTPUT_VALUE,
  // A down-facing block stack.  E.g. 'if-do' or 'else'.
  NEXT_STATEMENT,
  // An up-facing block stack.  E.g. 'break out of loop'.
<<<<<<<< HEAD:core/connection_type.js
  PREVIOUS_STATEMENT: 4,
};

exports.ConnectionType = ConnectionType;
========
  PREVIOUS_STATEMENT,
}
>>>>>>>> 0e22a7982ee99f9efd258c68826806189729d096:core/connection_type.ts
