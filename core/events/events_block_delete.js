/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a block delete event.
 */
'use strict';

/**
 * Class for a block delete event.
 * @class
 */
goog.module('Blockly.Events.BlockDelete');

const Xml = goog.require('Blockly.Xml');
const blocks = goog.require('Blockly.serialization.blocks');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {BlockBase} = goog.require('Blockly.Events.BlockBase');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * Class for a block deletion event.
 * @extends {BlockBase}
 * @alias Blockly.Events.BlockDelete
 */
class BlockDelete extends BlockBase {
  /**
   * @param {!Block=} opt_block The deleted block.  Undefined for a blank
   *     event.
   */
  constructor(opt_block) {
    super(opt_block);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.BLOCK_DELETE;

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

    this.oldXml = Xml.blockToDomWithXY(opt_block);
    this.ids = eventUtils.getDescendantIds(opt_block);

    /**
     * Was the block that was just deleted a shadow?
     * @type {boolean}
     */
    this.wasShadow = opt_block.isShadow();

    /**
     * JSON representation of the block that was just deleted.
     * @type {!blocks.State}
     */
    this.oldJson = /** @type {!blocks.State} */ (
        blocks.save(opt_block, {addCoordinates: true}));
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['oldXml'] = Xml.domToText(this.oldXml);
    json['ids'] = this.ids;
    json['wasShadow'] = this.wasShadow;
    json['oldJson'] = this.oldJson;
    if (!this.recordUndo) {
      json['recordUndo'] = this.recordUndo;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.oldXml = Xml.textToDom(json['oldXml']);
    this.ids = json['ids'];
    this.wasShadow =
        json['wasShadow'] || this.oldXml.tagName.toLowerCase() === 'shadow';
    this.oldJson = /** @type {!blocks.State} */ (json['oldJson']);
    if (json['recordUndo'] !== undefined) {
      this.recordUndo = json['recordUndo'];
    }
  }

  /**
   * Run a deletion event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
    const workspace = this.getEventWorkspace_();
    if (forward) {
      for (let i = 0; i < this.ids.length; i++) {
        const id = this.ids[i];
        const block = workspace.getBlockById(id);
        if (block) {
          block.dispose(false);
        } else if (id === this.blockId) {
          // Only complain about root-level block.
          console.warn('Can\'t delete non-existent block: ' + id);
        }
      }
    } else {
      blocks.append(this.oldJson, workspace);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.DELETE, BlockDelete);

exports.BlockDelete = BlockDelete;
