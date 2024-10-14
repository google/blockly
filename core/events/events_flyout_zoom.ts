/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Events fired as a result of zooming flyout
 */

/**
 * Events fired as a result of zooming flyout
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.FlyoutZoom

import {Abstract as AbstractEvent} from './events_abstract.js';
import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';

/**
 * Class for a flyout zoom event.
 */
export class FlyoutZoom extends AbstractEvent {
  override isBlank = true;

  workspaceId?: string = undefined;
  recordUndo: boolean;
  type: string;
  scale: number;

  /**
   * @param {!number} workspaceId flyout workspace id
   * @param {number} scale of flyout workspace
   */
  constructor(workspaceId: string, scale: number) {
    super();

    /**
     * The workspace identifier for this event.
     *
     * @type {string}
     */
    this.workspaceId = workspaceId;
    this.scale = scale;
    this.recordUndo = false;

    /**
     * Type of this event.
     *
     * @type {string}
     */
    this.type = eventUtils.FLYOUT_ZOOM;
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
   *
   */
  fromJson() {}
}

registry.register(registry.Type.EVENT, eventUtils.FLYOUT_ZOOM, FlyoutZoom);
