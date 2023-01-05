/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {Block} from '../block.js';
import {IProcedureModel} from './i_procedure_model.js';


/** The interface for a block which models a procedure. */
export interface IProcedureBlock {
  doProcedureUpdate(): void;
  getProcedureModel(): IProcedureModel;
}

/** A type guard which checks if the given block is a procedure block. */
export function isProcedureBlock(block: Block|
                                 IProcedureBlock): block is IProcedureBlock {
  return (block as IProcedureBlock).doProcedureUpdate !== undefined;
}
