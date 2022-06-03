/**
 * @fileoverview The top level namespace for priorities of plugin serializers.
 * Includes constants for the priorities of different plugin
 * serializers. Higher priorities are deserialized first.
 */


/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



/**
 * The top level namespace for priorities of plugin serializers.
 * Includes constants for the priorities of different plugin serializers. Higher
 * priorities are deserialized first.
 * @namespace Blockly.serialization.priorities
 */


/**
 * The priority for deserializing variables.
 * @alias Blockly.serialization.priorities.VARIABLES
 */
export const VARIABLES = 100;
/**
 * The priority for deserializing blocks.
 * @alias Blockly.serialization.priorities.BLOCKS
 */
export const BLOCKS = 50;
