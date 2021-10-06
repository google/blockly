/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is draggable.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IDraggable');

goog.require('Blockly.IDeletable');


/**
 * The interface for an object that can be dragged.
 * @extends {Blockly.IDeletable}
 * @interface
 */
Blockly.IDraggable = function() {};
