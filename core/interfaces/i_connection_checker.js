/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.IConnectionChecker');

goog.requireType('Blockly.Connection');


/**
 * Class for connection type checking logic.
 * @interface
 */
Blockly.IConnectionChecker = function() {};

/**
 * Check whether the current connection can connect with the target
 * connection.
 * @param {Blockly.Connection} one Connection to check compatibility with.
 * @param {Blockly.Connection} two Connection to check compatibility with.
 * @param {boolean} isDragging True if the connection is being made by dragging
 *     a block.
 * @return {boolean} Whether the connection is legal.
 * @public
 */
Blockly.IConnectionChecker.prototype.canConnect;

/**
 * Checks whether the current connection can connect with the target
 * connection, and return an error code if there are problems.
 * @param {Blockly.Connection} one Connection to check compatibility with.
 * @param {Blockly.Connection} two Connection to check compatibility with.
 * @param {boolean} isDragging True if the connection is being made by dragging
 *     a block.
 * @return {number} Blockly.Connection.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @public
 */
Blockly.IConnectionChecker.prototype.canConnectWithReason;

/**
 * Helper method that translates a connection error code into a string.
 * @param {number} errorCode The error code.
 * @param {Blockly.Connection} one One of the two connections being checked.
 * @param {Blockly.Connection} two The second of the two connections being
 *     checked.
 * @return {string} A developer-readable error string.
 * @public
 */
Blockly.IConnectionChecker.prototype.getErrorMessage;

/**
 * Check that connecting the given connections is safe, meaning that it would
 * not break any of Blockly's basic assumptions (e.g. no self connections).
 * @param {Blockly.Connection} one The first of the connections to check.
 * @param {Blockly.Connection} two The second of the connections to check.
 * @return {number} An enum with the reason this connection is safe or unsafe.
 * @public
 */
Blockly.IConnectionChecker.prototype.doSafetyChecks;

/**
 * Check whether this connection is compatible with another connection with
 * respect to the value type system.  E.g. square_root("Hello") is not
 * compatible.
 * @param {!Blockly.Connection} one Connection to compare.
 * @param {!Blockly.Connection} two Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @public
 */
Blockly.IConnectionChecker.prototype.doTypeChecks;

/**
 * Check whether this connection can be made by dragging.
 * @param {!Blockly.Connection} one Connection to compare.
 * @param {!Blockly.Connection} two Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @public
 */
Blockly.IConnectionChecker.prototype.doDragChecks;
