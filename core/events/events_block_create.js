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

goog.module('Blockly.Events.BlockCreate');
goog.module.declareLegacyNamespace();

goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockBase');
goog.require('Blockly.registry');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.xml');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Block');


/**
 * Class for a block creation event.
 * @param {!Blockly.Block=} opt_block The created block.  Undefined for a blank
 *     event.
 * @extends {Blockly.Events.BlockBase}
 * @constructor
 */
const BlockCreate = function(opt_block) {
  BlockCreate.superClass_.constructor.call(this, opt_block);
  if (!opt_block) {
    return;  // Blank event to be populated by fromJson.
  }
  if (opt_block.isShadow()) {
    // Moving shadow blocks is handled via disconnection.
    this.recordUndo = false;
  }

  if (opt_block.workspace.rendered) {
    this.xml = Blockly.Xml.blockToDomWithXY(opt_block);
  } else {
    this.xml = Blockly.Xml.blockToDom(opt_block);
  }
  this.ids = Blockly.Events.getDescendantIds(opt_block);
};
Blockly.utils.object.inherits(BlockCreate, Blockly.Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
BlockCreate.prototype.type = Blockly.Events.BLOCK_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockCreate.prototype.toJson = function() {
  const json = BlockCreate.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
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
BlockCreate.prototype.fromJson = function(json) {
  BlockCreate.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom(json['xml']);
  this.ids = json['ids'];
  if (json['recordUndo'] !== undefined) {
    this.recordUndo = json['recordUndo'];
  }
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
BlockCreate.prototype.run = function(forward) {
  const workspace = this.getEventWorkspace_();
  if (forward) {
    const xml = Blockly.utils.xml.createElement('xml');
    xml.appendChild(this.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  } else {
    for (let i = 0; i < this.ids.length; i++) {
      const id = this.ids[i];
      const block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't uncreate non-existent block: " + id);
      }
    }
  }
};

Blockly.registry.register(Blockly.registry.Type.EVENT, Blockly.Events.CREATE,
    BlockCreate);

exports = BlockCreate;
