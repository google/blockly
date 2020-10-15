/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a finished loading workspace event.
 * @author BeksOmega
 */
'use strict';

goog.provide('Blockly.Events.FinishedLoading');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Ui');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a finished loading event.
 * Used to notify the developer when the workspace has finished loading (i.e
 * domToWorkspace).
 * Finished loading events do not record undo or redo.
 * @param {!Blockly.Workspace=} opt_workspace The workspace that has finished
 *    loading.  Undefined for a blank event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.FinishedLoading = function(opt_workspace) {
  var workspaceId = opt_workspace ? opt_workspace.id : undefined;
  Blockly.Events.Click.superClass_.constructor.call(this, workspaceId);
};
Blockly.utils.object.inherits(Blockly.Events.FinishedLoading,
    Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.FinishedLoading.prototype.type = Blockly.Events.FINISHED_LOADING;

Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.FINISHED_LOADING, Blockly.Events.FinishedLoading);
