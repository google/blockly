/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The interface for the map of procedure models.
 *
 * @namespace Blockly.IProcedureMap
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IProcedureMap');

import {IProcedureModel} from './i_procedure_model.js';

/**
 * A special collection of procedure models.
 */
export interface IProcedureMap {
  /**
   * Adds the given procedure model to the map of procedures, so that blocks
   * can find it.
   */
  addProcedure(procedureModel: IProcedureModel): IProcedureModel;

  /** Deletes the procedure with the given id from the procedure map. */
  deleteProcedure(id: string): IProcedureMap;

  /**
   * Returns the procedure model with the given ID, if one exists in the
   * procedure map, undefined otherwise.
   */
  getProcedure(id: string): IProcedureModel|undefined;

  /** Returns an array of all of the procedure models in the procedure map. */
  getProcedures(): IProcedureModel[];
}
