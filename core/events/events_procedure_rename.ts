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


export class ProcedureRename extends ProcedureBase {
  type = eventUtils.PROCEDURE_RENAME;

  constructor(
      workspace: Workspace, model: IProcedureModel,
      public readonly oldName: string) {
    super(workspace, model);
  }
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_RENAME, ProcedureRename);
