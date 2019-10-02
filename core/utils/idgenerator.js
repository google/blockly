/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Generator for unique element IDs.
 * For UUIDs use Blockly.utils.genUid. The ID generator should primarily be
 * used for IDs that end up in the DOM.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.utils.IdGenerator');


/**
 * Next unique ID to use.
 * @type {number}
 * @private
 */
Blockly.utils.IdGenerator.nextId_ = 0;

/**
 * Gets the next unique ID.
 * IDs are compatible with the HTML4 id attribute restrictions:
 * Use only ASCII letters, digits, '_', '-' and '.'
 * @return {string} The next unique identifier.
 */
Blockly.utils.IdGenerator.getNextUniqueId = function() {
  return 'blockly:' + (Blockly.utils.IdGenerator.nextId_++).toString(36);
};
