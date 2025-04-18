/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.common

import type {Block} from './block.js';
import {ISelectable} from './blockly.js';
import {BlockDefinition, Blocks} from './blocks.js';
import type {Connection} from './connection.js';
import {EventType} from './events/type.js';
import * as eventUtils from './events/utils.js';
import type {Workspace} from './workspace.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/** Database of all workspaces. */
const WorkspaceDB_ = Object.create(null);

/**
 * Find the workspace with the specified ID.
 *
 * @param id ID of workspace to find.
 * @returns The sought after workspace or null if not found.
 */
export function getWorkspaceById(id: string): Workspace | null {
  return WorkspaceDB_[id] || null;
}

/**
 * Find all workspaces.
 *
 * @returns Array of workspaces.
 */
export function getAllWorkspaces(): Workspace[] {
  const workspaces = [];
  for (const workspaceId in WorkspaceDB_) {
    workspaces.push(WorkspaceDB_[workspaceId]);
  }
  return workspaces;
}

/**
 * Register a workspace in the workspace db.
 *
 * @param workspace
 */
export function registerWorkspace(workspace: Workspace) {
  WorkspaceDB_[workspace.id] = workspace;
}

/**
 * Unregister a workspace from the workspace db.
 *
 * @param workspace
 */
export function unregisterWorkpace(workspace: Workspace) {
  delete WorkspaceDB_[workspace.id];
}

/**
 * The main workspace most recently used.
 * Set by Blockly.WorkspaceSvg.prototype.markFocused
 */
let mainWorkspace: Workspace;

/**
 * Returns the last used top level workspace (based on focus).  Try not to use
 * this function, particularly if there are multiple Blockly instances on a
 * page.
 *
 * @returns The main workspace.
 */
export function getMainWorkspace(): Workspace {
  return mainWorkspace;
}

/**
 * Sets last used main workspace.
 *
 * @param workspace The most recently used top level workspace.
 */
export function setMainWorkspace(workspace: Workspace) {
  mainWorkspace = workspace;
}

/**
 * Currently selected copyable object.
 */
let selected: ISelectable | null = null;

/**
 * Returns the currently selected copyable object.
 */
export function getSelected(): ISelectable | null {
  return selected;
}

/**
 * Sets the currently selected block. This function does not visually mark the
 * block as selected or fire the required events. If you wish to
 * programmatically select a block, use `BlockSvg#select`.
 *
 * @param newSelection The newly selected block.
 * @internal
 */
export function setSelected(newSelection: ISelectable | null) {
  if (selected === newSelection) return;

  const event = new (eventUtils.get(EventType.SELECTED))(
    selected?.id ?? null,
    newSelection?.id ?? null,
    newSelection?.workspace.id ?? selected?.workspace.id ?? '',
  );
  eventUtils.fire(event);

  selected?.unselect();
  selected = newSelection;
  selected?.select();
}

/**
 * Container element in which to render the WidgetDiv, DropDownDiv and Tooltip.
 */
let parentContainer: Element | null;

/**
 * Get the container element in which to render the WidgetDiv, DropDownDiv and
 * Tooltip.
 *
 * @returns The parent container.
 */
export function getParentContainer(): Element | null {
  return parentContainer;
}

/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first `Blockly.inject`.
 *
 * @param newParent The container element.
 */
export function setParentContainer(newParent: Element) {
  parentContainer = newParent;
}

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See workspace.resizeContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 *
 * @param workspace Any workspace in the SVG.
 */
export function svgResize(workspace: WorkspaceSvg) {
  let mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  const svg = mainWorkspace.getParentSvg();
  const cachedSize = mainWorkspace.getCachedParentSvgSize();
  const div = svg.parentElement;
  if (!(div instanceof HTMLElement)) {
    // Workspace deleted, or something.
    return;
  }

  const width = div.offsetWidth;
  const height = div.offsetHeight;
  if (cachedSize.width !== width) {
    svg.setAttribute('width', width + 'px');
    mainWorkspace.setCachedParentSvgSize(width, null);
  }
  if (cachedSize.height !== height) {
    svg.setAttribute('height', height + 'px');
    mainWorkspace.setCachedParentSvgSize(null, height);
  }
  mainWorkspace.resize();
}

/**
 * All of the connections on blocks that are currently being dragged.
 */
export const draggingConnections: Connection[] = [];

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 *
 * @param block The block to map.
 * @param opt_stripFollowing Optionally ignore all following
 *    statements (blocks that are not inside a value or statement input
 *    of the block).
 * @returns Map of types to type counts for descendants of the bock.
 */
export function getBlockTypeCounts(
  block: Block,
  opt_stripFollowing?: boolean,
): {[key: string]: number} {
  const typeCountsMap = Object.create(null);
  const descendants = block.getDescendants(true);
  if (opt_stripFollowing) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
      const index = descendants.indexOf(nextBlock);
      descendants.splice(index, descendants.length - index);
    }
  }
  for (let i = 0, checkBlock; (checkBlock = descendants[i]); i++) {
    if (typeCountsMap[checkBlock.type]) {
      typeCountsMap[checkBlock.type]++;
    } else {
      typeCountsMap[checkBlock.type] = 1;
    }
  }
  return typeCountsMap;
}

/**
 * Helper function for defining a block from JSON.  The resulting function has
 * the correct value of jsonDef at the point in code where jsonInit is called.
 *
 * @param jsonDef The JSON definition of a block.
 * @returns A function that calls jsonInit with the correct value
 *     of jsonDef.
 */
function jsonInitFactory(jsonDef: AnyDuringMigration): () => void {
  return function (this: Block) {
    this.jsonInit(jsonDef);
  };
}

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 *
 * @param jsonArray An array of JSON block definitions.
 */
export function defineBlocksWithJsonArray(jsonArray: AnyDuringMigration[]) {
  TEST_ONLY.defineBlocksWithJsonArrayInternal(jsonArray);
}

/**
 * Private version of defineBlocksWithJsonArray for stubbing in tests.
 */
function defineBlocksWithJsonArrayInternal(jsonArray: AnyDuringMigration[]) {
  defineBlocks(createBlockDefinitionsFromJsonArray(jsonArray));
}

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 *
 * @param jsonArray An array of JSON block definitions.
 * @returns A map of the block
 *     definitions created.
 */
export function createBlockDefinitionsFromJsonArray(
  jsonArray: AnyDuringMigration[],
): {[key: string]: BlockDefinition} {
  const blocks: {[key: string]: BlockDefinition} = {};
  for (let i = 0; i < jsonArray.length; i++) {
    const elem = jsonArray[i];
    if (!elem) {
      console.warn(`Block definition #${i} in JSON array is ${elem}. Skipping`);
      continue;
    }
    const type = elem['type'];
    if (!type) {
      console.warn(
        `Block definition #${i} in JSON array is missing a type attribute. ` +
          'Skipping.',
      );
      continue;
    }
    blocks[type] = {init: jsonInitFactory(elem)};
  }
  return blocks;
}

/**
 * Add the specified block definitions to the block definitions
 * dictionary (Blockly.Blocks).
 *
 * @param blocks A map of block
 *     type names to block definitions.
 */
export function defineBlocks(blocks: {[key: string]: BlockDefinition}) {
  // Iterate over own enumerable properties.
  for (const type of Object.keys(blocks)) {
    const definition = blocks[type];
    if (type in Blocks) {
      console.warn(
        `Block definition "${type}" overwrites previous definition.`,
      );
    }
    Blocks[type] = definition;
  }
}

export const TEST_ONLY = {defineBlocksWithJsonArrayInternal};
