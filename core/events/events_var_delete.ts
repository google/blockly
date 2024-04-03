/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Events.VarDelete

import * as registry from '../registry.js';
import type {VariableModel} from '../variable_model.js';

import {VarBase, VarBaseJson} from './events_var_base.js';
import * as eventUtils from './utils.js';
import type {Workspace} from '../workspace.js';

/**
 * Notifies listeners that a variable model has been deleted.
 *
 * @class
 */
export class VarDelete extends VarBase {
  override type = eventUtils.VAR_DELETE;
  /** The type of the variable that was deleted. */
  varType?: string;
  /** The name of the variable that was deleted. */
  varName?: string;

  /**
   * @param opt_variable The deleted variable. Undefined for a blank event.
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
  override toJson(): VarDeleteJson {
    const json = super.toJson() as VarDeleteJson;
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
   *     of VarDelete, but we can't specify that due to the fact that parameters
   *     to static methods in subclasses must be supertypes of parameters to
   *     static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: VarDeleteJson,
    workspace: Workspace,
    event?: any,
  ): VarDelete {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new VarDelete(),
    ) as VarDelete;
    newEvent.varType = json['varType'];
    newEvent.varName = json['varName'];
    return newEvent;
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
