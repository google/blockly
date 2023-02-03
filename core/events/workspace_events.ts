/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a finished loading workspace event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.FinishedLoading');

import * as registry from '../registry.js';
import type {Workspace} from '../workspace.js';
import {Abstract as AbstractEvent, AbstractEventJson} from './events_abstract.js';
import * as eventUtils from './utils.js';


/**
 * Notifies listeners when the workspace has finished deserializing from
 * JSON/XML.
 */
export class FinishedLoading extends AbstractEvent {
  override isBlank = true;
  override recordUndo = false;
  override type = eventUtils.FINISHED_LOADING;

  /**
   * @param opt_workspace The workspace that has finished loading.  Undefined
   *     for a blank event.
   */
  constructor(opt_workspace?: Workspace) {
    super();
    this.isBlank = !!opt_workspace;

    if (!opt_workspace) return;

    this.workspaceId = opt_workspace.id;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): FinishedLoadingJson {
    const json = super.toJson() as FinishedLoadingJson;
    if (!this.workspaceId) {
      throw new Error(
          'The workspace ID is undefined. Either pass a workspace to ' +
          'the constructor, or call fromJson');
    }
    json['workspaceId'] = this.workspaceId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: FinishedLoadingJson) {
    super.fromJson(json);
    this.workspaceId = json['workspaceId'];
  }
}

export interface FinishedLoadingJson extends AbstractEventJson {
  workspaceId: string;
}

registry.register(
    registry.Type.EVENT, eventUtils.FINISHED_LOADING, FinishedLoading);
