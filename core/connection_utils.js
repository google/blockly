/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utilities for manipulating and dealing with connections.
 */
'use strict';

// As this is a util namespace I think it is ok to abbreviate it to save space
// in the future
goog.provide('Blockly.connUtils');


/**
 * Returns a compatible connection iff the block has a *single* row connection
 * (value input) that is compatible with the orphanBlock. If the block has no
 * compatible connections or multiple compatible connections, this will return
 * null.
 * @param {!Blockly.Block} block The block being searched for a single
 *     compatible connection.
 * @param {!Blockly.Block} orphanBlock The block searching for a compatible
 *     connection.
 * @return {Blockly.Connection} The single compatible connection, or null.
 * @package
 */
Blockly.connUtils.getSingleCompatibleRowConnection =
    function(block, orphanBlock) {
      var compatibleConnection = null;
      var orphanOutput = orphanBlock.outputConnection;
      for (var i = 0; i < block.inputList.length; i++) {
        var connection = block.inputList[i].connection;
        if (connection && connection.type == Blockly.INPUT_VALUE &&
            orphanOutput.checkType(connection)) {
          if (compatibleConnection) {
            return null;  // More than one connection.
          }
          compatibleConnection = connection;
        }
      }
      return compatibleConnection;
    };

/**
 * Returns a compatible connection iff each block in the row has a *single*
 * connection that is compatible with the orphanBlock. If any block in the
 * row has no compatible connections or multiple compatible connections, this
 * will return null.
 * @param {!Blockly.Block} block The first block in the row of blocks being
 *     searched for a compatible connection.
 * @param {!Blockly.Block} orphanBlock The block searching for a compatible
 *     connection.
 * @returns {Blockly.Connection} The single compatible connection, or null.
 * @package
 */
Blockly.connUtils.getLastCompatibleRowConnection = function(block, orphanBlock) {
  var compatibleConnection;
  var castBlock = /** @type {!Blockly.Block} **/ (block);
  var getConnection = Blockly.connUtils.getSingleCompatibleRowConnection;

  while ((compatibleConnection = getConnection(castBlock, orphanBlock))) {
    castBlock = compatibleConnection.targetBlock();
    if (!castBlock || castBlock.isShadow()) {
      return compatibleConnection;
    }
  }
  return null;
};

/**
 * Returns the last next connection in this stack of blocks. If the stack ends
 * in a block with no next connection, this returns null.
 * @param {!Blockly.Block} block The block from which we start walking down
 *     the tree of blocks.
 * @returns {Blockly.Connection} The last next connection in the stack, or null.
 * @package
 */
Blockly.connUtils.getLastStackConnection = function(block) {
  var connection;
  var castBlock = /** @type {!Blockly.Block} **/ (block);
  while ((connection = castBlock.nextConnection)) {
    castBlock = connection.targetBlock();
    if (!castBlock || castBlock.isShadow()) {
      return connection;
    }
  }
  return null;
};
