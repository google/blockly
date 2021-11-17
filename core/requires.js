/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Default Blockly entry point. Use this to pick and choose which
 * fields and renderers to include in your Blockly bundle.
 * @suppress {extraRequire}
 */
'use strict';

goog.provide('Blockly.requires');

// Blockly Core (absolutely mandatory).
goog.require('Blockly');

// Blockly Themes.
// Classic is the default theme.
goog.require('Blockly.Themes.Classic');

goog.require('Blockly.serialization.blocks');
goog.require('Blockly.serialization.registry');
goog.require('Blockly.serialization.variables');
goog.require('Blockly.serialization.workspaces');
