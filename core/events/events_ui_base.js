/**
 * @fileoverview Base class for events fired as a result of UI actions in
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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Base class for events fired as a result of UI actions in
 * Blockly's editor.
 * @class
 */
import { Abstract as AbstractEvent } from './events_abstract';


/**
 * Base class for a UI event.
 * UI events are events that don't need to be sent over the wire for multi-user
 * editing to work (e.g. scrolling the workspace, zooming, opening toolbox
 * categories).
 * UI events do not undo or redo.
 * @alias Blockly.Events.UiBase
 */
export class UiBase extends AbstractEvent {
  override isBlank: boolean;
  override workspaceId: string;

  // UI events do not undo or redo.
  override recordUndo = false;

  /** Whether or not the event is a UI event. */
  override isUiEvent = true;

  /**
   * @param opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(opt_workspaceId?: string) {
    super();

    /** Whether or not the event is blank (to be populated by fromJson). */
    this.isBlank = typeof opt_workspaceId === 'undefined';

    /** The workspace identifier for this event. */
    this.workspaceId = opt_workspaceId ? opt_workspaceId : '';
  }
}
