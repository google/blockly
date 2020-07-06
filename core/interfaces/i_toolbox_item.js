/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an item in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IToolboxItem');


/**
 * Interface for an item in the toolbox.
 * @extends {Blockly.IToolboxItem}
 * @interface
 */
Blockly.IToolboxItem = function() {};

/**
 * Create the dom for the toolbox item.
 * @return {void}
 */
Blockly.IToolboxItem.prototype.createDom;

/**
 * Create the dom for the toolbox item.
 * @return {void}
 */
Blockly.IToolboxItem.prototype.dispose;
