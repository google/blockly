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

goog.module('Blockly.IMovable');
goog.module.declareLegacyNamespace();


/**
 * The interface for an object that is movable.
 * @interface
 */
const IMovable = function() {};

/**
 * Get whether this is movable or not.
 * @return {boolean} True if movable.
 */
IMovable.prototype.isMovable;

exports = IMovable;
