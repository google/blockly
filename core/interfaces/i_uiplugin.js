/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an ui plugin.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IUIPlugin');

goog.require('Blockly.IPlugin');


/**
 * @extends {Blockly.IPlugin}
 * @interface
 */
Blockly.IUIPlugin = function() {};

/**
 * Initializes the plugin.
 * @param {boolean} isVisible True if the plugin should be visible. False, otherwise.
 * @return {void}
 */
Blockly.IUIPlugin.prototype.setVisible;

/**
 * Position the plugin after a workspace resize.
 * @return {void}
 */
Blockly.IUIPlugin.prototype.position;
