/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Class for a loading error workspace event.
 */

/**
 * Class for a loading workspace error event.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.LoadingError

import {
  Abstract as AbstractEvent,
  AbstractEventJson,
} from './events_abstract.js';
import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {Workspace} from '../workspace.js';
import {Msg} from '../msg.js';

/**
 * Class for a loading error event.
 * Used to notify the developer when the workspace has loading error (i.e
 * domToWorkspace).
 * Loading error events do not record undo or redo.
 *
 * @augments {Abstract}
 * @alias Blockly.Events.LoadingError
 */
export class LoadingError extends AbstractEvent {
  override isBlank = true;

  workspaceId?: string = undefined;
  errorMessage: string;
  recordUndo: boolean;
  type: string;

  /**
   * @param {!Workspace=} workspace The workspace that has error
   *    loading.  Undefined for a blank event.
   * @param {string} errorMessage The workspace that has error
   *    loading.  Undefined for a blank event.
   */
  constructor(workspace: Workspace, errorMessage: string) {
    super();
    /**
     * Whether the event is blank (to be populated by fromJson).
     *
     * @type {boolean}
     */
    this.isBlank = typeof workspace === 'undefined';

    /**
     * The workspace identifier for this event.
     *
     * @type {string}
     */
    this.workspaceId = workspace ? workspace.id : '';

    this.errorMessage = `${Msg['LOADING_ERROR']}. ${errorMessage}`;
    /**
     * The event group ID for the group this event belongs to. Groups define
     * events that should be treated as a single action from the user's
     * perspective, and should be undone together.
     *
     * @type {string}
     */
    this.group = eventUtils.getGroup();

    // Workspace events do not undo or redo.
    this.recordUndo = false;

    /**
     * Type of this event.
     *
     * @type {string}
     */
    this.type = eventUtils.LOADING_ERROR;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  override toJson() {
    const json = super.toJson() as LoadingErrorJson;
    json['type'] = this.type;

    if (this.group) {
      json['group'] = this.group;
    }
    if (this.workspaceId) {
      json['workspaceId'] = this.workspaceId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param {!object} json JSON representation.
   * @param workspace
   * @param errorMessage
   */
  static fromJson(
    json: LoadingErrorJson,
    workspace: Workspace,
    errorMessage: string,
  ): LoadingError {
    return super.fromJson(
      json,
      workspace,
      event ?? new LoadingError(workspace, errorMessage),
    ) as LoadingError;
  }
}

export interface LoadingErrorJson extends AbstractEventJson {
  workspaceId: string;
}

registry.register(registry.Type.EVENT, eventUtils.LOADING_ERROR, LoadingError);
