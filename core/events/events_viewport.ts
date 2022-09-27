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
  viewTop?: number;
  viewLeft?: number;
  scale?: number;
  oldScale?: number;
  override type = eventUtils.VIEWPORT_CHANGE;

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
    this.viewTop = opt_top;

    /**
     * Left-edge of the visible portion of the workspace, relative to the
     * workspace origin.
     */
    this.viewLeft = opt_left;

    /** The scale of the workspace. */
    this.scale = opt_scale;

    /** The old scale of the workspace. */
    this.oldScale = opt_oldScale;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): ViewportChangeJson {
    const json = super.toJson() as ViewportChangeJson;
    if (this.viewTop === undefined) {
      throw new Error(
          'The view top is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
    if (this.viewLeft === undefined) {
      throw new Error(
          'The view left is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
    if (this.scale === undefined) {
      throw new Error(
          'The scale is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
    if (this.oldScale === undefined) {
      throw new Error(
          'The old scale is undefined. Either pass a value to ' +
          'the constructor, or call fromJson');
    }
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
