/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {ObservableParameterModel, ObservableProcedureModel} from '../procedures.js';
import * as registry from '../registry.js';
import {loadProcedure, saveProcedure, State as ProcedureState} from '../serialization/procedures.js';
import type {Workspace} from '../workspace.js';

import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base.js';
import * as eventUtils from './utils.js';


/**
 * Represents a procedure data model being created.
 */
export class ProcedureCreate extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = eventUtils.PROCEDURE_CREATE;

  constructor(workspace: Workspace, model: IProcedureModel) {
    super(workspace, model);
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const procedureMap = workspace.getProcedureMap();
    const procedureModel = procedureMap.get(this.model.getId());
    if (forward) {
      if (procedureModel) return;
      // TODO: This should add the model to the map instead of creating a dupe.
      procedureMap.add(new ObservableProcedureModel(
          workspace, this.model.getName(), this.model.getId()));
    } else {
      if (!procedureModel) return;
      procedureMap.delete(this.model.getId());
    }
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureCreateJson {
    const json = super.toJson() as ProcedureCreateJson;
    json['model'] = saveProcedure(this.model);
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @internal
   */
  static fromJson(json: ProcedureCreateJson, workspace: Workspace):
      ProcedureCreate {
    return new ProcedureCreate(
        workspace,
        loadProcedure(
            ObservableProcedureModel, ObservableParameterModel, json['model'],
            workspace));
  }
}

export interface ProcedureCreateJson extends ProcedureBaseJson {
  model: ProcedureState,
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_CREATE, ProcedureCreate);
