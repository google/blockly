/**
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

import {BlockBase} from './events_block_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a block creation event.
 *
 * @alias Blockly.Events.BlockCreate
 */
export class BlockCreate extends BlockBase {
  override type: string;
  xml: AnyDuringMigration;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  ids!: string[];
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  json!: blocks.State;

  /** @param opt_block The created block.  Undefined for a blank event. */
  constructor(opt_block?: Block) {
    super(opt_block);

    /** Type of this event. */
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

    /** JSON representation of the block that was just created. */
    this.json = blocks.save(opt_block, {addCoordinates: true}) as blocks.State;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
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
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
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
