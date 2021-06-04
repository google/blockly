/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is movable.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IMovable');


/**
 * The interface for an object that is movable.
 * @interface
 */
Blockly.IMovable = function() {};

/**
 * Get whether this is movable or not.
 * @return {boolean} True if movable.
 */
Blockly.IMovable.prototype.isMovable;
