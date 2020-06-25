/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
  return 'blockly-' + (Blockly.utils.IdGenerator.nextId_++).toString(36);
};
