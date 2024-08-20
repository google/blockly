/**
 * @license
 * Copyright 2018 Google LLC
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
 * @file Class for event of move block to a module.
 * @author dev@varwin.com (Varwin Developers)
 */
// Former goog.module ID: Blockly.Events.MoveBlockToModule

import {
  Abstract as AbstractEvent,
  AbstractEventJson,
} from './events_abstract.js';
import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {Workspace} from '../workspace.js';
import {BlockChangeJson} from './events_block_change.js';
import {Block} from '../block.js';
import {BlockSvg} from '../block_svg';

/**
 * Class for a move block to module event.
 *
 * @augments {Abstract}
 */
export class MoveBlockToModule extends AbstractEvent {
  override isBlank = true;

  blockId: string = '';
  workspaceId: string = '';
  newModuleId?: string = '';
  previousModuleId?: string = '';

  /**
   * @param {Block} block The moved block.
   *     Null for a blank event.
   * @param {string} newModuleId The new module id.
   * @param {string} previousModuleId The previous module id.
   */
  constructor(block?: Block, newModuleId?: string, previousModuleId?: string) {
    if (!block) {
      return;
    }
    super();

    this.workspaceId = block.workspace.id;
    this.blockId = block.id;
    this.newModuleId = newModuleId;
    this.previousModuleId = previousModuleId;

    /**
     * Type of this event.
     *
     * @type {string}
     */
    this.type = eventUtils.MOVE_BLOCK_TO_MODULE;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    // @ts-ignore:next-line
    json['blockId'] = this.blockId;
    // @ts-ignore:next-line
    json['newModuleId'] = this.newModuleId;
    // @ts-ignore:next-line
    json['previousModuleId'] = this.previousModuleId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param {!object} json JSON representation.
   * @param workspace
   * @param event
   */
  static fromJson(
    json: BlockChangeJson,
    workspace: Workspace,
    event?: any,
  ): MoveBlockToModule {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new MoveBlockToModule(),
    ) as MoveBlockToModule;
    // @ts-ignore:next-line
    newEvent.blockId = json['blockId'];
    // @ts-ignore:next-line
    newEvent.newModuleId = json['newModuleId'];
    // @ts-ignore:next-line
    newEvent.previousModuleId = json['previousModuleId'];
    return newEvent;
  }

  /**
   * Run a module move event.
   *
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward: boolean) {
    const moduleManager = this.getEventWorkspace_().getModuleManager();
    const newModule = moduleManager.getModuleById(this.newModuleId!);
    const previousModule = moduleManager.getModuleById(this.previousModuleId!);
    const block = this.getEventWorkspace_().getBlockById(
      this.blockId,
    ) as BlockSvg;

    if (!block) {
      return;
    }

    if (forward) {
      moduleManager.moveBlockToModule(block!, newModule!);
    } else {
      moduleManager.moveBlockToModule(block!, previousModule!);
    }
  }
}

export interface MoveBlockToModuleJson extends AbstractEventJson {
  blockId: string;
  newModuleId: string;
  previousModuleId: string;
}

registry.register(
  registry.Type.EVENT,
  eventUtils.MOVE_BLOCK_TO_MODULE,
  MoveBlockToModule,
);
