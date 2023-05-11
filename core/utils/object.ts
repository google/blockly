/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.object');

import * as deprecation from './deprecation.js';

/**
 * Copies all the members of a source object to a target object.
 *
 * @param target Target.
 * @param source Source.
 * @deprecated Use the built-in **Object.assign** instead.
 */
export function mixin(target: AnyDuringMigration, source: AnyDuringMigration) {
  deprecation.warn(
    'Blockly.utils.object.mixin',
    'May 2022',
    'May 2023',
    'Object.assign'
  );
  for (const x in source) {
    target[x] = source[x];
  }
}

/**
 * Complete a deep merge of all members of a source object with a target object.
 *
 * @param target Target.
 * @param source Source.
 * @returns The resulting object.
 */
export function deepMerge(
  target: AnyDuringMigration,
  source: AnyDuringMigration
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
