/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a block creation event.
 */
'use strict';

/**
 * Class for a block creation event.
 * @class
 */
goog.module('Blockly.Events.BlockCreate');

const Xml = goog.require('Blockly.Xml');
const blocks = goog.require('Blockly.serialization.blocks');
const eventUtils = goog.require('Blockly.Events.utils');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');
const {BlockBase} = goog.require('Blockly.Events.BlockBase');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * Class for a block creation event.
 * @param {!Block=} opt_block The created block.  Undefined for a blank
 *     event.
 * @extends {BlockBase}
 * @constructor
 * @alias Blockly.Events.BlockCreate
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

  this.xml = Xml.blockToDomWithXY(opt_block);
  this.ids = eventUtils.getDescendantIds(opt_block);

  /**
   * JSON representation of the block that was just created.
   * @type {!blocks.State}
   */
  this.json = /** @type {!blocks.State} */ (
      blocks.save(opt_block, {addCoordinates: true}));
};
object.inherits(BlockCreate, BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
BlockCreate.prototype.type = eventUtils.BLOCK_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockCreate.prototype.toJson = function() {
  const json = BlockCreate.superClass_.toJson.call(this);
  json['xml'] = Xml.domToText(this.xml);
  json['ids'] = this.ids;
  json['json'] = this.json;
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
  this.xml = Xml.textToDom(json['xml']);
  this.ids = json['ids'];
  this.json = /** @type {!blocks.State} */ (json['json']);
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
    blocks.append(this.json, workspace);
  } else {
    for (let i = 0; i < this.ids.length; i++) {
      const id = this.ids[i];
      const block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false);
      } else if (id === this.blockId) {
        // Only complain about root-level block.
        console.warn('Can\'t uncreate non-existent block: ' + id);
      }
    }
  }
};

registry.register(registry.Type.EVENT, eventUtils.CREATE, BlockCreate);

exports.BlockCreate = BlockCreate;
