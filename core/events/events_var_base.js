/** @fileoverview Abstract class for a variable event. */


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
 * Abstract class for a variable event.
 * @class
 */

/* eslint-disable-next-line no-unused-vars */
import { VariableModel } from '../variable_model';

import { Abstract as AbstractEvent } from './events_abstract';


/**
 * Abstract class for a variable event.
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

    /** The variable id for the variable this event pertains to. */
    this.varId = this.isBlank ? '' : opt_variable!.getId();

    /** The workspace identifier for this event. */
    this.workspaceId = this.isBlank ? '' : opt_variable!.workspace.id;
  }

  /**
   * Encode the event as JSON.
   * @return JSON representation.
   */
  override toJson(): AnyDuringMigration {
    const json = super.toJson();
    json['varId'] = this.varId;
    return json;
  }

  /**
   * Decode the JSON event.
   * @param json JSON representation.
   */
  override fromJson(json: AnyDuringMigration) {
    super.fromJson(json);
    this.varId = json['varId'];
  }
}
