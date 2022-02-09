/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview All the blocks.  (Entry point for blocks_compressed.js.)
 * @suppress {extraRequire}
 */
'use strict';

goog.declareModuleId('Blockly.blocks.all');
// goog.declareModuleId.declareLegacyNamespace();

const colour = goog.require('Blockly.blocks.colour');
const lists = goog.require('Blockly.blocks.lists');
const logic = goog.require('Blockly.blocks.logic');
const loops = goog.require('Blockly.blocks.loops');
const math = goog.require('Blockly.blocks.math');
const procedures = goog.require('Blockly.blocks.procedures');
const texts = goog.require('Blockly.blocks.texts');
const variables = goog.require('Blockly.blocks.variables');
const variablesDynamic = goog.require('Blockly.blocks.variablesDynamic');
/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');


export {colour};
export {lists};
export {logic};
export {loops};
export {math};
export {procedures};
export {texts};
export {variables};
export {variablesDynamic};

/**
 * A dictionary of the block definitions provided by all the
 * Blockly.blocks.* modules.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = Object.assign(
    {}, colour.blocks, lists.blocks, logic.blocks, loops.blocks, math.blocks,
    procedures.blocks, variables.blocks, variablesDynamic.blocks);
export {blocks};
