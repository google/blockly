/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Events.VarRename

import * as registry from '../registry.js';
import type {VariableModel} from '../variable_model.js';

import {VarBase, VarBaseJson} from './events_var_base.js';
import * as eventUtils from './utils.js';
import type {Workspace} from '../workspace.js';

/**
 * Notifies listeners that a variable model was renamed.
 *
 * @class
 */
export class VarRename extends VarBase {
  override type = eventUtils.VAR_RENAME;

  /** The previous name of the variable. */
  oldName?: string;

  /** The new name of the variable. */
  newName?: string;

  /**
   * @param opt_variable The renamed variable. Undefined for a blank event.
   * @param newName The new name the variable will be changed to.
   */
  constructor(opt_variable?: VariableModel, newName?: string) {
    super(opt_variable);

    if (!opt_variable) {
      return; // Blank event to be populated by fromJson.
    }
    this.oldName = opt_variable.name;
    this.newName = typeof newName === 'undefined' ? '' : newName;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): VarRenameJson {
    const json = super.toJson() as VarRenameJson;
    if (!this.oldName) {
      throw new Error(
        'The old var name is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson',
      );
    }
    if (!this.newName) {
      throw new Error(
        'The new var name is undefined. Either pass a value to ' +
          'the constructor, or call fromJson',
      );
    }
    json['oldName'] = this.oldName;
    json['newName'] = this.newName;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @param event The event to append new properties to. Should be a subclass
   *     of VarRename, but we can't specify that due to the fact that parameters
   *     to static methods in subclasses must be supertypes of parameters to
   *     static methods in superclasses.
   * @internal
   */
  static fromJson(
    json: VarRenameJson,
    workspace: Workspace,
    event?: any,
  ): VarRename {
    const newEvent = super.fromJson(
      json,
      workspace,
      event ?? new VarRename(),
    ) as VarRename;
    newEvent.oldName = json['oldName'];
    newEvent.newName = json['newName'];
    return newEvent;
  }

  /**
   * Run a variable rename event.
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
    if (!this.oldName) {
      throw new Error(
        'The old var name is undefined. Either pass a variable to ' +
          'the constructor, or call fromJson',
      );
    }
    if (!this.newName) {
      throw new Error(
        'The new var name is undefined. Either pass a value to ' +
          'the constructor, or call fromJson',
      );
    }
    if (forward) {
      workspace.renameVariableById(this.varId, this.newName);
    } else {
      workspace.renameVariableById(this.varId, this.oldName);
    }
  }
}

export interface VarRenameJson extends VarBaseJson {
  oldName: string;
  newName: string;
}

registry.register(registry.Type.EVENT, eventUtils.VAR_RENAME, VarRename);
