/** @fileoverview The interface for objects that handle keyboard shortcuts. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The interface for objects that handle keyboard shortcuts.
 * @namespace Blockly.IKeyboardAccessible
 */

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../shortcut_registry';


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
