/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common functions used both internally and externally, but which
 * must not be at the top level to avoid circular dependencies.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.common');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const Workspace = goog.requireType('Blockly.Workspace');


/**
 * The main workspace most recently used.
 * Set by Blockly.WorkspaceSvg.prototype.markFocused
 * @type {!Workspace}
 */
let mainWorkspace;

/**
 * Returns the last used top level workspace (based on focus).  Try not to use
 * this function, particularly if there are multiple Blockly instances on a
 * page.
 * @return {!Workspace} The main workspace.
 */
const getMainWorkspace = function() {
  return mainWorkspace;
};
exports.getMainWorkspace = getMainWorkspace;

/**
 * Sets last used main workspace.
 * @param {!Workspace} workspace The most recently used top level workspace.
 */
const setMainWorkspace = function(workspace) {
  mainWorkspace = workspace;
};
exports.setMainWorkspace = setMainWorkspace;
