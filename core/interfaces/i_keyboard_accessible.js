/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for objects that handle keyboard shortcuts.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.module('Blockly.IKeyboardAccessible');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const ShortcutRegistry = goog.requireType('Blockly.ShortcutRegistry');


/**
 * An interface for an object that handles keyboard shortcuts.
 * @interface
 */
const IKeyboardAccessible = function() {};

/**
 * Handles the given keyboard shortcut.
 * @param {!ShortcutRegistry.KeyboardShortcut} shortcut The shortcut to be
 *     handled.
 * @return {boolean} True if the shortcut has been handled, false otherwise.
 */
IKeyboardAccessible.prototype.onShortcut;

exports = IKeyboardAccessible;
