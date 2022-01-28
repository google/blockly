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

goog.module('Blockly.blocks.all');
goog.module.declareLegacyNamespace();

const colour = goog.require('Blockly.blocks.colour');
const lists = goog.require('Blockly.blocks.lists');
const logic = goog.require('Blockly.blocks.logic');
const loops = goog.require('Blockly.blocks.loops');
const math = goog.require('Blockly.blocks.math');
const procedures = goog.require('Blockly.blocks.procedures');
const texts = goog.require('Blockly.blocks.texts');
const variables = goog.require('Blockly.blocks.variables');
const variablesDynamic = goog.require('Blockly.blocks.variablesDynamic');


exports.colour = colour;
exports.lists = lists;
exports.logic = logic;
exports.loops = loops;
exports.math = math;
exports.procedures = procedures;
exports.texts = texts;
exports.variables = variables;
exports.variablesDynamic = variablesDynamic;

