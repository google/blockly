/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of element select action.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.Selected');

import * as registry from '../registry.js';
import {AbstractEventJson} from './events_abstract.js';

import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a selected event.
 *
 * @alias Blockly.Events.Selected
 */
export class Selected extends UiBase {
  oldElementId?: string;
  newElementId?: string;
  override type = eventUtils.SELECTED;

  /**
   * @param opt_oldElementId The ID of the previously selected element. Null if
   *     no element last selected. Undefined for a blank event.
   * @param opt_newElementId The ID of the selected element. Null if no element
   *     currently selected (deselect). Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Null if no element previously selected. Undefined for a blank event.
   */
  constructor(
      opt_oldElementId?: string|null, opt_newElementId?: string|null,
      opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** The id of the last selected element. */
    this.oldElementId = opt_oldElementId ?? undefined;

    /** The id of the selected element. */
    this.newElementId = opt_newElementId ?? undefined;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): SelectedJson {
    const json = super.toJson() as SelectedJson;
    json['oldElementId'] = this.oldElementId;
    json['newElementId'] = this.newElementId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: SelectedJson) {
    super.fromJson(json);
    this.oldElementId = json['oldElementId'];
    this.newElementId = json['newElementId'];
  }
}

export interface SelectedJson extends AbstractEventJson {
  oldElementId?: string;
  newElementId?: string;
}

registry.register(registry.Type.EVENT, eventUtils.SELECTED, Selected);
