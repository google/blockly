/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for an event representing an intermediate change to a block's field's
 * value.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BlockFieldIntermediateChange');

import type {Block} from '../block.js';
import type {BlockSvg} from '../block_svg.js';
import * as registry from '../registry.js';
import * as utilsXml from '../utils/xml.js';
import {Workspace} from '../workspace.js';
import * as Xml from '../xml.js';

import {AbstractEventJson} from './events_abstract.js';
import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';

/**
 * Notifies listeners when the value of a block's field has changed but the
 * change is not yet complete, and is expected to be followed by a block change
 * event.
 */
export class BlockFieldIntermediateChange extends UiBase {
  override type = eventUtils.BLOCK_FIELD_INTERMEDIATE_CHANGE;

  /** The ID of the block associated with this event. */
  blockId?: string;

  /** The name of the field that changed. */
  name?: string;

  /** The original value of the element. */
  oldValue: unknown;

  /** The new value of the element. */
  newValue: unknown;

  /**
   * @param opt_block The changed block. Undefined for a blank event.
   * @param opt_name Name of the field affected.
   * @param opt_oldValue Previous value of element.
   * @param opt_newValue New value of element.
   */
  constructor(
    opt_block?: Block,
    opt_name?: string,
    opt_oldValue?: unknown,
    opt_newValue?: unknown
  ) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);
    if (!opt_block) {
      return; // Blank event to be populated by fromJson.
    }
    
    this.blockId = opt_block.id;
    this.name = opt_name;
    this.oldValue = opt_oldValue;
    this.newValue = opt_newValue;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): BlockFieldIntermediateChangeJson {
    const json = super.toJson() as BlockFieldIntermediateChangeJson;
    if (!this.blockId) {
      throw new Error(
        'The block ID is undefined. Either pass a block to ' +
          'the constructor, or call fromJson.'
      );
    }
    if (!this.name) {
      throw new Error(
        'The changed field name is undefined. Either pass a ' +
          'name to the constructor, or call fromJson.'
      );
    }
    json['blockId'] = this.blockId;
    json['name'] = this.name;
    json['oldValue'] = this.oldValue;
    json['newValue'] = this.newValue;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of BlockFieldIntermediateChange, but we can't specify that due to the
   *     fact that parameters to static methods in subclasses must be supertypes
   *     of parameters to static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: BlockFieldIntermediateChangeJson,
    workspace: Workspace,
    event?: any
  ): BlockFieldIntermediateChange {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new BlockFieldIntermediateChange()
    ) as BlockFieldIntermediateChange;
    newEvent.blockId = json['blockId'];
    newEvent.name = json['name'];
    newEvent.oldValue = json['oldValue'];
    newEvent.newValue = json['newValue'];
    return newEvent;
  }

  /**
   * Does this event record any change of state?
   *
   * @returns False if something changed.
   */
  override isNull(): boolean {
    return this.oldValue === this.newValue;
  }
}

export interface BlockFieldIntermediateChangeJson extends AbstractEventJson {
  blockId: string;
  name: string;
  newValue: unknown;
  oldValue: unknown;
}

registry.register(
    registry.Type.EVENT,
    eventUtils.BLOCK_FIELD_INTERMEDIATE_CHANGE,
    BlockFieldIntermediateChange);
