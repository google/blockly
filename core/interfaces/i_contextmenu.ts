/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that supports a right-click.
 */

'use strict';

/**
 * The interface for an object that supports a right-click.
 * @namespace Blockly.IContextMenu
 */
goog.module('Blockly.IContextMenu');


/**
 * @interface
 * @alias Blockly.IContextMenu
 */
const IContextMenu = function() {};

/**
 * Show the context menu for this object.
 * @param {!Event} e Mouse event.
 */
IContextMenu.prototype.showContextMenu;

exports.IContextMenu = IContextMenu;
