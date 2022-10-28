/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Abstract class for events fired as a result of actions in
 * Blockly's editor.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.Abstract');

import * as common from '../common.js';
import type {Workspace} from '../workspace.js';

import * as eventUtils from './utils.js';


/**
 * Abstract class for an event.
 *
 * @alias Blockly.Events.Abstract
 */
export abstract class Abstract {
  /** Whether or not the event is blank (to be populated by fromJson). */
  abstract isBlank: boolean;

  /** The workspace identifier for this event. */
  workspaceId?: string = undefined;
  group: string;
  recordUndo: boolean;

  /** Whether or not the event is a UI event. */
  isUiEvent = false;

  /** Type of this event. */
  type = '';

  /** @alias Blockly.Events.Abstract */
  constructor() {
    /**
     * The event group ID for the group this event belongs to. Groups define
     * events that should be treated as an single action from the user's
     * perspective, and should be undone together.
     */
    this.group = eventUtils.getGroup();

    /** Sets whether the event should be added to the undo stack. */
    this.recordUndo = eventUtils.getRecordUndo();
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): AbstractEventJson {
    return {
      'type': this.type,
      'group': this.group,
    };
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  fromJson(json: AbstractEventJson) {
    this.isBlank = false;
    this.group = json['group'] || '';
  }

  /**
   * Does this event record any change of state?
   *
   * @returns True if null, false if something changed.
   */
  isNull(): boolean {
    return false;
  }

  /**
   * Run an event.
   *
   * @param _forward True if run forward, false if run backward (undo).
   */
  run(_forward: boolean) {}
  // Defined by subclasses.

  /**
   * Get workspace the event belongs to.
   *
   * @returns The workspace the event belongs to.
   * @throws {Error} if workspace is null.
   * @internal
   */
  getEventWorkspace_(): Workspace {
    let workspace;
    if (this.workspaceId) {
      workspace = common.getWorkspaceById(this.workspaceId);
    }
    if (!workspace) {
      throw Error(
          'Workspace is null. Event must have been generated from real' +
          ' Blockly events.');
    }
    return workspace;
  }
}

export interface AbstractEventJson {
  type: string;
  group: string;
}
