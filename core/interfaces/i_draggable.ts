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
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IDraggable');

/* eslint-disable-next-line no-unused-vars */
import {IDeletable} from './i_deletable.js';


/**
 * The interface for an object that can be dragged.
 * @alias Blockly.IDraggable
 */
export interface IDraggable extends IDeletable {}
