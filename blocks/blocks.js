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

goog.module('Blockly.libraryBlocks');
goog.module.declareLegacyNamespace();

const colour = goog.require('Blockly.libraryBlocks.colour');
const lists = goog.require('Blockly.libraryBlocks.lists');
const logic = goog.require('Blockly.libraryBlocks.logic');
const loops = goog.require('Blockly.libraryBlocks.loops');
const math = goog.require('Blockly.libraryBlocks.math');
const procedures = goog.require('Blockly.libraryBlocks.procedures');
const texts = goog.require('Blockly.libraryBlocks.texts');
const variables = goog.require('Blockly.libraryBlocks.variables');
const variablesDynamic = goog.require('Blockly.libraryBlocks.variablesDynamic');
/* eslint-disable-next-line no-unused-vars */
const {BlockDefinition} = goog.requireType('Blockly.blocks');


exports.colour = colour;
exports.lists = lists;
exports.logic = logic;
exports.loops = loops;
exports.math = math;
exports.procedures = procedures;
exports.texts = texts;
exports.variables = variables;
exports.variablesDynamic = variablesDynamic;

/**
 * A dictionary of the block definitions provided by all the
 * Blockly.libraryBlocks.* modules.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = Object.assign(
    {}, colour.blocks, lists.blocks, logic.blocks, loops.blocks, math.blocks,
    procedures.blocks, variables.blocks, variablesDynamic.blocks);
exports.blocks = blocks;
