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
goog.provide('Blockly.Events.MarkerMove');

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
 * Class for a marker move event.
 * @param {?Blockly.Block=} opt_block The affected block. Null if current node
 *    is of type workspace. Undefined for a blank event.
 * @param {boolean=} isCursor Whether this is a cursor event.
 * @param {?Blockly.ASTNode=} opt_oldNode The old node the marker used to be on.
 * @param {!Blockly.ASTNode=} opt_curNode The new node the marker is now on.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.MarkerMove = function(opt_block, isCursor, opt_oldNode,
    opt_curNode) {
  var workspaceId = opt_block ? opt_block.workspace.id : undefined;
  if (opt_curNode && opt_curNode.getType() == Blockly.ASTNode.types.WORKSPACE) {
    workspaceId =
        (/** @type {!Blockly.Workspace} */ (opt_curNode.getLocation())).id;
  }
  Blockly.Events.MarkerMove.superClass_.constructor.call(this, workspaceId);

  /**
   * The workspace identifier for this event.
   * @type {?string}
   */
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * The old node the marker used to be on.
   * @type {?Blockly.ASTNode|undefined}
   */
  this.oldNode = opt_oldNode;

  /**
   * The new node the  marker is now on.
   * @type {Blockly.ASTNode|undefined}
   */
  this.curNode = opt_curNode;

  /**
   * Whether this is a cursor event.
   * @type {boolean|undefined}
   */
  this.isCursor = isCursor;
};
Blockly.utils.object.inherits(Blockly.Events.MarkerMove, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.MarkerMove.prototype.type = Blockly.Events.MARKER_MOVE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.MarkerMove.prototype.toJson = function() {
  var json = Blockly.Events.MarkerMove.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  json['oldNode'] = this.oldNode;
  json['curNode'] = this.curNode;
  json['isCursor'] = this.isCursor;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.MarkerMove.prototype.fromJson = function(json) {
  Blockly.Events.MarkerMove.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
  this.oldNode = json['oldNode'];
  this.curNode = json['curNode'];
  this.isCursor = json['isCursor'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CLICK,
    Blockly.Events.Click);
Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.MARKER_MOVE, Blockly.Events.MarkerMove);
