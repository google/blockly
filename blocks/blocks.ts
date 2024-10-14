/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.libraryBlocks

import * as lists from './lists.js';
import * as logic from './logic.js';
import * as loops from './loops.js';
import * as math from './math.js';
import * as procedures from './procedures.js';
import * as texts from './text.js';
import * as variables from './variables.js';
import * as variablesDynamic from './variables_dynamic.js';
import * as argumentLocal from './argument_local.js';
import * as proceduresArgumentLocal from './procedures_local_argument.js';
import type {BlockDefinition} from '../core/blocks.js';

export {
  lists,
  logic,
  loops,
  math,
  procedures,
  texts,
  variables,
  variablesDynamic,
  argumentLocal,
  proceduresArgumentLocal,
};

/**
 * A dictionary of the block definitions provided by all the
 * Blockly.libraryBlocks.* modules.
 */
export const blocks: {[key: string]: BlockDefinition} = Object.assign(
  {},
  lists.blocks,
  logic.blocks,
  loops.blocks,
  math.blocks,
  procedures.blocks,
  texts.blocks,
  variables.blocks,
  variablesDynamic.blocks,
  argumentLocal.blocks,
  proceduresArgumentLocal.blocks,
);
