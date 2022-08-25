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

import {Abstract as AbstractEvent} from './events_abstract.js';
import * as eventUtils from './utils.js';


/**
 * Class for a finished loading event.
 * Used to notify the developer when the workspace has finished loading (i.e
 * domToWorkspace).
 * Finished loading events do not record undo or redo.
 *
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
   *
   * @returns JSON representation.
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
   *
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
