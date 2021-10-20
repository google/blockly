/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly's internal clipboard for managing copy-paste.
 */
'use strict';

/**
 * Blockly's internal clipboard for managing copy-paste.
 * @namespace Blockly.clipboard
 */
goog.module('Blockly.clipboard');

const eventUtils = goog.require('Blockly.Events.utils');
/* eslint-disable-next-line no-unused-vars */
const {ICopyable} = goog.requireType('Blockly.ICopyable');


/**
 * Metadata about the object that is currently on the clipboard.
 * @type {?ICopyable.CopyData}
 */
let copyData = null;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param {!ICopyable} toCopy Block or Workspace Comment to be copied.
 * @alias Blockly.clipboard.copy
 * @package
 */
const copy = function(toCopy) {
  copyData = toCopy.toCopyData();
};
exports.copy = copy;

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return {boolean} True if the paste was successful, false otherwise.
 * @alias Blockly.clipboard.paste
 * @package
 */
const paste = function() {
  if (!copyData) {
    return false;
  }
  // Pasting always pastes to the main workspace, even if the copy
  // started in a flyout workspace.
  let workspace = copyData.source;
  if (workspace.isFlyout) {
    workspace = workspace.targetWorkspace;
  }
  if (copyData.typeCounts &&
      workspace.isCapacityAvailable(copyData.typeCounts)) {
    eventUtils.setGroup(true);
    workspace.paste(copyData.saveInfo);
    eventUtils.setGroup(false);
    return true;
  }
  return false;
};
exports.paste = paste;

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param {!ICopyable} toDuplicate Block or Workspace Comment to be
 *     duplicated.
 * @alias Blockly.clipboard.duplicate
 * @package
 */
const duplicate = function(toDuplicate) {
  const oldCopyData = copyData;
  copy(toDuplicate);
  toDuplicate.workspace.paste(copyData.saveInfo);
  copyData = oldCopyData;
};
exports.duplicate = duplicate;
