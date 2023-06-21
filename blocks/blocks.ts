/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview All the blocks.  (Entry point for blocks_compressed.js.)
 * @suppress {extraRequire}
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.libraryBlocks');

import * as colour from './colour.js';
import * as lists from './lists.js';
import * as logic from './logic.js';
import * as loops from './loops.js';
import * as math from './math.js';
import * as procedures from './procedures.js';
import * as texts from './text.js';
import * as variables from './variables.js';
import * as variablesDynamic from './variables_dynamic.js';
// import type {BlockDefinition} from '../core/blocks.js';
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
export colour;
export lists;
export loops;
export math;
export procedures;
export texts;
export variables;
export variablesDynamic;

/**
 * A dictionary of the block definitions provided by all the
 * Blockly.libraryBlocks.* modules.
 * @type {!Object<string, !BlockDefinition>}
 */
export const blocks = Object.assign(
    {}, colour.blocks, lists.blocks, logic.blocks, loops.blocks, math.blocks,
    procedures.blocks, variables.blocks, variablesDynamic.blocks);
