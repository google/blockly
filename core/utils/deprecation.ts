/**
 * @fileoverview Helper function for warning developers about deprecations.
 * This method is not specific to Blockly.
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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Helper function for warning developers about deprecations.
 * This method is not specific to Blockly.
 * @namespace Blockly.utils.deprecation
 */


/**
 * Warn developers that a function or property is deprecated.
 * @param name The name of the function or property.
 * @param deprecationDate The date of deprecation.
 *     Prefer 'month yyyy' or 'quarter yyyy' format.
 * @param deletionDate The date of deletion, in the same format as the
 *     deprecation date.
 * @param opt_use The name of a function or property to use instead, if any.
 * @alias Blockly.utils.deprecation.warn
 */
export function warn(
  name: string, deprecationDate: string, deletionDate: string,
  opt_use?: string) {
  let msg = name + ' was deprecated on ' + deprecationDate +
    ' and will be deleted on ' + deletionDate + '.';
  if (opt_use) {
    msg += '\nUse ' + opt_use + ' instead.';
  }
  console.warn(msg);
}
