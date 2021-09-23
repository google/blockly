/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is deletable.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.module('Blockly.IDeletable');


/**
 * The interface for an object that can be deleted.
 * @interface
 */
const IDeletable = function() {};

/**
 * Get whether this object is deletable or not.
 * @return {boolean} True if deletable.
 */
IDeletable.prototype.isDeletable;

exports = IDeletable;
