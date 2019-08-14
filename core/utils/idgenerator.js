/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Generator for unique element IDs.
 * For UUIDs use Blockly.utils.genUid. The ID generator should primarily be
 * used for IDs that end up in the DOM.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';


goog.provide('Blockly.utils.IdGenerator');


/**
 * Creates a new id generator.
 * @constructor
 * @final
 */
Blockly.utils.IdGenerator = function() {};

/**
 * Get the singleton instance of Blockly.utils.IdGenerator.
 * @returns {Blockly.utils.IdGenerator} singleton instance
 */
Blockly.utils.IdGenerator.getInstance = function() {
  if (!Blockly.utils.IdGenerator.instance_) {
    Blockly.utils.IdGenerator.instance_ = new Blockly.utils.IdGenerator();
  }
  return Blockly.utils.IdGenerator.instance_;
};

/**
 * Next unique ID to use
 * @type {number}
 * @private
 */
Blockly.utils.IdGenerator.prototype.nextId_ = 0;

/**
 * Gets the next unique ID.
 * The difference between this and genUid is that getNextUniqueId generates
 * IDs compatible with the HTML4 id attribute restrictions:
 * Use only ASCII letters, digits, '_', '-' and '.'
 * @return {string} The next unique identifier.
 */
Blockly.utils.IdGenerator.prototype.getNextUniqueId = function() {
  return 'blockly:' + (this.nextId_++).toString(36);
};
