/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IParameterModel} from '../interfaces/i_parameter_model.js';
import {IProcedureModel} from '../interfaces/i_procedure_model.js';
import * as registry from '../registry.js';
import {Workspace} from '../workspace.js';

import {ProcedureParameterBase} from './events_procedure_parameter_base.js';
import * as eventUtils from './utils.js';


export class ProcedureParameterRename extends ProcedureParameterBase {
  private readonly newName: string;

  constructor(
      workspace: Workspace, procedure: IProcedureModel,
      public readonly parameter: IParameterModel,
      public readonly oldName: string) {
    super(workspace, procedure);

    this.newName = parameter.getName();
  }

  run(forward: boolean) {
    const procedureModel =
        this.getEventWorkspace_().getProcedureMap().get(this.model.getId());
    if (!procedureModel) {
      throw new Error(
          'Cannot rename the parameter of a procedure that does not exist ' +
          'in the procedure map');
    }
    const parameterModel = procedureModel.getParameters()
        .find((p) => p.getId() === this.parameter.getId());
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
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_PARAMETER_RENAME,
    ProcedureParameterRename);
