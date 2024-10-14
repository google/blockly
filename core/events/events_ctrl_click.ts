/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Events fired as a result of UI click with pressed in Blockly's editor.
 */

/**
 * Events fired as a result of UI click with pressed Ctrl in Blockly's editor.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.CtrlClick

import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import type {Block} from '../block.js';
import {UiBase} from './events_ui_base.js';
import {Workspace} from '../workspace.js';
import {AbstractEventJson} from './events_abstract.js';

/**
 * Class for a ctrl+click event.
 */
export class CtrlClick extends UiBase {
  /** The ID of the block that was clicked, if a block was clicked. */
  blockId?: string;

  /**
   * The type of element targeted by this ctrl+click event.
   */
  targetType?: CtrlClickTarget;
  override type = eventUtils.CTRL_CLICK;

  constructor(
    opt_block?: Block | null,
    opt_workspaceId?: string | null,
    opt_targetType?: CtrlClickTarget,
  ) {
    let workspaceId = opt_block ? opt_block.workspace.id : opt_workspaceId;
    if (workspaceId === null) {
      workspaceId = undefined;
    }
    super(workspaceId);

    this.blockId = opt_block ? opt_block.id : undefined;
    this.targetType = opt_targetType;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): CtrlClickJson {
    const json = super.toJson() as CtrlClickJson;
    if (!this.targetType) {
      throw new Error(
        'The click target type is undefined. Either pass a block to ' +
          'the constructor, or call fromJson',
      );
    }
    json['targetType'] = this.targetType;
    json['blockId'] = this.blockId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param {!object} json JSON representation.
   */
  static fromJson(
    json: CtrlClickJson,
    workspace: Workspace,
    event?: any,
  ): CtrlClick {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new CtrlClick(),
    ) as CtrlClick;
    newEvent.targetType = json['targetType'];
    newEvent.blockId = json['blockId'];
    return newEvent;
  }
}

export enum CtrlClickTarget {
  BLOCK = 'block',
  WORKSPACE = 'workspace',
  ZOOM_CONTROLS = 'zoom_controls',
}

export interface CtrlClickJson extends AbstractEventJson {
  targetType: CtrlClickTarget;
  blockId?: string;
}

registry.register(registry.Type.EVENT, eventUtils.CTRL_CLICK, CtrlClick);
