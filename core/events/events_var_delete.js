/** @fileoverview Classes for all types of variable events. */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Classes for all types of variable events.
 * @class
 */

import * as registry from '../registry';
/* eslint-disable-next-line no-unused-vars */
import { VariableModel } from '../variable_model';

import { VarBase } from './events_var_base';
import * as eventUtils from './utils';


/**
 * Class for a variable deletion event.
 * @alias Blockly.Events.VarDelete
 */
export class VarDelete extends VarBase {
  override type: string;

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  varType!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  varName!: string;

  /**
   * @param opt_variable The deleted variable. Undefined for a blank event.
   */
  constructor(opt_variable?: VariableModel) {
    super(opt_variable);

    /** Type of this event. */
    this.type = eventUtils.VAR_DELETE;

    if (!opt_variable) {
      return;
    }
    // Blank event to be populated by fromJson.
    this.varType = opt_variable.type;
    this.varName = opt_variable.name;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['varType'] = this.varType;
    json['varName'] = this.varName;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.varType = json['varType'];
    this.varName = json['varName'];
  }

  /**
   * Run a variable deletion event.
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (forward) {
      workspace.deleteVariableById(this.varId);
    } else {
      workspace.createVariable(this.varName, this.varType, this.varId);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.VAR_DELETE, VarDelete);
