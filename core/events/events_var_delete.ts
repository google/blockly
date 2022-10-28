/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Classes for all types of variable events.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.VarDelete');

import * as registry from '../registry.js';
import type {VariableModel} from '../variable_model.js';

import {VarBase, VarBaseJson} from './events_var_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a variable deletion event.
 *
 * @alias Blockly.Events.VarDelete
 */
export class VarDelete extends VarBase {
  override type = eventUtils.VAR_DELETE;
  varType?: string;
  varName?: string;

  /**
   * @param opt_variable The deleted variable. Undefined for a blank event.
   */
  constructor(opt_variable?: VariableModel) {
    super(opt_variable);

    if (!opt_variable) {
      return;  // Blank event to be populated by fromJson.
    }
    this.varType = opt_variable.type;
    this.varName = opt_variable.name;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): VarDeleteJson {
    const json = super.toJson() as VarDeleteJson;
    if (!this.varType) {
      throw new Error(
          'The var type is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson');
    }
    if (!this.varName) {
      throw new Error(
          'The var name is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson');
    }
    json['varType'] = this.varType;
    json['varName'] = this.varName;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: VarDeleteJson) {
    super.fromJson(json);
    this.varType = json['varType'];
    this.varName = json['varName'];
  }

  /**
   * Run a variable deletion event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.varId) {
      throw new Error(
          'The var ID is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson');
    }
    if (!this.varName) {
      throw new Error(
          'The var name is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson');
    }
    if (forward) {
      workspace.deleteVariableById(this.varId);
    } else {
      workspace.createVariable(this.varName, this.varType, this.varId);
    }
  }
}

export interface VarDeleteJson extends VarBaseJson {
  varType: string;
  varName: string;
}

registry.register(registry.Type.EVENT, eventUtils.VAR_DELETE, VarDelete);
