/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import * as registry from '../registry.js';
import type {Workspace} from '../workspace.js';

import {ProcedureBase, ProcedureBaseJson} from './events_procedure_base.js';
import * as eventUtils from './utils.js';

/**
 * Represents a procedure being renamed.
 */
export class ProcedureRename extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = eventUtils.PROCEDURE_RENAME;
  private newName: string;

  constructor(
      workspace: Workspace, model: IProcedureModel,
      public readonly oldName: string) {
    super(workspace, model);

    this.newName = model.getName();
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
      procedureModel.setName(this.newName);
    } else {
      procedureModel.setName(this.oldName);
    }
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureRenameJson {
    const json = super.toJson() as ProcedureRenameJson;
    json['oldName'] = this.oldName;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @internal
   */
  static fromJson(json: ProcedureRenameJson, workspace: Workspace):
      ProcedureRename {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure rename event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureRename(workspace, model, json['oldName']);
  }
}

export interface ProcedureRenameJson extends ProcedureBaseJson {
  oldName: string;
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_RENAME, ProcedureRename);
