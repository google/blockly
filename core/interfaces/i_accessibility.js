/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview AST Node and navigation interfaces.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IASTNode');
goog.provide('Blockly.IASTNodeWithBlock');
goog.provide('Blockly.IBlocklyActionable');

/**
 * An AST node interface.
 * @interface
 */
Blockly.IASTNode = function() {};


/**
 * An AST node that has an associated block.
 * @interface
 * @extends {Blockly.IASTNode}
 */
Blockly.IASTNodeWithBlock = function() {};

/**
 * Get the source block associated with this node.
 * @return {Blockly.Block} The source block.
 */
Blockly.IASTNodeWithBlock.prototype.getSourceBlock;


/**
 * An interface for an object that handles Blockly actions.
 * @interface
 */
Blockly.IBlocklyActionable = function() {};

/**
 * Handles the given action.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the action has been handled, false otherwise.
 */
Blockly.IBlocklyActionable.prototype.onBlocklyAction;
