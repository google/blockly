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


/* eslint-disable-next-line no-unused-vars */



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
  onShortcut: AnyDuringMigration;
}
