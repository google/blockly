/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A mapping of block type names to block prototype objects.
 */
'use strict';

/**
 * A mapping of block type names to block prototype objects.
 * @namespace Blockly.blocks
 */
goog.module('Blockly.blocks');


/**
 * A block definition.  For now this very lose, but it can potentially
 * be refined e.g. by replacing this typedef with a class definition.
 * @typedef {!Object}
 */
let BlockDefinition;
exports.BlockDefinition = BlockDefinition;

/**
 * A mapping of block type names to block prototype objects.
 * @type {!Object<string,!BlockDefinition>}
 * @alias Blockly.blocks.Blocks
 */
const Blocks = Object.create(null);
exports.Blocks = Blocks;
