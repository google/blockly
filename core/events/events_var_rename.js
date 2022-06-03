/** @fileoverview Class for a variable rename event. */


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
 * Class for a variable rename event.
 * @class
 */

import * as registry from '../registry';
/* eslint-disable-next-line no-unused-vars */
import { VariableModel } from '../variable_model';

import { VarBase } from './events_var_base';
import * as eventUtils from './utils';


/**
 * Class for a variable rename event.
 * @alias Blockly.Events.VarRename
 */
export class VarRename extends VarBase {
  override type: string;

  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  oldName!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  newName!: string;

  /**
   * @param opt_variable The renamed variable. Undefined for a blank event.
   * @param newName The new name the variable will be changed to.
   */
  constructor(opt_variable?: VariableModel, newName?: string) {
    super(opt_variable);

    /** Type of this event. */
    this.type = eventUtils.VAR_RENAME;

    if (!opt_variable) {
      return;
    }
    // Blank event to be populated by fromJson.
    this.oldName = opt_variable.name;
    this.newName = typeof newName === 'undefined' ? '' : newName;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['oldName'] = this.oldName;
    json['newName'] = this.newName;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.oldName = json['oldName'];
    this.newName = json['newName'];
  }

  /**
   * Run a variable rename event.
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    if (forward) {
      workspace.renameVariableById(this.varId, this.newName);
    } else {
      workspace.renameVariableById(this.varId, this.oldName);
    }
  }
}

registry.register(registry.Type.EVENT, eventUtils.VAR_RENAME, VarRename);
