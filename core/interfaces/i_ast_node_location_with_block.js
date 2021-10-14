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

/**
 * The interface for an AST node location that has an associated
 * block.
 * @namespace Blockly.IASTNodeLocationWithBlock
 */
goog.module('Blockly.IASTNodeLocationWithBlock');

/* eslint-disable-next-line no-unused-vars */
const IASTNodeLocation = goog.require('Blockly.IASTNodeLocation');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * An AST node location that has an associated block.
 * @interface
 * @extends {IASTNodeLocation}
 * @alias Blockly.IASTNodeLocationWithBlock
 */
const IASTNodeLocationWithBlock = function() {};

/**
 * Get the source block associated with this node.
 * @return {Block} The source block.
 */
IASTNodeLocationWithBlock.prototype.getSourceBlock;

exports = IASTNodeLocationWithBlock;
