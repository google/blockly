/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 */
'use strict';

/**
 * The interface for an object that encapsulates logic for
 * checking whether a potential connection is safe and valid.
 * @namespace Blockly.IConnectionChecker
 */
goog.module('Blockly.IConnectionChecker');

/* eslint-disable-next-line no-unused-vars */
const {Connection} = goog.requireType('Blockly.Connection');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');


/**
 * Class for connection type checking logic.
 * @interface
 * @alias Blockly.IConnectionChecker
 */
const IConnectionChecker = function() {};

/**
 * Check whether the current connection can connect with the target
 * connection.
 * @param {Connection} a Connection to check compatibility with.
 * @param {Connection} b Connection to check compatibility with.
 * @param {boolean} isDragging True if the connection is being made by dragging
 *     a block.
 * @param {number=} opt_distance The max allowable distance between the
 *     connections for drag checks.
 * @return {boolean} Whether the connection is legal.
 * @public
 */
IConnectionChecker.prototype.canConnect;

/**
 * Checks whether the current connection can connect with the target
 * connection, and return an error code if there are problems.
 * @param {Connection} a Connection to check compatibility with.
 * @param {Connection} b Connection to check compatibility with.
 * @param {boolean} isDragging True if the connection is being made by dragging
 *     a block.
 * @param {number=} opt_distance The max allowable distance between the
 *     connections for drag checks.
 * @return {number} Connection.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @public
 */
IConnectionChecker.prototype.canConnectWithReason;

/**
 * Helper method that translates a connection error code into a string.
 * @param {number} errorCode The error code.
 * @param {Connection} a One of the two connections being checked.
 * @param {Connection} b The second of the two connections being
 *     checked.
 * @return {string} A developer-readable error string.
 * @public
 */
IConnectionChecker.prototype.getErrorMessage;

/**
 * Check that connecting the given connections is safe, meaning that it would
 * not break any of Blockly's basic assumptions (e.g. no self connections).
 * @param {Connection} a The first of the connections to check.
 * @param {Connection} b The second of the connections to check.
 * @return {number} An enum with the reason this connection is safe or unsafe.
 * @public
 */
IConnectionChecker.prototype.doSafetyChecks;

/**
 * Check whether this connection is compatible with another connection with
 * respect to the value type system.  E.g. square_root("Hello") is not
 * compatible.
 * @param {!Connection} a Connection to compare.
 * @param {!Connection} b Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @public
 */
IConnectionChecker.prototype.doTypeChecks;

/**
 * Check whether this connection can be made by dragging.
 * @param {!RenderedConnection} a Connection to compare.
 * @param {!RenderedConnection} b Connection to compare against.
 * @param {number} distance The maximum allowable distance between connections.
 * @return {boolean} True if the connection is allowed during a drag.
 * @public
 */
IConnectionChecker.prototype.doDragChecks;

exports.IConnectionChecker = IConnectionChecker;
