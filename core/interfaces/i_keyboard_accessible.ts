/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for objects that handle keyboard shortcuts.
 */

/**
 * The interface for objects that handle keyboard shortcuts.
 * @namespace Blockly.IKeyboardAccessible
 */
import * as goog from '../../closure/goog/goog.js';
import {KeyboardShortcut} from '../shortcut_registry.js';
goog.declareModuleId('Blockly.IKeyboardAccessible');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
// import '../shortcut_registry.js';


/**
 * An interface for an object that handles keyboard shortcuts.
 * @alias Blockly.IKeyboardAccessible
 */
export interface IKeyboardAccessible {
  /**
   * Handles the given keyboard shortcut.
   * @param shortcut The shortcut to be handled.
   * @return True if the shortcut has been handled, false otherwise.
   */
  onShortcut(shortcut: KeyboardShortcut): boolean;
}
