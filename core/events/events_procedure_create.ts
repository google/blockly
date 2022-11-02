/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as registry from '../registry.js';

import {ProcedureBase} from './events_procedure_base.js';
import * as eventUtils from './utils.js';
import {Workspace} from '../workspace.js';
import {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {ObservableProcedureModel} from '../procedures.js';


export class ProcedureCreate extends ProcedureBase {
  constructor(
      workspace: Workspace,
      model: IProcedureModel) {
    super(workspace, model);
  }

  run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const procedureMap = workspace.getProcedureMap();
    const procedureModel = procedureMap.get(this.model.getId());
    if (forward) {
      if (procedureModel) return;
      procedureMap.add(new ObservableProcedureModel(
          workspace, this.model.getName(), this.model.getId()));
    } else {
      if (!procedureModel) return;
      procedureMap.delete(this.model.getId());
    }
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_CREATE, ProcedureCreate);
