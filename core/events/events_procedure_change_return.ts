
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {IProcedureModel} from '../interfaces/i_procedure_model.js';
import * as registry from '../registry.js';
import {Workspace} from '../workspace.js';

import {ProcedureBase} from './events_procedure_base.js';
import * as eventUtils from './utils.js';


export class ProcedureChangeReturn extends ProcedureBase {
  type = eventUtils.PROCEDURE_CHANGE_RETURN;
  private newTypes: string[]|null;

  constructor(
      workpace: Workspace, model: IProcedureModel,
      public readonly oldTypes: string[]|null) {
    super(workpace, model);

    this.newTypes = model.getReturnTypes();
  }

  run(forward: boolean) {
    const procedureModel =
        this.getEventWorkspace_().getProcedureMap().get(this.model.getId());
    if (!procedureModel) {
      throw new Error(
          'Cannot change the type of a procedure that does not exist ' +
          'in the procedure map');
    }
    if (forward) {
      procedureModel.setReturnTypes(this.newTypes);
    } else {
      procedureModel.setReturnTypes(this.oldTypes);
    }
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_CHANGE_RETURN,
    ProcedureChangeReturn);
