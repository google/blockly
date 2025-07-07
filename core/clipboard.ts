/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.clipboard

import {BlockCopyData, BlockPaster} from './clipboard/block_paster.js';
import * as registry from './clipboard/registry.js';
import type {ICopyData, ICopyable} from './interfaces/i_copyable.js';
import * as globalRegistry from './registry.js';
import {Coordinate} from './utils/coordinate.js';
import {WorkspaceSvg} from './workspace_svg.js';

/** Metadata about the object that is currently on the clipboard. */
let stashedCopyData: ICopyData | null = null;

let stashedWorkspace: WorkspaceSvg | null = null;

/**
 * Private version of copy for stubbing in tests.
 */
function copyInternal<T extends ICopyData>(toCopy: ICopyable<T>): T | null {
  const data = toCopy.toCopyData();
  stashedCopyData = data;
  stashedWorkspace = (toCopy as any).workspace ?? null;
  return data;
}

/**
 * Paste a pasteable element into the workspace.
 *
 * @param copyData The data to paste into the workspace.
 * @param workspace The workspace to paste the data into.
 * @param coordinate The location to paste the thing at.
 * @returns The pasted thing if the paste was successful, null otherwise.
 */
export function paste<T extends ICopyData>(
  copyData: T,
  workspace: WorkspaceSvg,
  coordinate?: Coordinate,
): ICopyable<T> | null;

/**
 * Pastes the last copied ICopyable into the workspace.
 *
 * @returns the pasted thing if the paste was successful, null otherwise.
 */
export function paste(): ICopyable<ICopyData> | null;

/**
 * Pastes the given data into the workspace, or the last copied ICopyable if
 * no data is passed.
 *
 * @param copyData The data to paste into the workspace.
 * @param workspace The workspace to paste the data into.
 * @param coordinate The location to paste the thing at.
 * @returns The pasted thing if the paste was successful, null otherwise.
 */
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

/**
 * Paste a pasteable element into the workspace.
 *
 * @param copyData The data to paste into the workspace.
 * @param workspace The workspace to paste the data into.
 * @param coordinate The location to paste the thing at.
 * @returns The pasted thing if the paste was successful, null otherwise.
 */
function pasteFromData<T extends ICopyData>(
  copyData: T,
  workspace: WorkspaceSvg,
  coordinate?: Coordinate,
): ICopyable<T> | null {
  workspace = workspace.isMutator
    ? workspace
    : (workspace.getRootWorkspace() ?? workspace);
  return (globalRegistry
    .getObject(globalRegistry.Type.PASTER, copyData.paster, false)
    ?.paste(copyData, workspace, coordinate) ?? null) as ICopyable<T> | null;
}

/**
 * Private version of duplicate for stubbing in tests.
 */
function duplicateInternal<
  U extends ICopyData,
  T extends ICopyable<U> & IHasWorkspace,
>(toDuplicate: T): T | null {
  const data = toDuplicate.toCopyData();
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

export {BlockCopyData, BlockPaster, registry};
