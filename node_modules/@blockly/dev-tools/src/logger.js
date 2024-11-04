/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A workspace console logger.
 * @author samelh@google.com (Sam El-Husseini)
 */

/**
 * Enables console logging of workspace events.
 * @param {!Blockly.Workspace} workspace The Blockly workspace.
 */
export function enableLogger(workspace) {
  workspace.addChangeListener(log);
}

/**
 * Disables console logging of workspace events.
 * @param {!Blockly.Workspace} workspace The Blockly workspace.
 */
export function disableLogger(workspace) {
  workspace.removeChangeListener(log);
}

/**
 * Logs a Blockly event directory to the console.
 * @param {!Blockly.Events.Abstract} e The Blockly event.
 */
function log(e) {
  console.log(e);
}
