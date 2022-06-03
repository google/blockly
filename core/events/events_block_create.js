/** @fileoverview Class for a block creation event. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Class for a block creation event.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Block } from '../block';
import * as registry from '../registry';
import * as blocks from '../serialization/blocks';
import * as Xml from '../xml';

import { BlockBase } from './events_block_base';
import * as eventUtils from './utils';


/**
 * Class for a block creation event.
 * @alias Blockly.Events.BlockCreate
 */
export class BlockCreate extends BlockBase {
  override type: string;
  // Moving shadow blocks is handled via disconnection.
  override recordUndo = false;
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
      return;
    }
    // Blank event to be populated by fromJson.
    if (opt_block.isShadow()) {
    }

    this.xml = Xml.blockToDomWithXY(opt_block);
    this.ids = eventUtils.getDescendantIds(opt_block);

    /** JSON representation of the block that was just created. */
    this.json = blocks.save(opt_block, { addCoordinates: true }) as blocks.State;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
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
