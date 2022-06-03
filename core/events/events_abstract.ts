/**
 * @fileoverview Abstract class for events fired as a result of actions in
 * Blockly's editor.
 */


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
 * Abstract class for events fired as a result of actions in
 * Blockly's editor.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { Workspace } from '../workspace';

import * as eventUtils from './utils';


/**
 * Abstract class for an event.
 * @alias Blockly.Events.Abstract
 */
export abstract class Abstract {
  /** Whether or not the event is blank (to be populated by fromJson). */
  isBlank: boolean | null = null;

  /** The workspace identifier for this event. */
  workspaceId?: string = undefined;
  group: string;
  recordUndo: boolean;

  /** Whether or not the event is a UI event. */
  isUiEvent = false;

  /** Type of this event. */
  type?: string = undefined;

  /** @alias Blockly.Events.Abstract */
  constructor() {
    /**
     * The event group id for the group this event belongs to. Groups define
     * events that should be treated as an single action from the user's
     * perspective, and should be undone together.
     */
    this.group = eventUtils.getGroup();

    /** Sets whether the event should be added to the undo stack. */
    this.recordUndo = eventUtils.getRecordUndo();
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  toJson(): AnyDuringMigration {
    const json = { 'type': this.type };
    if (this.group) {
      (json as AnyDuringMigration)['group'] = this.group;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  fromJson(json: AnyDuringMigration) {
    this.isBlank = false;
    this.group = json['group'];
  }

  /**
   * Does this event record any change of state?
   * @return True if null, false if something changed.
   */
  isNull(): boolean {
    return false;
  }

  /**
   * Run an event.
   * @param _forward True if run forward, false if run backward (undo).
   */
  run(_forward: boolean) {}
  // Defined by subclasses.

  /**
   * Get workspace the event belongs to.
   * @return The workspace the event belongs to.
   * @throws {Error} if workspace is null.
   */
  protected getEventWorkspace_(): Workspace {
    let workspace;
    if (this.workspaceId) {
      // AnyDuringMigration because:  Property 'get' does not exist on type
      // '(name: string) => void'.
      const { Workspace } =
        (goog.module as AnyDuringMigration).get('Blockly.Workspace');
      workspace = Workspace.getById(this.workspaceId);
    }
    if (!workspace) {
      throw Error(
        'Workspace is null. Event must have been generated from real' +
        ' Blockly events.');
    }
    return workspace;
  }
}
