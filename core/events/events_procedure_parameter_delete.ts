/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IParameterModel} from '../interfaces/i_parameter_model.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {ObservableParameterModel} from '../procedures/observable_parameter_model.js';
import * as registry from '../registry.js';
import type {Workspace} from '../workspace.js';

import {ProcedureParameterBase, ProcedureParameterBaseJson} from './events_procedure_parameter_base.js';
import * as eventUtils from './utils.js';

/**
 * Represents a parameter being removed from a procedure.
 */
export class ProcedureParameterDelete extends ProcedureParameterBase {
  /** A string used to check the type of the event. */
  type = eventUtils.PROCEDURE_PARAMETER_DELETE;

  /**
   * @param parameter The parameter model that was just removed from the
   *     procedure.
   * @param index The index the parameter was at before it was removed.
   */
  constructor(
      workspace: Workspace, procedure: IProcedureModel,
      parameter: IParameterModel, public readonly index: number) {
    super(workspace, procedure, parameter);
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const procedureMap = workspace.getProcedureMap();
    const procedureModel = procedureMap.get(this.model.getId());
    if (!procedureModel) {
      throw new Error(
          'Cannot add a parameter to a procedure that does not exist ' +
          'in the procedure map');
    }
    const parameterModel = procedureModel.getParameter(this.index);
    if (forward) {
      if (!this.parameterMatches(parameterModel)) return;
      procedureModel.deleteParameter(this.index);
    } else {
      if (this.parameterMatches(parameterModel)) return;
      // TODO: this should just insert the model instead of creating a dupe.
      procedureModel.insertParameter(
          new ObservableParameterModel(
              workspace, this.parameter.getName(), this.parameter.getId()),
          this.index);
    }
  }

  parameterMatches(param: IParameterModel) {
    return param && param.getId() === this.parameter.getId();
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureParameterDeleteJson {
    const json = super.toJson() as ProcedureParameterDeleteJson;
    json['index'] = this.index;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @internal
   */
  static fromJson(json: ProcedureParameterDeleteJson, workspace: Workspace):
      ProcedureParameterDelete {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure delete event because the ' +
          'target procedure does not exist');
    }
    const param = model.getParameter(json['index']);
    return new ProcedureParameterDelete(workspace, model, param, json['index']);
  }
}

export interface ProcedureParameterDeleteJson extends
    ProcedureParameterBaseJson {
  index: number;
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_PARAMETER_DELETE,
    ProcedureParameterDelete);
