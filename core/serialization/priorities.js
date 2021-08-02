/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Includes constants for the priorities of different plugin
 *     serializers. Higher priorities are deserialized first.
 */

'use strict';

/**
 * The top level namespace for priorities of plugin serializers.
 * @namespace Blockly.serialization.priorities
 */
goog.module('Blockly.serialization.priorities');
goog.module.declareLegacyNamespace();


/**
 * The priority for deserializing variables.
 * @type {number}
 * @const
 */
exports.VARIABLES = 100;

/**
 * The priority for deserializing blocks.
 * @type {number}
 * @const
 */
exports.BLOCKS = 50;
