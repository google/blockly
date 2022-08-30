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
import {AbstractEventJson} from './events_abstract.js';

import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a click event.
 *
 * @alias Blockly.Events.Click
 */
export class Click extends UiBase {
  blockId?: string;
  targetType?: ClickTarget;
  override type = eventUtils.CLICK;

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
      opt_targetType?: ClickTarget) {
    let workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
    if (workspaceId === null) {
      workspaceId = undefined;
    }
    super(workspaceId);

    this.blockId = opt_block ? opt_block.id : undefined;

    /** The type of element targeted by this click event. */
    this.targetType = opt_targetType;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): ClickJson {
    const json = super.toJson() as ClickJson;
    if (!this.targetType) {
      throw new Error(
          'The click target type is undefined. Either pass a block to ' +
          'the constructor, or call fromJson');
    }
    json['targetType'] = this.targetType;
    json['blockId'] = this.blockId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: ClickJson) {
    super.fromJson(json);
    this.targetType = json['targetType'];
    this.blockId = json['blockId'];
  }
}

export enum ClickTarget {
  BLOCK = 'block',
  WORKSPACE = 'workspace',
  ZOOM_CONTROLS = 'zoom_controls',
}

export interface ClickJson extends AbstractEventJson {
  targetType: ClickTarget;
  blockId?: string;
}

registry.register(registry.Type.EVENT, eventUtils.CLICK, Click);
