/** @fileoverview Blockly's internal clipboard for managing copy-paste. */


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
 * Blockly's internal clipboard for managing copy-paste.
 * @namespace Blockly.clipboard
 */
import { CopyData, ICopyable } from './interfaces/i_copyable';


/** Metadata about the object that is currently on the clipboard. */
let copyData: CopyData | null = null;

/**
 * Copy a block or workspace comment onto the local clipboard.
 * @param toCopy Block or Workspace Comment to be copied.
 * @alias Blockly.clipboard.copy
 */
export function copy(toCopy: ICopyable) {
  copyData = toCopy.toCopyData();
}

/**
 * Paste a block or workspace comment on to the main workspace.
 * @return The pasted thing if the paste was successful, null otherwise.
 * @alias Blockly.clipboard.paste
 */
export function paste(): ICopyable | null {
  if (!copyData) {
    return null;
  }
  // Pasting always pastes to the main workspace, even if the copy
  // started in a flyout workspace.
  let workspace = copyData.source;
  if (workspace.isFlyout) {
    workspace = workspace.targetWorkspace;
  }
  if (copyData.typeCounts &&
    workspace.isCapacityAvailable(copyData.typeCounts)) {
    return workspace.paste(copyData.saveInfo);
  }
  return null;
}

/**
 * Duplicate this block and its children, or a workspace comment.
 * @param toDuplicate Block or Workspace Comment to be duplicated.
 * @return The block or workspace comment that was duplicated, or null if the
 *     duplication failed.
 * @alias Blockly.clipboard.duplicate
 */
export function duplicate(toDuplicate: ICopyable): ICopyable | null {
  const oldCopyData = copyData;
  copy(toDuplicate);
  const pastedThing = toDuplicate.toCopyData().source.paste(copyData!.saveInfo);
  copyData = oldCopyData;
  return pastedThing;
}
