/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
import {KeyboardShortcut} from '../shortcut_registry.js';
goog.declareModuleId('Blockly.IKeyboardAccessible');

/**
 * An interface for an object that handles keyboard shortcuts.
 */
export interface IKeyboardAccessible {
  /**
   * Handles the given keyboard shortcut.
   *
   * @param shortcut The shortcut to be handled.
   * @returns True if the shortcut has been handled, false otherwise.
   */
  onShortcut(shortcut: KeyboardShortcut): boolean;
}
