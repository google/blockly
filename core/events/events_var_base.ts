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
  override isBlank = true;
  varId?: string;

  /**
   * @param opt_variable The variable this event corresponds to.  Undefined for
   *     a blank event.
   */
  constructor(opt_variable?: VariableModel) {
    super();
    this.isBlank = typeof opt_variable === 'undefined';
    if (!opt_variable) return;

    /** The variable id for the variable this event pertains to. */
    this.varId = opt_variable.getId();

    /** The workspace identifier for this event. */
    this.workspaceId = opt_variable.workspace.id;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): VarBaseJson {
    const json = super.toJson() as VarBaseJson;
    if (!this.varId) {
      throw new Error(
          'The var ID is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson');
    }
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
