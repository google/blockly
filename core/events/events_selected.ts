/**
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

import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a selected event.
 *
 * @alias Blockly.Events.Selected
 */
export class Selected extends UiBase {
  oldElementId?: string|null;
  newElementId?: string|null;
  override type: string;

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
    this.oldElementId = opt_oldElementId;

    /** The id of the selected element. */
    this.newElementId = opt_newElementId;

    /** Type of this event. */
    this.type = eventUtils.SELECTED;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['oldElementId'] = this.oldElementId;
    json['newElementId'] = this.newElementId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.oldElementId = json['oldElementId'];
    this.newElementId = json['newElementId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.SELECTED, Selected);
