/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of a viewport change.
 */
'use strict';

/**
 * Events fired as a result of a viewport change.
 * @class
 */
goog.module('Blockly.Events.ViewportChange');

const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {UiBase} = goog.require('Blockly.Events.UiBase');


/**
 * Class for a viewport change event.
 * @extends {UiBase}
 * @alias Blockly.Events.ViewportChange
 */
class ViewportChange extends UiBase {
  /**
   * @param {number=} opt_top Top-edge of the visible portion of the workspace,
   *    relative to the workspace origin. Undefined for a blank event.
   * @param {number=} opt_left Left-edge of the visible portion of the
   *     workspace relative to the workspace origin. Undefined for a blank
   *     event.
   * @param {number=} opt_scale The scale of the workspace. Undefined for a
   *     blank event.
   * @param {string=} opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   * @param {number=} opt_oldScale The old scale of the workspace. Undefined for
   *     a blank event.
   */
  constructor(opt_top, opt_left, opt_scale, opt_workspaceId, opt_oldScale) {
    super(opt_workspaceId);

    /**
     * Top-edge of the visible portion of the workspace, relative to the
     * workspace origin.
     * @type {number|undefined}
     */
    this.viewTop = opt_top;

    /**
     * Left-edge of the visible portion of the workspace, relative to the
     * workspace origin.
     * @type {number|undefined}
     */
    this.viewLeft = opt_left;

    /**
     * The scale of the workspace.
     * @type {number|undefined}
     */
    this.scale = opt_scale;

    /**
     * The old scale of the workspace.
     * @type {number|undefined}
     */
    this.oldScale = opt_oldScale;

    /**
     * Type of this event.
     * @type {string}
     */
    this.type = eventUtils.VIEWPORT_CHANGE;
  }

  /**
   * Encode the event as JSON.
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
    json['viewTop'] = this.viewTop;
    json['viewLeft'] = this.viewLeft;
    json['scale'] = this.scale;
    json['oldScale'] = this.oldScale;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.viewTop = json['viewTop'];
    this.viewLeft = json['viewLeft'];
    this.scale = json['scale'];
    this.oldScale = json['oldScale'];
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.VIEWPORT_CHANGE, ViewportChange);

exports.ViewportChange = ViewportChange;
