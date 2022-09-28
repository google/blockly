/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generators for unique IDs.
 */
'use strict';

/**
 * Generators for unique IDs.
 * @namespace Blockly.utils.idGenerator
 */
goog.module('Blockly.utils.idGenerator');


/**
 * Namespace object for internal implementations we want to be able to
 * stub in tests.
 * @ignore
 */
const internal = {};
exports.TEST_ONLY = internal;

/**
 * Next unique ID to use.
 * @type {number}
 */
let nextId = 0;

/**
 * Generate the next unique element IDs.
 * IDs are compatible with the HTML4 id attribute restrictions:
 * Use only ASCII letters, digits, '_', '-' and '.'
 *
 * For UUIDs use genUid (below) instead; this ID generator should
 * primarily be used for IDs that end up in the DOM.
 *
 * @return {string} The next unique identifier.
 * @alias Blockly.utils.idGenerator.getNextUniqueId
 */
const getNextUniqueId = function() {
  return 'blockly-' + (nextId++).toString(36);
};
exports.getNextUniqueId = getNextUniqueId;

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
 * @return {string} A globally unique ID string.
 */
internal.genUid = function() {
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
 * @return {string} A globally unique ID string.
 * @alias Blockly.utils.idGenerator.genUid
 */
const genUid = function() {
  return internal.genUid();
};
exports.genUid = genUid;
