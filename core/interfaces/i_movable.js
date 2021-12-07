/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is movable.
 */

'use strict';

/**
 * The interface for an object that is movable.
 * @namespace Blockly.IMovable
 */
goog.module('Blockly.IMovable');


/**
 * The interface for an object that is movable.
 * @interface
 * @alias Blockly.IMovable
 */
const IMovable = function() {};

/**
 * Get whether this is movable or not.
 * @return {boolean} True if movable.
 */
IMovable.prototype.isMovable;

exports.IMovable = IMovable;
