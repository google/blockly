
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
  constructor(
      workpace: Workspace, model: IProcedureModel,
      public readonly oldTypes: string[]|null) {
    super(workpace, model);
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_CHANGE_RETURN,
    ProcedureChangeReturn);
