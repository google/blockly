/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.clipboard');

import type {CopyData, ICopyable} from './interfaces/i_copyable.js';


/** Metadata about the object that is currently on the clipboard. */
let copyData: CopyData|null = null;

/**
 * Copy a block or workspace comment onto the local clipboard.
 *
 * @param toCopy Block or Workspace Comment to be copied.
 * @internal
 */
export function copy(toCopy: ICopyable) {
  TEST_ONLY.copyInternal(toCopy);
}

/**
 * Private version of copy for stubbing in tests.
 */
function copyInternal(toCopy: ICopyable) {
  copyData = toCopy.toCopyData();
}

/**
 * Paste a block or workspace comment on to the main workspace.
 *
 * @returns The pasted thing if the paste was successful, null otherwise.
 * @internal
 */
export function paste(): ICopyable|null {
  if (!copyData) {
    return null;
  }
  // Pasting always pastes to the main workspace, even if the copy
  // started in a flyout workspace.
  let workspace = copyData.source;
  if (workspace.isFlyout) {
    workspace = workspace.targetWorkspace!;
  }
  if (copyData.typeCounts &&
      workspace.isCapacityAvailable(copyData.typeCounts)) {
    return workspace.paste(copyData.saveInfo);
  }
  return null;
}

/**
 * Duplicate this block and its children, or a workspace comment.
 *
 * @param toDuplicate Block or Workspace Comment to be duplicated.
 * @returns The block or workspace comment that was duplicated, or null if the
 *     duplication failed.
 * @internal
 */
export function duplicate(toDuplicate: ICopyable): ICopyable|null {
  return TEST_ONLY.duplicateInternal(toDuplicate);
}

/**
 * Private version of duplicate for stubbing in tests.
 */
function duplicateInternal(toDuplicate: ICopyable): ICopyable|null {
  const oldCopyData = copyData;
  copy(toDuplicate);
  const pastedThing =
      toDuplicate.toCopyData()?.source?.paste(copyData!.saveInfo) ?? null;
  copyData = oldCopyData;
  return pastedThing;
}

export const TEST_ONLY = {
  duplicateInternal,
  copyInternal,
};
