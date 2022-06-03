/** @fileoverview A mapping of block type names to block prototype objects. */


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
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * A mapping of block type names to block prototype objects.
 * @namespace Blockly.blocks
 */


/**
 * A block definition.  For now this very lose, but it can potentially
 * be refined e.g. by replacing this typedef with a class definition.
 */
export type BlockDefinition = AnyDuringMigration;

/**
 * A mapping of block type names to block prototype objects.
 * @alias Blockly.blocks.Blocks
 */
export const Blocks: { [key: string]: BlockDefinition } = Object.create(null);
