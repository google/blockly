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

goog.module('Blockly.IDraggable');
goog.module.declareLegacyNamespace();

const IDeletable = goog.require('Blockly.IDeletable');


/**
 * The interface for an object that can be dragged.
 * @extends {IDeletable}
 * @interface
 */
const IDraggable = function() {};

exports = IDraggable;
