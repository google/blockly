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
 * Class for a click event.
 * @param {!Blockly.Block=} opt_block The top block in the stack that is being
 *    dragged. Undefined for a blank event.
 * @param {boolean=} opt_isStart Whether this is the start of a block drag.
 * @param {!Array.<!Blockly.Block>=} opt_blocks The blocks affected by this
 *    drag. Undefined for a blank event.
 * @extends {Blockly.Events.Ui}
 * @constructor
 */
Blockly.Events.Drag = function(opt_block, opt_isStart, opt_blocks) {
  var workspaceId = opt_block ? opt_block.workspace.id : undefined;
  Blockly.Events.Drag.superClass_.constructor.call(this, workspaceId);
  this.blockId = opt_block ? opt_block.id : null;

  /**
   * Whether this is the start of a block drag. Undefined for blank event
   * @type {boolean|undefined}
   */
  this.isStart = opt_isStart;
  
  /**
   * The blocks affected by this drag event. Undefined for blank event
   * @type {!Array.<!Blockly.Block>|undefined}
   */
  this.blocks = opt_blocks;
};
Blockly.utils.object.inherits(Blockly.Events.Drag, Blockly.Events.Ui);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Drag.prototype.type = Blockly.Events.BLOCK_DRAG;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Drag.prototype.toJson = function() {
  var json = Blockly.Events.Drag.superClass_.toJson.call(this);
  json['blockId'] = this.blockId;
  json['blocks'] = this.blocks;
  json['isStart'] = this.isStart;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Drag.prototype.fromJson = function(json) {
  Blockly.Events.Drag.superClass_.fromJson.call(this, json);
  this.blockId = json['blockId'];
  this.blocks = json['blocks'];
  this.isStart = json['isStart'];
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CLICK,
    Blockly.Events.Click);
Blockly.registry.register(Blockly.registry.Type.EVENT,
    Blockly.Events.BLOCK_DRAG, Blockly.Events.Drag);
