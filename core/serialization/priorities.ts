/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.serialization.priorities');


/**
 * The priority for deserializing variables.
 */
export const VARIABLES = 100;

/**
 * The priority for deserializing variable data.
 */
export const PROCEDURES = 75;

/**
 * The priority for deserializing blocks.
 */
export const BLOCKS = 50;
