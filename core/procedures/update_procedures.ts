/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {isProcedureBlock} from '../interfaces/i_procedure_block.js';
import {Workspace} from '../workspace.js';


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
