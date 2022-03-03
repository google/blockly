/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is draggable.
 */

'use strict';

/**
 * The interface for an object that is draggable.
 * @namespace Blockly.IDraggable
 */
goog.declareModuleId('Blockly.IDraggable');

/* eslint-disable-next-line no-unused-vars */
import {IDeletable} from './i_deletable.js';


/**
 * The interface for an object that can be dragged.
 * @extends {IDeletable}
 * @interface
 * @alias Blockly.IDraggable
 */
const IDraggable = function() {};

export {IDraggable};
