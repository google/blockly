/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {INavigable} from '../interfaces/i_navigable.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

/**
 * Set of rules controlling keyboard navigation from a workspace.
 */
export class WorkspaceNavigationPolicy
  implements INavigationPolicy<WorkspaceSvg>
{
  /**
   * Returns the first child of the given workspace.
   *
   * @param current The workspace to return the first child of.
   * @returns The top block of the first block stack, if any.
   */
  getFirstChild(current: WorkspaceSvg): INavigable<unknown> | null {
    const blocks = current.getTopBlocks(true);
    if (!blocks.length) return null;
    const block = blocks[0];
    let topConnection = block.outputConnection;
    if (
      !topConnection ||
      (block.previousConnection && block.previousConnection.isConnected())
    ) {
      topConnection = block.previousConnection;
    }
    return topConnection ?? block;
  }

  /**
   * Returns the parent of the given workspace.
   *
   * @param _current The workspace to return the parent of.
   * @returns Null.
   */
  getParent(_current: WorkspaceSvg): INavigable<unknown> | null {
    return null;
  }

  /**
   * Returns the next sibling of the given workspace.
   *
   * @param _current The workspace to return the next sibling of.
   * @returns Null.
   */
  getNextSibling(_current: WorkspaceSvg): INavigable<unknown> | null {
    return null;
  }

  /**
   * Returns the previous sibling of the given workspace.
   *
   * @param _current The workspace to return the previous sibling of.
   * @returns Null.
   */
  getPreviousSibling(_current: WorkspaceSvg): INavigable<unknown> | null {
    return null;
  }
}
