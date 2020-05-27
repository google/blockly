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

goog.provide('Blockly.IDeletable');


/**
 * The interface for an object that can be deleted.
 * @interface
 */
Blockly.IDeletable = function() {};

/**
 * Get whether this object is deletable or not.
 * @return {boolean} True if deletable.
 */
Blockly.IDeletable.prototype.isDeletable;
