/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.procedures.ObservableParameterModel');

import type {IProcedureMap} from '../interfaces/i_procedure_map.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import type {Workspace} from '../workspace.js';


export class ObservableProcedureMap implements IProcedureMap {
  private procedures = new Map<string, IProcedureModel>();

  constructor(private readonly workspace: Workspace) {}

  /**
   * Adds the given procedure model to the map of procedures, so that blocks
   * can find it.
   */
  addProcedure(procedureModel: IProcedureModel): IProcedureModel {
    this.procedures.set(procedureModel.getId(), procedureModel);
    return procedureModel;
  }

  /** Deletes the procedure with the given id from the procedure map. */
  deleteProcedure(id: string): ObservableProcedureMap {
    this.procedures.delete(id);
    return this;
  }

  /**
   * Returns the procedure model with the given ID, if one exists in the
   * procedure map, undefined otherwise.
   */
  getProcedure(id: string): IProcedureModel|undefined {
    return this.procedures.get(id);
  }

  /** Returns an array of all of the procedure models in the procedure map. */
  getProcedures(): IProcedureModel[] {
    return [...this.procedures.values()];
  }
}
