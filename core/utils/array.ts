/** @fileoverview Utility methods related to arrays. */

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/** @namespace Blockly.utils.array */


/**
 * Removes the first occurrence of a particular value from an array.
 * @param arr Array from which to remove value.
 * @param value Value to remove.
 * @return True if an element was removed.
 * @alias Blockly.array.removeElem
 */
export function removeElem(
  arr: AnyDuringMigration[], value: AnyDuringMigration): boolean {
  const i = arr.indexOf(value);
  if (i === -1) {
    return false;
  }
  arr.splice(i, 1);
  return true;
}
