/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a plugin.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IPlugin');


/**
 * @interface
 */
Blockly.IPlugin = function() {};

/**
 * Initializes the plugin.
 * @return {void}
 */
Blockly.IPlugin.prototype.init;

/**
 * Disposes of the plugin. Should completely clean up after the plugin.
 * @return {void}
 */
Blockly.IPlugin.prototype.dispose;
