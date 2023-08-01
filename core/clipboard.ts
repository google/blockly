/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.clipboard');

import type {ICopyData, ICopyable} from './interfaces/i_copyable.js';
import {BlockPaster} from './clipboard/block_paster.js';
import * as globalRegistry from './registry.js';
import {WorkspaceSvg} from './workspace_svg.js';
import * as registry from './clipboard/registry.js';
import {Coordinate} from './utils/coordinate.js';

/** Metadata about the object that is currently on the clipboard. */
let stashedCopyData: ICopyData | null = null;

let stashedWorkspace: WorkspaceSvg | null = null;

/**
 * Copy a block or workspace comment onto the local clipboard.
 *
 * @param toCopy Block or Workspace Comment to be copied.
 * @internal
 */
export function copy<T extends ICopyData>(toCopy: ICopyable<T>): T | null {
  return TEST_ONLY.copyInternal(toCopy);
}

/**
 * Private version of copy for stubbing in tests.
 */
function copyInternal<T extends ICopyData>(toCopy: ICopyable<T>): T | null {
  const data = toCopy.toCopyData();
  stashedCopyData = data; // Necessary for propery typing. This is why state sucks.
  stashedWorkspace = (toCopy as any).workspace ?? null;
  return data;
}

/**
 * Paste a block or workspace comment on to the main workspace.
 *
 * @returns The pasted thing if the paste was successful, null otherwise.
 */
export function paste<T extends ICopyData>(
  copyData: T,
  workspace: WorkspaceSvg,
  coordinate?: Coordinate,
): ICopyable<T> | null;
export function paste(): ICopyable<ICopyData> | null;
export function paste<T extends ICopyData>(
  copyData?: T,
  workspace?: WorkspaceSvg,
  coordinate?: Coordinate,
): ICopyable<ICopyData> | null {
  if (!copyData || !workspace) {
    if (!stashedCopyData || !stashedWorkspace) return null;
    return pasteFromData(stashedCopyData, stashedWorkspace);
  }
  return pasteFromData(copyData, workspace, coordinate);
}

function pasteFromData<T extends ICopyData>(
  copyData: T,
  workspace: WorkspaceSvg,
  coordinate?: Coordinate,
): ICopyable<T> | null {
  workspace = workspace.getRootWorkspace() ?? workspace;
  return (
    globalRegistry
      .getObject(globalRegistry.Type.PASTER, copyData.paster, false)
      ?.paste(copyData, workspace, coordinate) ?? null
  );
}

/**
 * Duplicate this block and its children, or a workspace comment.
 *
 * @param toDuplicate Block or Workspace Comment to be duplicated.
 * @returns The block or workspace comment that was duplicated, or null if the
 *     duplication failed.
 * @internal
 */
export function duplicate<
  U extends ICopyData,
  T extends ICopyable<U> & IHasWorkspace,
>(toDuplicate: T): T | null {
  return TEST_ONLY.duplicateInternal(toDuplicate);
}

/**
 * Private version of duplicate for stubbing in tests.
 */
function duplicateInternal<
  U extends ICopyData,
  T extends ICopyable<U> & IHasWorkspace,
>(toDuplicate: T): T | null {
  const oldCopyData = stashedCopyData;
  const oldWorkspace = stashedWorkspace;

  const data = copy(toDuplicate);

  // I hate side effects.
  stashedCopyData = oldCopyData;
  stashedWorkspace = oldWorkspace
  
  if (!data) return null;
  return paste(data, toDuplicate.workspace) as T;
}

interface IHasWorkspace {
  workspace: WorkspaceSvg;
}

export const TEST_ONLY = {
  duplicateInternal,
  copyInternal,
};

export {BlockPaster, registry};
