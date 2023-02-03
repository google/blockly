/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * (Deprecated) Events fired as a result of UI actions in
 * Blockly's editor.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.Ui');

import type {Block} from '../block.js';
import * as registry from '../registry.js';
import {UiBase} from './events_ui_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a UI event.
 *
 * @deprecated December 2020. Instead use a more specific UI event.
 */
export class Ui extends UiBase {
  blockId: AnyDuringMigration;
  element: AnyDuringMigration;
  oldValue: AnyDuringMigration;
  newValue: AnyDuringMigration;
  override type = eventUtils.UI;

  /**
   * @param opt_block The affected block.  Null for UI events that do not have
   *     an associated block.  Undefined for a blank event.
   * @param opt_element One of 'selected', 'comment', 'mutatorOpen', etc.
   * @param opt_oldValue Previous value of element.
   * @param opt_newValue New value of element.
   */
  constructor(
      opt_block?: Block|null, opt_element?: string,
      opt_oldValue?: AnyDuringMigration, opt_newValue?: AnyDuringMigration) {
    const workspaceId = opt_block ? opt_block.workspace.id : undefined;
    super(workspaceId);

    this.blockId = opt_block ? opt_block.id : null;
    this.element = typeof opt_element === 'undefined' ? '' : opt_element;
    this.oldValue = typeof opt_oldValue === 'undefined' ? '' : opt_oldValue;
    this.newValue = typeof opt_newValue === 'undefined' ? '' : opt_newValue;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson() as AnyDuringMigration;
    json['element'] = this.element;
    if (this.newValue !== undefined) {
      json['newValue'] = this.newValue;
    }
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
    this.element = json['element'];
    this.newValue = json['newValue'];
    this.blockId = json['blockId'];
  }
}

registry.register(registry.Type.EVENT, eventUtils.UI, Ui);
