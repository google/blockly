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
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.VarCreate');

import * as registry from '../registry.js';
import type {VariableModel} from '../variable_model.js';

import {VarBase} from './events_var_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a variable creation event.
 *
 * @alias Blockly.Events.VarCreate
 */
export class VarCreate extends VarBase {
  override type: string;

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  varType!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  varName!: string;

  /**
   * @param opt_variable The created variable. Undefined for a blank event.
   */
  constructor(opt_variable?: VariableModel) {
    super(opt_variable);

    /** Type of this event. */
    this.type = eventUtils.VAR_CREATE;

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
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['varType'] = this.varType;
    json['varName'] = this.varName;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.varType = json['varType'];
    this.varName = json['varName'];
  }

  /**
   * Run a variable creation event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (forward) {
      workspace.createVariable(this.varName, this.varType, this.varId);
    } else {
      workspace.deleteVariableById(this.varId);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.VAR_CREATE, VarCreate);
