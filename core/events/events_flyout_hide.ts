/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Events fired as a result of hide flyout
 */

/**
 * Events fired as a result of hide flyout
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.FlyoutHide

import {
  Abstract as AbstractEvent,
  AbstractEventJson,
} from './events_abstract.js';
import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import {Workspace} from '../workspace.js';

/**
 * Class for a flyout hide event.
 */
export class FlyoutHide extends AbstractEvent {
  override isBlank = true;

  workspaceId?: string = undefined;
  isButtonClose: boolean;
  recordUndo: boolean;
  type: string;

  /**
   * @param {!workspaceId} workspaceId workspaceId
   * @param {opt_isButtonClose} opt_isButtonClose isButtonClose
   *     event.
   */
  constructor(workspaceId: string, opt_isButtonClose?: boolean) {
    super();
    this.isButtonClose =
      typeof opt_isButtonClose === 'undefined' ? false : opt_isButtonClose;

    /**
     * The workspace identifier for this event.
     *
     * @type {string}
     */
    this.workspaceId = workspaceId;

    this.recordUndo = false;

    /**
     * Type of this event.
     *
     * @type {string}
     */
    this.type = eventUtils.FLYOUT_HIDE;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  override toJson() {
    const json = super.toJson() as FlyoutHideJson;
    json['isButtonClose'] = this.isButtonClose;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param {!object} json JSON representation.
   * @param {!workspace} workspace JSON representation.
   */
  static fromJson(json: FlyoutHideJson, workspace: Workspace): FlyoutHide {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new FlyoutHide(workspace.id),
    ) as FlyoutHide;
    newEvent.isButtonClose = json['isButtonClose'];
    return newEvent;
  }
}

export interface FlyoutHideJson extends AbstractEventJson {
  isButtonClose: boolean;
}

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_HIDE, FlyoutHide);
