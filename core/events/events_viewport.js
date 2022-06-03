/** @fileoverview Events fired as a result of a viewport change. */


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
 * Events fired as a result of a viewport change.
 * @class
 */

import * as registry from '../registry';

import { UiBase } from './events_ui_base';
import * as eventUtils from './utils';


/**
 * Class for a viewport change event.
 * @alias Blockly.Events.ViewportChange
 */
export class ViewportChange extends UiBase {
  viewTop?: number;
  viewLeft?: number;
  scale?: number;
  oldScale?: number;
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

    /** Type of this event. */
    this.type = eventUtils.VIEWPORT_CHANGE;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['viewTop'] = this.viewTop;
    json['viewLeft'] = this.viewLeft;
    json['scale'] = this.scale;
    json['oldScale'] = this.oldScale;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.viewTop = json['viewTop'];
    this.viewLeft = json['viewLeft'];
    this.scale = json['scale'];
    this.oldScale = json['oldScale'];
  }
}

registry.register(
  registry.Type.EVENT, eventUtils.VIEWPORT_CHANGE, ViewportChange);
