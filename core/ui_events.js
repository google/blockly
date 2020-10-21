/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of UI actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events.Ui');
goog.provide('Blockly.Events.Click');
goog.provide('Blockly.Events.ViewportChange');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');


/**
 * Class for a UI event.
 * UI events are events that don't need to be sent over the wire for multi-user
 * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
 * categories).
 * UI events do not undo or redo.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 *    Undefined for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Ui = function(opt_workspaceId) {
  Blockly.Events.Ui.superClass_.constructor.call(this);

  /**
   * Whether or not the event is blank (to be populated by fromJson).
   * @type {boolean}
   */
  this.isBlank = typeof opt_workspaceId == 'undefined';

  /**
   * The workspace identifier for this event.
   * @type {string}
   */
  this.workspaceId = opt_workspaceId ? opt_workspaceId : '';

  // UI events do not undo or redo.
  this.recordUndo = false;
};
Blockly.utils.object.inherits(Blockly.Events.Ui, Blockly.Events.Abstract);

/**
 * Whether or not the event is a UI event.
 * @type {boolean}
 */
Blockly.Events.Ui.prototype.IS_UI_EVENT = true;

/**
 * Class for a click event.
 * @param {?Blockly.Block=} opt_block The affected block. Null for click events
 *     that do not have an associated block (i.e. workspace click). Undefined
 *     for a blank event.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 * @param {string=} opt_targetType The type of element targeted by this click
 *    event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.Click = function(opt_block, opt_workspaceId, opt_targetType) {
  var workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
  Blockly.Events.Click.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  if (!opt_targetType && !this.isBlank) {
    opt_targetType = opt_block ? 'block' : 'workspace';
  }

  /**
   * The type of element targeted by this click event.
   * @type {string|undefined}
   */
  this.targetType = opt_targetType;
};
Blockly.utils.object.inherits(Blockly.Events.Click, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Click.prototype.type = Blockly.Events.CLICK;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Click.prototype.toJson = function() {
  var json = Blockly.Events.Click.superClass_.toJson.call(this);
  json['targetType'] = this.targetType;
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Click.prototype.fromJson = function(json) {
  Blockly.Events.Click.superClass_.fromJson.call(this, json);
  this.targetType = json['targetType'];
  this.blockId = json['blockId'];
};

/**
 * Class for a viewport change event.
 * @param {Number=} opt_top Top-edge of the visible portion of the workspace,
 *    relative to the workspace origin.
 * @param {Number=} opt_left Left-edge of the visible portion of the workspace,
 *    relative to the workspace origin.
 * @param {Number=} opt_scale The scale of the workspace.
 * @param {string=} opt_workspaceId The workspace identifier for this event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.ViewportChange = function(opt_top, opt_left, opt_scale,
    opt_workspaceId) {
  Blockly.Events.ViewportChange.superClass_.constructor.call(this, opt_workspaceId);

  /**
   * Top-edge of the visible portion of the workspace, relative to the workspace
   * origin.
   * @type {number|undefined}
   */
  this.viewTop = opt_top;

  /**
   * Left-edge of the visible portion of the workspace, relative to the
   * workspace origin.
   * @type {number|undefined}
   */
  this.viewLeft = opt_left;

  /**
   * The scale of the workspace.
   * @type {number|undefined}
   */
  this.scale = opt_scale;
};
Blockly.utils.object.inherits(Blockly.Events.ViewportChange, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ViewportChange.prototype.type = Blockly.Events.VIEWPORT_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ViewportChange.prototype.toJson = function() {
  var json = Blockly.Events.ViewportChange.superClass_.toJson.call(this);
  json['viewTop'] = this.viewTop;
  json['viewLeft'] = this.viewLeft;
  json['scale'] = this.scale;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ViewportChange.prototype.fromJson = function(json) {
  Blockly.Events.ViewportChange.superClass_.fromJson.call(this, json);
  this.viewTop = json['viewTop'];
  this.viewLeft = json['viewLeft'];
  this.scale = json['scale'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CLICK,
    Blockly.Events.Click);
Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.VIEWPORT_CHANGE, Blockly.Events.ViewportChange);
