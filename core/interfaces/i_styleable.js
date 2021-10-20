/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that a style can be added to.
 */

'use strict';

/**
 * The interface for an object that a style can be added to.
 * @namespace Blockly.IStyleable
 */
goog.module('Blockly.IStyleable');


/**
 * Interface for an object that a style can be added to.
 * @interface
 * @alias Blockly.IStyleable
 */
const IStyleable = function() {};

/**
 * Adds a style on the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to add.
 */
IStyleable.prototype.addStyle;

/**
 * Removes a style from the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to remove.
 */
IStyleable.prototype.removeStyle;

exports.IStyleable = IStyleable;
