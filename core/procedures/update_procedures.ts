/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
import {isProcedureBlock} from '../interfaces/i_procedure_block.js';
import {Workspace} from '../workspace.js';

goog.declareModuleId('Blockly.procedures.updateProcedures');


/**
 * Calls the `doProcedureUpdate` method on all blocks which implement it.
 *
 * @internal
 */
export function triggerProceduresUpdate(workspace: Workspace) {
  if (workspace.isClearing) return;
  for (const block of workspace.getAllBlocks(false)) {
    if (isProcedureBlock(block)) {
      block.doProcedureUpdate();
    }
  }
}
