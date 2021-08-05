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

goog.module('Blockly.Events.BlockDelete');
goog.module.declareLegacyNamespace();

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
const BlockDelete = function(opt_block) {
  BlockDelete.superClass_.constructor.call(this, opt_block);
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
Blockly.utils.object.inherits(BlockDelete, Blockly.Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
BlockDelete.prototype.type = Blockly.Events.BLOCK_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockDelete.prototype.toJson = function() {
  const json = BlockDelete.superClass_.toJson.call(this);
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
BlockDelete.prototype.fromJson = function(json) {
  BlockDelete.superClass_.fromJson.call(this, json);
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
BlockDelete.prototype.run = function(forward) {
  const workspace = this.getEventWorkspace_();
  if (forward) {
    for (let i = 0; i < this.ids.length; i++) {
      const id = this.ids[i];
      const block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't delete non-existent block: " + id);
      }
    }
  } else {
    const xml = Blockly.utils.xml.createElement('xml');
    xml.appendChild(this.oldXml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.DELETE,
    BlockDelete);

exports = BlockDelete;
