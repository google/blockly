/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The top level namespace for priorities of plugin serializers.
 * Includes constants for the priorities of different plugin
 * serializers. Higher priorities are deserialized first.
 */

'use strict';

/**
 * The top level namespace for priorities of plugin serializers.
 * Includes constants for the priorities of different plugin serializers. Higher
 * priorities are deserialized first.
 * @namespace Blockly.serialization.priorities
 */
goog.module('Blockly.serialization.priorities');


/**
 * The priority for deserializing variables.
 * @type {number}
 * @const
 * @alias Blockly.serialization.priorities.VARIABLES
 */
exports.VARIABLES = 100;

/**
 * The priority for deserializing blocks.
 * @type {number}
 * @const
 * @alias Blockly.serialization.priorities.BLOCKS
 */
exports.BLOCKS = 50;
