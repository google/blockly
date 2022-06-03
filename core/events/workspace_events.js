/** @fileoverview Class for a finished loading workspace event. */


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
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Class for a finished loading workspace event.
 * @class
 */

import * as registry from '../registry';
/* eslint-disable-next-line no-unused-vars */
import { Workspace } from '../workspace';

import { Abstract as AbstractEvent } from './events_abstract';
import * as eventUtils from './utils';


/**
 * Class for a finished loading event.
 * Used to notify the developer when the workspace has finished loading (i.e
 * domToWorkspace).
 * Finished loading events do not record undo or redo.
 * @alias Blockly.Events.FinishedLoading
 */
export class FinishedLoading extends AbstractEvent {
  override isBlank: boolean;
  override workspaceId: string;

  // Workspace events do not undo or redo.
  override recordUndo = false;
  override type: string;
  override group: AnyDuringMigration;

  /**
   * @param opt_workspace The workspace that has finished loading.  Undefined
   *     for a blank event.
   */
  constructor(opt_workspace?: Workspace) {
    super();
    /** Whether or not the event is blank (to be populated by fromJson). */
    this.isBlank = typeof opt_workspace === 'undefined';

    /** The workspace identifier for this event. */
    this.workspaceId = opt_workspace ? opt_workspace.id : '';

    /** Type of this event. */
    this.type = eventUtils.FINISHED_LOADING;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = {
      'type': this.type,
    };
    if (this.group) {
      (json as AnyDuringMigration)['group'] = this.group;
    }
    if (this.workspaceId) {
      (json as AnyDuringMigration)['workspaceId'] = this.workspaceId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    this.isBlank = false;
    this.workspaceId = json['workspaceId'];
    this.group = json['group'];
  }
}

registry.register(
  registry.Type.EVENT, eventUtils.FINISHED_LOADING, FinishedLoading);
