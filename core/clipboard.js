/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly's internal clipboard for managing copy-paste.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.clipboard');
goog.module.declareLegacyNamespace();

const Events = goog.require('Blockly.Events');
/* eslint-disable-next-line no-unused-vars */
const ICopyable = goog.requireType('Blockly.ICopyable');

/**
 * Metadata about the object that is currently on the clipboard.
 * @type {?ICopyable.CopyData}
 */
let copyData = null;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param {!ICopyable} toCopy Block or Workspace Comment to be copied.
 */
const copy = function(toCopy) {
  copyData = toCopy.toCopyData();
};
/** @package */
exports.copy = copy;

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return {boolean} True if the paste was successful, false otherwise.
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
    Events.setGroup(true);
    workspace.paste(copyData.saveInfo);
    Events.setGroup(false);
    return true;
  }
  return false;
};
/** @package */
exports.paste = paste;

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param {!ICopyable} toDuplicate Block or Workspace Comment to be
 *     duplicated.
 */
const duplicate = function(toDuplicate) {
  const oldCopyData = copyData;
  copy(toDuplicate);
  toDuplicate.workspace.paste(copyData.saveInfo);
  copyData = oldCopyData;
};
/** @package */
exports.duplicate = duplicate;
