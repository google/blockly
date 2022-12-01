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

import {ProcedureParameterBase} from './events_procedure_parameter_base.js';
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
      public readonly parameter: IParameterModel,
      public readonly index: number) {
    super(workspace, procedure);
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
      procedureModel.insertParameter(
          new ObservableParameterModel(
              workspace, this.parameter.getName(), this.parameter.getId()),
          this.index);
    }
  }

  parameterMatches(param: IParameterModel) {
    return param && param.getId() === this.parameter.getId();
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_PARAMETER_DELETE,
    ProcedureParameterDelete);
