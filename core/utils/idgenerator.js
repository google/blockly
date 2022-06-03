/** @fileoverview Generators for unique IDs. */


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
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Generators for unique IDs.
 * @namespace Blockly.utils.idGenerator
 */


/**
 * Namespace object for internal implementations we want to be able to
 * stub in tests.
 * @ignore
 */
const internal = {};
export const TEST_ONLY = internal;

/** Next unique ID to use. */
let nextId = 0;

/**
 * Generate the next unique element IDs.
 * IDs are compatible with the HTML4 id attribute restrictions:
 * Use only ASCII letters, digits, '_', '-' and '.'
 *
 * For UUIDs use genUid (below) instead; this ID generator should
 * primarily be used for IDs that end up in the DOM.
 *
 * @return The next unique identifier.
 * @alias Blockly.utils.idGenerator.getNextUniqueId
 */
export function getNextUniqueId(): string {
  return 'blockly-' + (nextId++).toString(36);
}

/**
 * Legal characters for the universally unique IDs.  Should be all on
 * a US keyboard.  No characters that conflict with XML or JSON.
 * Requests to remove additional 'problematic' characters from this
 * soup will be denied.  That's your failure to properly escape in
 * your own environment.  Issues #251, #625, #682, #1304.
 */
const soup = '!#$%()*+,-./:;=?@[]^_`{|}~' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a random unique ID.  This should be globally unique.
 * 87 characters ^ 20 length > 128 bits (better than a UUID).
 * @return A globally unique ID string.
 */
// AnyDuringMigration because:  Property 'genUid' does not exist on type '{}'.
(internal as AnyDuringMigration).genUid = function (): string {
  const length = 20;
  const soupLength = soup.length;
  const id = [];
  for (let i = 0; i < length; i++) {
    id[i] = soup.charAt(Math.random() * soupLength);
  }
  return id.join('');
};

/**
 * Generate a random unique ID.
 * @see internal.genUid
 * @return A globally unique ID string.
 * @alias Blockly.utils.idGenerator.genUid
 */
export function genUid(): string {
  // AnyDuringMigration because:  Property 'genUid' does not exist on type '{}'.
  return (internal as AnyDuringMigration).genUid();
}
