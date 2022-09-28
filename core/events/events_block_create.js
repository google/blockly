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
const registry = goog.require('Blockly.registry');
const {BlockBase} = goog.require('Blockly.Events.BlockBase');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * Class for a block creation event.
 * @extends {BlockBase}
 * @alias Blockly.Events.BlockCreate
 */
class BlockCreate extends BlockBase {
  /**
   * @param {!Block=} opt_block The created block.  Undefined for a blank
   *     event.
   */
  constructor(opt_block) {
    super(opt_block);

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.BLOCK_CREATE;

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
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['xml'] = Xml.domToText(this.xml);
    json['ids'] = this.ids;
    json['json'] = this.json;
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
    this.xml = Xml.textToDom(json['xml']);
    this.ids = json['ids'];
    this.json = /** @type {!blocks.State} */ (json['json']);
    if (json['recordUndo'] !== undefined) {
      this.recordUndo = json['recordUndo'];
    }
  }

  /**
   * Run a creation event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
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
  }
}

registry.register(registry.Type.EVENT, eventUtils.CREATE, BlockCreate);

exports.BlockCreate = BlockCreate;
