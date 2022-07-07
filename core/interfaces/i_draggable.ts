/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is draggable.
 */

/**
 * The interface for an object that is draggable.
 * @namespace Blockly.IDraggable
 */


import type {IDeletable} from './i_deletable';


/**
 * The interface for an object that can be dragged.
 * @alias Blockly.IDraggable
 */
export interface IDraggable extends IDeletable {}
