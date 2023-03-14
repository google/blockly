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
import * as deprecation from '../utils/deprecation.js';
import * as registry from '../registry.js';
import * as blocks from '../serialization/blocks.js';
import * as utilsXml from '../utils/xml.js';
import * as Xml from '../xml.js';

import {BlockBase, BlockBaseJson} from './events_block_base.js';
import * as eventUtils from './utils.js';
import {Workspace} from '../workspace.js';


/**
 * Notifies listeners when a block (or connected stack of blocks) is
 * created.
 */
export class BlockCreate extends BlockBase {
  override type = eventUtils.BLOCK_CREATE;

  /** The XML representation of the created block(s). */
  xml?: Element|DocumentFragment;

  /** The JSON respresentation of the created block(s). */
  json?: blocks.State;

  /** All of the IDs of created blocks. */
  ids?: string[];

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
    deprecation.warn(
        'Blockly.Events.BlockCreate.prototype.fromJson', 'version 9',
        'version 10', 'Blockly.Events.fromJson');
    super.fromJson(json);
    this.xml = utilsXml.textToDom(json['xml']);
    this.ids = json['ids'];
    this.json = json['json'] as blocks.State;
    if (json['recordUndo'] !== undefined) {
      this.recordUndo = json['recordUndo'];
    }
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of BlockCreate, but we can't specify that due to the fact that
   *     parameters to static methods in subclasses must be supertypes of
   *     parameters to static methods in superclasses.
   * @internal
   */
  static fromJson(json: BlockCreateJson, workspace: Workspace, event?: any):
      BlockCreate {
    const newEvent =
        super.fromJson(json, workspace, event ?? new BlockCreate()) as
        BlockCreate;
    newEvent.xml = utilsXml.textToDom(json['xml']);
    newEvent.ids = json['ids'];
    newEvent.json = json['json'] as blocks.State;
    if (json['recordUndo'] !== undefined) {
      newEvent.recordUndo = json['recordUndo'];
    }
    return newEvent;
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
