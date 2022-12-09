/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IParameterModel} from '../interfaces/i_parameter_model.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import * as registry from '../registry.js';
import type {Workspace} from '../workspace.js';

import {ProcedureParameterBase, ProcedureParameterBaseJson} from './events_procedure_parameter_base.js';
import * as eventUtils from './utils.js';

/**
 * Represents a parameter of a procedure being renamed.
 */
export class ProcedureParameterRename extends ProcedureParameterBase {
  /** A string used to check the type of the event. */
  type = eventUtils.PROCEDURE_PARAMETER_RENAME;
  private readonly newName: string;

  constructor(
      workspace: Workspace, procedure: IProcedureModel,
      parameter: IParameterModel, public readonly oldName: string) {
    super(workspace, procedure, parameter);

    this.newName = parameter.getName();
  }

  run(forward: boolean) {
    const parameterModel = findMatchingParameter(
        this.getEventWorkspace_(), this.model.getId(), this.parameter.getId());
    if (!parameterModel) {
      throw new Error(
          'Cannot rename a parameter that does not exist ' +
          'in the procedure map');
    }
    if (forward) {
      parameterModel.setName(this.newName);
    } else {
      parameterModel.setName(this.oldName);
    }
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureParameterRenameJson {
    const json = super.toJson() as ProcedureParameterRenameJson;
    json['oldName'] = this.oldName;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @internal
   */
  static fromJson(json: ProcedureParameterRenameJson, workspace: Workspace):
      ProcedureParameterRename {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure delete event because the ' +
          'target procedure does not exist');
    }
    const param = findMatchingParameter(
        workspace, json['procedureId'], json['parameterId']);
    if (!param) {
      throw new Error(
          'Cannot deserialize parameter rename event because the ' +
          'target parameter does not exist');
    }
    return new ProcedureParameterRename(
        workspace, model, param, json['oldName']);
  }
}

function findMatchingParameter(
    workspace: Workspace, modelId: string, paramId: string): IParameterModel|
    undefined {
  const procedureModel = workspace.getProcedureMap().get(modelId);
  if (!procedureModel) {
    throw new Error(
        'Cannot rename the parameter of a procedure that does not exist ' +
        'in the procedure map');
  }
  return procedureModel.getParameters().find((p) => p.getId() === paramId);
}


export interface ProcedureParameterRenameJson extends
    ProcedureParameterBaseJson {
  oldName: string;
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_PARAMETER_RENAME,
    ProcedureParameterRename);
