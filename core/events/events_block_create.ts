/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a block creation event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BlockCreate');

import type {Block} from '../block.js';
import * as registry from '../registry.js';
import * as blocks from '../serialization/blocks.js';
import * as Xml from '../xml.js';

import {BlockBase, BlockBaseJson} from './events_block_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a block creation event.
 *
 * @alias Blockly.Events.BlockCreate
 */
export class BlockCreate extends BlockBase {
  override type = eventUtils.BLOCK_CREATE;
  xml?: Element|DocumentFragment;
  ids?: string[];
  json?: blocks.State;

  /** @param opt_block The created block.  Undefined for a blank event. */
  constructor(opt_block?: Block) {
    super(opt_block);

    if (!opt_block) {
      return;  // Blank event to be populated by fromJson.
    }

    if (opt_block.isShadow()) {
      // Moving shadow blocks is handled via disconnection.
      this.recordUndo = false;
    }

    this.xml = Xml.blockToDomWithXY(opt_block);
    this.ids = eventUtils.getDescendantIds(opt_block);

    /** JSON representation of the block that was just created. */
    this.json = blocks.save(opt_block, {addCoordinates: true}) as blocks.State;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): BlockCreateJson {
    const json = super.toJson() as BlockCreateJson;
    if (!this.xml) {
      throw new Error(
          'The block XML is undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
    if (!this.ids) {
      throw new Error(
          'The block IDs are undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
    if (!this.json) {
      throw new Error(
          'The block JSON is undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
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
   *
   * @param json JSON representation.
   */
  override fromJson(json: BlockCreateJson) {
    super.fromJson(json);
    this.xml = Xml.textToDom(json['xml']);
    this.ids = json['ids'];
    this.json = json['json'] as blocks.State;
    if (json['recordUndo'] !== undefined) {
      this.recordUndo = json['recordUndo'];
    }
  }

  /**
   * Run a creation event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.json) {
      throw new Error(
          'The block JSON is undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
    if (!this.ids) {
      throw new Error(
          'The block IDs are undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
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

export interface BlockCreateJson extends BlockBaseJson {
  xml: string;
  ids: string[];
  json: object;
  recordUndo?: boolean;
}

registry.register(registry.Type.EVENT, eventUtils.CREATE, BlockCreate);
