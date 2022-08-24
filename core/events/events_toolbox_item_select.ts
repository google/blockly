/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of selecting an item on the toolbox.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.ToolboxItemSelect');

import * as registry from '../registry.js';
import {AbstractEventJson} from './events_abstract.js';
import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a toolbox item select event.
 *
 * @alias Blockly.Events.ToolboxItemSelect
 */
export class ToolboxItemSelect extends UiBase {
  oldItem: string|null;
  newItem: string|null;
  override type: string;

  /**
   * @param opt_oldItem The previously selected toolbox item.
   *     Undefined for a blank event.
   * @param opt_newItem The newly selected toolbox item. Undefined for a blank
   *     event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(
      opt_oldItem?: string|null, opt_newItem?: string|null,
      opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** The previously selected toolbox item. */
    this.oldItem = opt_oldItem || null;

    /** The newly selected toolbox item. */
    this.newItem = opt_newItem || null;

    /** Type of this event. */
    this.type = eventUtils.TOOLBOX_ITEM_SELECT;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): ToolboxItemSelectJson {
    const json = super.toJson() as ToolboxItemSelectJson;
    json['oldItem'] = this.oldItem;
    json['newItem'] = this.newItem;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: ToolboxItemSelectJson) {
    super.fromJson(json);
    this.oldItem = json['oldItem'];
    this.newItem = json['newItem'];
  }
}

export interface ToolboxItemSelectJson extends AbstractEventJson {
  oldItem: string|null;
  newItem: string|null;
}

registry.register(
    registry.Type.EVENT, eventUtils.TOOLBOX_ITEM_SELECT, ToolboxItemSelect);
