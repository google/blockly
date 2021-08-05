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

/* eslint-disable-next-line no-unused-vars */
const Block = goog.requireType('Blockly.Block');
const BlockBase = goog.require('Blockly.Events.BlockBase');
const Events = goog.require('Blockly.Events');
const Xml = goog.require('Blockly.Xml');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const xml = goog.require('Blockly.utils.xml');


/**
 * Class for a block deletion event.
 * @param {!Block=} opt_block The deleted block.  Undefined for a blank
 *     event.
 * @extends {BlockBase}
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
    this.oldXml = Xml.blockToDomWithXY(opt_block);
  } else {
    this.oldXml = Xml.blockToDom(opt_block);
  }
  this.ids = Events.getDescendantIds(opt_block);
};
object.inherits(BlockDelete, BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
BlockDelete.prototype.type = Events.BLOCK_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockDelete.prototype.toJson = function() {
  const json = BlockDelete.superClass_.toJson.call(this);
  json['oldXml'] = Xml.domToText(this.oldXml);
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
  this.oldXml = Xml.textToDom(json['oldXml']);
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
    const xmlEl = xml.createElement('xml');
    xmlEl.appendChild(this.oldXml);
    Xml.domToWorkspace(xmlEl, workspace);
  }
};

registry.register(registry.Type.EVENT, Events.DELETE,
    BlockDelete);

exports = BlockDelete;
