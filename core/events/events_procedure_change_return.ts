
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
 * Represents a procedure's return type/status changing.
 */
export class ProcedureChangeReturn extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = eventUtils.PROCEDURE_CHANGE_RETURN;

  /** The new type(s) the procedure's return has been set to. */
  private newTypes: string[]|null;

  /**
   * @param oldTypes The type(s) the procedure's return was set to before it
   *     changed.
   */
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

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureChangeReturnJson {
    const json = super.toJson() as ProcedureChangeReturnJson;
    json['oldTypes'] = this.oldTypes;
    return json;
  }

  /**
   * Deserializes the JSON event.
   *
   * @internal
   */
  static fromJson(json: ProcedureChangeReturnJson, workspace: Workspace):
      ProcedureChangeReturn {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure change return event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureChangeReturn(workspace, model, json['oldTypes']);
  }
}

export interface ProcedureChangeReturnJson extends ProcedureBaseJson {
  oldTypes: string[]|null;
}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_CHANGE_RETURN,
    ProcedureChangeReturn);
