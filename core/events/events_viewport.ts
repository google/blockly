/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of a viewport change.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.ViewportChange');

import * as registry from '../registry.js';
import {AbstractEventJson} from './events_abstract.js';
import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a viewport change event.
 *
 * @alias Blockly.Events.ViewportChange
 */
export class ViewportChange extends UiBase {
  viewTop: number;
  viewLeft: number;
  scale: number;
  oldScale: number;
  override type: string;

  /**
   * @param opt_top Top-edge of the visible portion of the workspace, relative
   *     to the workspace origin. Undefined for a blank event.
   * @param opt_left Left-edge of the visible portion of the workspace relative
   *     to the workspace origin. Undefined for a blank event.
   * @param opt_scale The scale of the workspace. Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   * @param opt_oldScale The old scale of the workspace. Undefined for a blank
   *     event.
   */
  constructor(
      opt_top?: number, opt_left?: number, opt_scale?: number,
      opt_workspaceId?: string, opt_oldScale?: number) {
    super(opt_workspaceId);

    /**
     * Top-edge of the visible portion of the workspace, relative to the
     * workspace origin.
     */
    this.viewTop = opt_top || 0;

    /**
     * Left-edge of the visible portion of the workspace, relative to the
     * workspace origin.
     */
    this.viewLeft = opt_left || 0;

    /** The scale of the workspace. */
    this.scale = opt_scale || 0;

    /** The old scale of the workspace. */
    this.oldScale = opt_oldScale || 0;

    /** Type of this event. */
    this.type = eventUtils.VIEWPORT_CHANGE;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): ViewportChangeJson {
    const json = super.toJson() as ViewportChangeJson;
    json['viewTop'] = this.viewTop;
    json['viewLeft'] = this.viewLeft;
    json['scale'] = this.scale;
    json['oldScale'] = this.oldScale;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: ViewportChangeJson) {
    super.fromJson(json);
    this.viewTop = json['viewTop'];
    this.viewLeft = json['viewLeft'];
    this.scale = json['scale'];
    this.oldScale = json['oldScale'];
  }
}

export interface ViewportChangeJson extends AbstractEventJson {
  viewTop: number;
  viewLeft: number;
  scale: number;
  oldScale: number;
}

registry.register(
    registry.Type.EVENT, eventUtils.VIEWPORT_CHANGE, ViewportChange);
