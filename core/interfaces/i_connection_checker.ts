/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 */

/**
 * The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 * @namespace Blockly.IConnectionChecker
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IConnectionChecker');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
// import '../connection';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
// import '../rendered_connection';


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
