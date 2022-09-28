/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is draggable.
 */

'use strict';

/**
 * The interface for an object that is draggable.
 * @namespace Blockly.IDraggable
 */
goog.module('Blockly.IDraggable');

/* eslint-disable-next-line no-unused-vars */
const {IDeletable} = goog.require('Blockly.IDeletable');


/**
 * The interface for an object that can be dragged.
 * @extends {IDeletable}
 * @interface
 * @alias Blockly.IDraggable
 */
const IDraggable = function() {};

exports.IDraggable = IDraggable;
