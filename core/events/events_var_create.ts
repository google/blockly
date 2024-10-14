/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a variable creation event.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.VarCreate

import * as registry from '../registry.js';
import type {VariableModel} from '../variable_model.js';

import {VarBase, VarBaseJson} from './events_var_base.js';
import * as eventUtils from './utils.js';
import type {Workspace} from '../workspace.js';

/**
 * Notifies listeners that a variable model has been created.
 */
export class VarCreate extends VarBase {
  override type = eventUtils.VAR_CREATE;

  /** The type of the variable that was created. */
  varType?: string;

  /** The name of the variable that was created. */
  varName?: string;

  /**
   * @param opt_variable The created variable. Undefined for a blank event.
   */
  constructor(opt_variable?: VariableModel) {
    super(opt_variable);

    if (!opt_variable) {
      return; // Blank event to be populated by fromJson.
    }
    this.varType = opt_variable.type;
    this.varName = opt_variable.name;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): VarCreateJson {
    const json = super.toJson() as VarCreateJson;
    if (this.varType === undefined) {
      throw new Error(
        'The var type is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson',
      );
    }
    if (!this.varName) {
      throw new Error(
        'The var name is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson',
      );
    }
    json['varType'] = this.varType;
    json['varName'] = this.varName;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of VarCreate, but we can't specify that due to the fact that parameters
   *     to static methods in subclasses must be supertypes of parameters to
   *     static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: VarCreateJson,
    workspace: Workspace,
    event?: any,
  ): VarCreate {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new VarCreate(),
    ) as VarCreate;
    newEvent.varType = json['varType'];
    newEvent.varName = json['varName'];
    return newEvent;
  }

  /**
   * Run a variable creation event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (!this.varId) {
      throw new Error(
        'The var ID is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson',
      );
    }
    if (!this.varName) {
      throw new Error(
        'The var name is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson',
      );
    }
    if (forward) {
      workspace.createVariable(this.varName, this.varType, this.varId);
    } else {
      workspace.deleteVariableById(this.varId);
    }
  }
}

export interface VarCreateJson extends VarBaseJson {
  varType: string;
  varName: string;
}

registry.register(registry.Type.EVENT, eventUtils.VAR_CREATE, VarCreate);
