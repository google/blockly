/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Workspace} from '../workspace.js';
import {isProcedureBlock} from '../interfaces/i_procedure_block.js';


/**
 * Calls the `doProcedureUpdate` method on all blocks which implement it.
 *
 * @internal
 */
export function triggerProceduresUpdate(workspace: Workspace) {
  console.log(workspace.getAllBlocks(false).length);
  for (const block of workspace.getAllBlocks(false)) {
    if (isProcedureBlock(block)) {
      console.log('calling');
      block.doProcedureUpdate();
    }
  }
}
