/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that supports a right-click.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.module('Blockly.IContextMenu');
goog.module.declareLegacyNamespace();


/**
 * @interface
 */
const IContextMenu = function() {};

/**
 * Show the context menu for this object.
 * @param {!Event} e Mouse event.
 */
IContextMenu.prototype.showContextMenu;

exports = IContextMenu;
