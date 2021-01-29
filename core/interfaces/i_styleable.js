/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that a style can be added to.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IStyleable');


/**
 * Interface for an object that a style can be added to.
 * @interface
 */
Blockly.IStyleable = function() {};

/**
 * Adds a style on the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to add.
 */
Blockly.IStyleable.prototype.addStyle;

/**
 * Removes a style from the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to remove.
 */
Blockly.IStyleable.prototype.removeStyle;
