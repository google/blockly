/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A mapping of block type names to block prototype objects.
 * @author spertus@google.com (Ellen Spertus)
 */
'use strict';

/**
 * A mapping of block type names to block prototype objects.
 * @name Blockly.Blocks
 */
goog.module('Blockly.blocks');


/**
 * A mapping of block type names to block prototype objects.
 * @type {!Object<string,!Object>}
 */
const Blocks = Object.create(null);

exports.Blocks = Blocks;
