/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Abstract class for a variable event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.VarBase');

import type {VariableModel} from '../variable_model.js';

import {Abstract as AbstractEvent, AbstractEventJson} from './events_abstract.js';


/**
 * Abstract class for a variable event.
 *
 * @alias Blockly.Events.VarBase
 */
export class VarBase extends AbstractEvent {
  override isBlank: AnyDuringMigration;
  varId: string;
  override workspaceId: string;

  /**
   * @param opt_variable The variable this event corresponds to.  Undefined for
   *     a blank event.
   */
  constructor(opt_variable?: VariableModel) {
    super();
    this.isBlank = typeof opt_variable === 'undefined';

    /** The variable ID for the variable this event pertains to. */
    this.varId = this.isBlank ? '' : opt_variable!.getId();

    /** The workspace identifier for this event. */
    this.workspaceId = this.isBlank ? '' : opt_variable!.workspace.id;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): VarBaseJson {
    const json = super.toJson() as VarBaseJson;
    json['varId'] = this.varId;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: VarBaseJson) {
    super.fromJson(json);
    this.varId = json['varId'];
  }
}

export interface VarBaseJson extends AbstractEventJson {
  varId: string;
}
