/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of trashcan flyout open and close.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.TrashcanOpen');

import * as registry from '../registry.js';
import {AbstractEventJson} from './events_abstract.js';

import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a trashcan open event.
 *
 * @alias Blockly.Events.TrashcanOpen
 */
export class TrashcanOpen extends UiBase {
  isOpen?: boolean;
  override type = eventUtils.TRASHCAN_OPEN;

  /**
   * @param opt_isOpen Whether the trashcan flyout is opening (false if
   *     opening). Undefined for a blank event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Undefined for a blank event.
   */
  constructor(opt_isOpen?: boolean, opt_workspaceId?: string) {
    super(opt_workspaceId);

    /** Whether the trashcan flyout is opening (false if closing). */
    this.isOpen = opt_isOpen;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): TrashcanOpenJson {
    const json = super.toJson() as TrashcanOpenJson;
    if (this.isOpen === undefined) {
      throw new Error(
          'Whether this is already open or not is undefined. Either pass ' +
          'a value to the constructor, or call fromJson');
    }
    json['isOpen'] = this.isOpen;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: TrashcanOpenJson) {
    super.fromJson(json);
    this.isOpen = json['isOpen'];
  }
}

export interface TrashcanOpenJson extends AbstractEventJson {
  isOpen: boolean;
}

registry.register(registry.Type.EVENT, eventUtils.TRASHCAN_OPEN, TrashcanOpen);
