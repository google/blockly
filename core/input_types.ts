/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.inputTypes');

import {ConnectionType} from './connection_type.js';


/**
 * Enum for the type of a connection or input.
 */
export enum inputTypes {
  // A right-facing value input.  E.g. 'set item to' or 'return'.
  VALUE = ConnectionType.INPUT_VALUE,
  // A down-facing block stack.  E.g. 'if-do' or 'else'.
  STATEMENT = ConnectionType.NEXT_STATEMENT,
  // A dummy input.  Used to add field(s) with no input.
  DUMMY = 5
}
