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

goog.provide('Blockly.IKeyboardAccessible');

goog.requireType('Blockly.ShortcutRegistry');


/**
 * An interface for an object that handles keyboard shortcuts.
 * @interface
 */
Blockly.IKeyboardAccessible = function() {};

/**
 * Handles the given keyboard shortcut.
 * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The shortcut to be handled.
 * @return {boolean} True if the shortcut has been handled, false otherwise.
 */
Blockly.IKeyboardAccessible.prototype.onShortcut;
