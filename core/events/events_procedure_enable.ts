
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
 * Represents a procedure data model being enabled or disabled.
 */
export class ProcedureEnable extends ProcedureBase {
  /** A string used to check the type of the event. */
  type = eventUtils.PROCEDURE_ENABLE;

  private oldState: boolean;
  private newState: boolean;

  constructor(workspace: Workspace, model: IProcedureModel) {
    super(workspace, model);

    this.oldState = !model.getEnabled();
    this.newState = model.getEnabled();
  }

  run(forward: boolean) {
    const procedureModel =
        this.getEventWorkspace_().getProcedureMap().get(this.model.getId());
    if (!procedureModel) {
      throw new Error(
          'Cannot change the enabled state of a procedure that does not ' +
          'exist in the procedure map');
    }
    if (forward) {
      procedureModel.setEnabled(this.newState);
    } else {
      procedureModel.setEnabled(this.oldState);
    }
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  toJson(): ProcedureEnableJson {
    return super.toJson() as ProcedureEnableJson;
  }

  /**
   * Deserializes the JSON event.
   *
   * @internal
   */
  static fromJson(json: ProcedureEnableJson, workspace: Workspace):
      ProcedureEnable {
    const model = workspace.getProcedureMap().get(json['procedureId']);
    if (!model) {
      throw new Error(
          'Cannot deserialize procedure enable event because the ' +
          'target procedure does not exist');
    }
    return new ProcedureEnable(workspace, model);
  }
}

export interface ProcedureEnableJson extends ProcedureBaseJson {}

registry.register(
    registry.Type.EVENT, eventUtils.PROCEDURE_ENABLE, ProcedureEnable);
