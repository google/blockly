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


export class ProcedureParameterCreate extends ProcedureParameterBase {
  constructor(
      workspace: Workspace, procedure: IProcedureModel,
      public readonly parameter: IParameterModel,
      public readonly index: number) {
    super(workspace, procedure);
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_PARAMETER_CREATE,
    ProcedureParameterCreate);
