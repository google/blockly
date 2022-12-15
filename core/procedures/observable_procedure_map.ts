/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as eventUtils from '../events/utils.js';
import {IProcedureMap} from '../interfaces/i_procedure_map.js';
import type {IProcedureModel} from '../interfaces/i_procedure_model.js';
import {isObservable} from '../interfaces/i_observable.js';
import {triggerProceduresUpdate} from './update_procedures.js';
import type {Workspace} from '../workspace.js';


export class ObservableProcedureMap extends
    Map<string, IProcedureModel> implements IProcedureMap {
  constructor(private readonly workspace: Workspace) {
    super();
  }

  /**
   * Adds the given procedure model to the procedure map.
   */
  override set(id: string, proc: IProcedureModel): this {
    if (this.get(id) === proc) return this;
    super.set(id, proc);
    eventUtils.fire(new (eventUtils.get(eventUtils.PROCEDURE_CREATE))(
        this.workspace, proc));
    if (isObservable(proc)) proc.startPublishing();
    return this;
  }

  /**
   * Deletes the ProcedureModel with the given ID from the procedure map (if it
   * exists).
   */
  override delete(id: string): boolean {
    const proc = this.get(id);
    const existed = super.delete(id);
    if (!existed) return existed;
    triggerProceduresUpdate(this.workspace);
    eventUtils.fire(new (eventUtils.get(eventUtils.PROCEDURE_DELETE))(
        this.workspace, proc));
    if (isObservable(proc)) proc.stopPublishing();
    return existed;
  }

  /**
   * Removes all ProcedureModels from the procedure map.
   */
  override clear() {
    if (!this.size) return;
    for (const id of this.keys()) {
      const proc = this.get(id);
      super.delete(id);
      eventUtils.fire(new (eventUtils.get(eventUtils.PROCEDURE_DELETE))(
          this.workspace, proc));
    }
    triggerProceduresUpdate(this.workspace);
  }

  /**
   * Adds the given ProcedureModel to the map of procedure models, so that
   * blocks can find it.
   */
  add(proc: IProcedureModel): this {
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
