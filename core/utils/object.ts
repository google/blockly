/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.utils.object

/**
 * Complete a deep merge of all members of a source object with a target object.
 *
 * @param target Target.
 * @param source Source.
 * @returns The resulting object.
 */
export function deepMerge(
  target: AnyDuringMigration,
  source: AnyDuringMigration,
): AnyDuringMigration {
  for (const x in source) {
    if (source[x] !== null && typeof source[x] === 'object') {
      target[x] = deepMerge(target[x] || Object.create(null), source[x]);
    } else {
      target[x] = source[x];
    }
  }
  return target;
}
