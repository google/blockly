/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IDraggable');

import type {IDeletable} from './i_deletable.js';


/**
 * The interface for an object that can be dragged.
 */
export interface IDraggable extends IDeletable {}
