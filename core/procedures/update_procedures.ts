/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.procedures.updateProcedures');

import {Workspace} from '../workspace.js';
import {isProcedureBlock} from '../interfaces/i_procedure_block.js';


/**
 * Calls the `doProcedureUpdate` method on all blocks which implement it.
 */
export function triggerProceduresUpdate(workspace: Workspace) {
  for (const block of workspace.getAllBlocks(false)) {
    if (isProcedureBlock(block)) {
      block.doProcedureUpdate();
    }
  }
}
