/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Abstract as AbstractEvent} from './events_abstract.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import type {Workspace} from '../workspace.js';


/**
 * The base event for an event associated with a procedure.
 */
export class ProcedureBase extends AbstractEvent {
  isBlank = false;

  constructor(workspace: Workspace, public readonly model: IProcedureModel) {
    super();
    this.workspaceId = workspace.id;
  }
}
