/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Events fired as a result of UI click in Blockly's editor.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.Click');

import type {Block} from '../block.js';
import * as registry from '../registry.js';

import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a click event.
 *
 * @alias Blockly.Events.Click
 */
export class Click extends UiBase {
  blockId: AnyDuringMigration;
  targetType?: string;
  override type: string;

  /**
   * @param opt_block The affected block. Null for click events that do not have
   *     an associated block (i.e. workspace click). Undefined for a blank
   *     event.
   * @param opt_workspaceId The workspace identifier for this event.
   *    Not used if block is passed. Undefined for a blank event.
   * @param opt_targetType The type of element targeted by this click event.
   *     Undefined for a blank event.
   */
  constructor(
      opt_block?: Block|null, opt_workspaceId?: string|null,
      opt_targetType?: string) {
    let workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
    if (workspaceId === null) {
      workspaceId = undefined;
    }
    super(workspaceId);
    this.blockId = opt_block ? opt_block.id : null;

    /** The type of element targeted by this click event. */
    this.targetType = opt_targetType;

    /** Type of this event. */
    this.type = eventUtils.CLICK;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['targetType'] = this.targetType;
    if (this.blockId) {
      json['blockId'] = this.blockId;
    }
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.targetType = json['targetType'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.CLICK, Click);
