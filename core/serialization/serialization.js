/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Namespace for serialization functionality.
 */
'use strict';

goog.module('Blockly.serialization');

const {ISerializer} = goog.require('Blockly.serialization.ISerializer');
const blocks = goog.require('Blockly.serialization.blocks');
const exceptions = goog.require('Blockly.serialization.exceptions');
const priorities = goog.require('Blockly.serialization.priorities');
const registry = goog.require('Blockly.serialization.registry');
const variables = goog.require('Blockly.serialization.variables');
const workspaces = goog.require('Blockly.serialization.workspaces');


exports.ISerializer = ISerializer;
exports.blocks = blocks;
exports.exceptions = exceptions;
exports.priorities = priorities;
exports.registry = registry;
exports.variables = variables;
exports.workspaces = workspaces;
