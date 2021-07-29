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
/* eslint-disable-next-line no-unused-vars */
const WorkspaceSvg = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Contents of the local clipboard.
 * @type {?Element}
 * @private
 */
let xml = null;

/**
 * Source of the local clipboard.
 * @type {?WorkspaceSvg}
 * @private
 */
let source = null;

/**
 * Map of types to type counts for the clipboard object and descendants.
 * @type {?Object}
 * @private
 */
let typeCounts = null;

/**
 * Get the current contents of the clipboard and associated metadata.
 * @return {{xml: ?Element, source: ?WorkspaceSvg, typeCounts: ?Object}} An
 *     object containing the clipboard contents and associated metadata.
 */
const getClipboardInfo = function() {
  return {xml: xml, source: source, typeCounts: typeCounts};
};
exports.getClipboardInfo = getClipboardInfo;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param {!ICopyable} toCopy Block or Workspace Comment to be copied.
 */
const copy = function(toCopy) {
  var data = toCopy.toCopyData();
  if (data) {
    xml = data.xml;
    source = data.source;
    typeCounts = data.typeCounts;
  }
};
/** @package */
exports.copy = copy;

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return {boolean} True if the paste was successful, false otherwise.
 */
const paste = function() {
  if (!xml) {
    return false;
  }
  // Pasting always pastes to the main workspace, even if the copy
  // started in a flyout workspace.
  var workspace = source;
  if (workspace.isFlyout) {
    workspace = workspace.targetWorkspace;
  }
  if (typeCounts && workspace.isCapacityAvailable(typeCounts)) {
    Events.setGroup(true);
    workspace.paste(xml);
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
  // Save the clipboard.
  const oldXml = xml;
  const oldSource = source;

  // Create a duplicate via a copy/paste operation.
  copy(toDuplicate);
  toDuplicate.workspace.paste(xml);

  // Restore the clipboard.
  xml = oldXml;
  source = oldSource;
};
/** @package */
exports.duplicate = duplicate;
