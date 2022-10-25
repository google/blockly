/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {triggerProceduresUpdate} from './update_procedures.js';
import type {Workspace} from '../workspace.js';
import {IProcedureMap} from '../interfaces/i_procedure_map.js';


export class ObservableProcedureMap extends
    Map<string, IProcedureModel> implements IProcedureMap {
  constructor(private readonly workspace: Workspace) {
    super();
  }

  /**
   * Adds the given procedure model to the procedure map.
   */
  override set(id: string, proc: IProcedureModel): this {
    // TODO(#6516): Fire events.
    super.set(id, proc);
    return this;
  }

  /**
   * Deletes the ProcedureModel with the given ID from the procedure map (if it
   * exists).
   */
  override delete(id: string): boolean {
    // TODO(#6516): Fire events.
    const existed = super.delete(id);
    triggerProceduresUpdate(this.workspace);
    return existed;
  }

  /**
   * Removes all ProcedureModels from the procedure map.
   */
  override clear() {
    // TODO(#6516): Fire events.
    super.clear();
    triggerProceduresUpdate(this.workspace);
  }

  /**
   * Adds the given ProcedureModel to the map of procedure models, so that
   * blocks can find it.
   */
  add(proc: IProcedureModel): this {
    // TODO(#6516): Fire events.
    // TODO(#6526): See if this method is actually useful.
    return this.set(proc.getId(), proc);
  }

  /**
   * Returns all of the procedures stored in this map.
   */
  getProcedures(): IProcedureModel[] {
    return [...this.values()];
  }
}
