/**
 * @fileoverview The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 */


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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 * @namespace Blockly.IConnectionChecker
 */

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../connection';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../rendered_connection';


/**
 * Class for connection type checking logic.
 * @alias Blockly.IConnectionChecker
 */
export interface IConnectionChecker {
  /**
   * Check whether the current connection can connect with the target
   * connection.
   * @param a Connection to check compatibility with.
   * @param b Connection to check compatibility with.
   * @param isDragging True if the connection is being made by dragging a block.
   * @param opt_distance The max allowable distance between the connections for
   *     drag checks.
   * @return Whether the connection is legal.
   */
  canConnect: AnyDuringMigration;

  /**
   * Checks whether the current connection can connect with the target
   * connection, and return an error code if there are problems.
   * @param a Connection to check compatibility with.
   * @param b Connection to check compatibility with.
   * @param isDragging True if the connection is being made by dragging a block.
   * @param opt_distance The max allowable distance between the connections for
   *     drag checks.
   * @return Connection.CAN_CONNECT if the connection is legal, an error code
   *     otherwise.
   */
  canConnectWithReason: AnyDuringMigration;

  /**
   * Helper method that translates a connection error code into a string.
   * @param errorCode The error code.
   * @param a One of the two connections being checked.
   * @param b The second of the two connections being checked.
   * @return A developer-readable error string.
   */
  getErrorMessage: AnyDuringMigration;

  /**
   * Check that connecting the given connections is safe, meaning that it would
   * not break any of Blockly's basic assumptions (e.g. no self connections).
   * @param a The first of the connections to check.
   * @param b The second of the connections to check.
   * @return An enum with the reason this connection is safe or unsafe.
   */
  doSafetyChecks: AnyDuringMigration;

  /**
   * Check whether this connection is compatible with another connection with
   * respect to the value type system.  E.g. square_root("Hello") is not
   * compatible.
   * @param a Connection to compare.
   * @param b Connection to compare against.
   * @return True if the connections share a type.
   */
  doTypeChecks: AnyDuringMigration;

  /**
   * Check whether this connection can be made by dragging.
   * @param a Connection to compare.
   * @param b Connection to compare against.
   * @param distance The maximum allowable distance between connections.
   * @return True if the connection is allowed during a drag.
   */
  doDragChecks: AnyDuringMigration;
}
