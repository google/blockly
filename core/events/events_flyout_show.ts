/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Events fired as a result of showing flyout
 */

/**
 * Events fired as a result of showing flyout
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.FlyoutShow

import {Abstract as AbstractEvent} from './events_abstract.js';
import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';

/**
 * Class for a flyout show event.
 */
export class FlyoutShow extends AbstractEvent {
  override isBlank = true;

  workspaceId?: string = undefined;
  recordUndo: boolean;
  type: string;

  /**
   * @param {!workspaceId} workspaceId workspaceId
   */
  constructor(workspaceId: string) {
    super();

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
    this.type = eventUtils.FLYOUT_SHOW;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns {!object} JSON representation.
   */
  toJson() {
    return super.toJson();
  }

  /**
   * Decode the JSON event.
   */
  fromJson() {}
}

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_SHOW, FlyoutShow);
