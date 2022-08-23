/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a block delete event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BlockDelete');

import type {Block} from '../block.js';
import * as registry from '../registry.js';
import * as blocks from '../serialization/blocks.js';
import * as Xml from '../xml.js';

import {BlockBase} from './events_block_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a block deletion event.
 *
 * @alias Blockly.Events.BlockDelete
 */
export class BlockDelete extends BlockBase {
  override type: string;
  oldXml: AnyDuringMigration;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  ids!: string[];
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  wasShadow!: boolean;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldJson!: blocks.State;

  /** @param opt_block The deleted block.  Undefined for a blank event. */
  constructor(opt_block?: Block) {
    super(opt_block);

    /** Type of this event. */
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

    /** Was the block that was just deleted a shadow? */
    this.wasShadow = opt_block.isShadow();

    /** JSON representation of the block that was just deleted. */
    this.oldJson =
        blocks.save(opt_block, {addCoordinates: true}) as blocks.State;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
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
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.oldXml = Xml.textToDom(json['oldXml']);
    this.ids = json['ids'];
    this.wasShadow =
        json['wasShadow'] || this.oldXml.tagName.toLowerCase() === 'shadow';
    this.oldJson = json['oldJson'] as blocks.State;
    if (json['recordUndo'] !== undefined) {
      this.recordUndo = json['recordUndo'];
    }
  }

  /**
   * Run a deletion event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
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
