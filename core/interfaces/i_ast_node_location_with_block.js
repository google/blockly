/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an AST node location that has an associated
 * block.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IASTNodeLocationWithBlock');

goog.require('Blockly.IASTNodeLocation');
goog.requireType('Blockly.Block');


/**
 * An AST node location that has an associated block.
 * @interface
 * @extends {Blockly.IASTNodeLocation}
 */
Blockly.IASTNodeLocationWithBlock = function() {};

/**
 * Get the source block associated with this node.
 * @return {Blockly.Block} The source block.
 */
Blockly.IASTNodeLocationWithBlock.prototype.getSourceBlock;
