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

/**
 * @name Blockly.utils.idGenerator
 * @namespace
 */
goog.module('Blockly.utils.idGenerator');
goog.module.declareLegacyNamespace();


/**
 * Next unique ID to use.
 * @type {number}
 */
let nextId = 0;

/**
 * Gets the next unique ID.
 * IDs are compatible with the HTML4 id attribute restrictions:
 * Use only ASCII letters, digits, '_', '-' and '.'
 * @return {string} The next unique identifier.
 */
const getNextUniqueId = function() {
  return 'blockly-' + (nextId++).toString(36);
};
exports.getNextUniqueId = getNextUniqueId;
