/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Abstract as AbstractEvent, AbstractEventJson} from './events_abstract.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import type {Workspace} from '../workspace.js';


/**
 * The base event for an event associated with a procedure.
 */
export abstract class ProcedureBase extends AbstractEvent {
  isBlank = false;

  constructor(workspace: Workspace, public readonly model: IProcedureModel) {
    super();
    this.workspaceId = workspace.id;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureBaseJson {
    const json = super.toJson() as ProcedureBaseJson;
    json['procedureId'] = this.model.getId();
    return json;
  }
}

export interface ProcedureBaseJson extends AbstractEventJson {
  procedureId: string;
}
