/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Classes for all types of block events.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Events.BlockDelete');

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.xml');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Block');


/**
 * Class for a block deletion event.
 * @param {!Blockly.Block=} opt_block The deleted block.  Undefined for a blank
 *     event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
Blockly.Events.BlockDelete = function(opt_block) {
  Blockly.Events.BlockDelete.superClass_.constructor.call(this, opt_block);
  if (!opt_block) {
    return;  // Blank event to be populated by fromJson.
  }
  if (opt_block.getParent()) {
    throw Error('Connected blocks cannot be deleted.');
  }
  if (opt_block.isShadow()) {
    // Respawning shadow blocks is handled via disconnection.
    this.recordUndo = false;
  }

  if (opt_block.workspace.rendered) {
    this.oldXml = Blockly.Xml.blockToDomWithXY(opt_block);
  } else {
    this.oldXml = Blockly.Xml.blockToDom(opt_block);
  }
  this.ids = Blockly.Events.getDescendantIds(opt_block);
};
Blockly.utils.object.inherits(Blockly.Events.BlockDelete, Blockly.Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.BlockDelete.prototype.type = Blockly.Events.BLOCK_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.BlockDelete.prototype.toJson = function() {
  var json = Blockly.Events.BlockDelete.superClass_.toJson.call(this);
  json['oldXml'] = Blockly.Xml.domToText(this.oldXml);
  json['ids'] = this.ids;
  if (!this.recordUndo) {
    json['recordUndo'] = this.recordUndo;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.BlockDelete.prototype.fromJson = function(json) {
  Blockly.Events.BlockDelete.superClass_.fromJson.call(this, json);
  this.oldXml = Blockly.Xml.textToDom(json['oldXml']);
  this.ids = json['ids'];
  if (json['recordUndo'] !== undefined) {
    this.recordUndo = json['recordUndo'];
  }
};

/**
 * Run a deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.BlockDelete.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    for (var i = 0, id; (id = this.ids[i]); i++) {
      var block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't delete non-existent block: " + id);
      }
    }
  } else {
    var xml = Blockly.utils.xml.createElement('xml');
    xml.appendChild(this.oldXml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.DELETE,
    Blockly.Events.BlockDelete);
