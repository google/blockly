/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.Events.utils

import type {Block} from '../block.js';
import * as common from '../common.js';
import * as registry from '../registry.js';
import * as idGenerator from '../utils/idgenerator.js';
import type {Workspace} from '../workspace.js';
import type {WorkspaceSvg} from '../workspace_svg.js';

import type {Abstract} from './events_abstract.js';
import type {BlockChange} from './events_block_change.js';
import type {BlockCreate} from './events_block_create.js';
import type {BlockMove} from './events_block_move.js';
import type {CommentCreate} from './events_comment_create.js';
import type {CommentMove} from './events_comment_move.js';
import type {ViewportChange} from './events_viewport.js';

/** Group ID for new events.  Grouped events are indivisible. */
let group = '';

/** Sets whether the next event should be added to the undo stack. */
let recordUndo = true;

/**
 * Sets whether events should be added to the undo stack.
 *
 * @param newValue True if events should be added to the undo stack.
 */
export function setRecordUndo(newValue: boolean) {
  recordUndo = newValue;
}

/**
 * Returns whether or not events will be added to the undo stack.
 *
 * @returns True if events will be added to the undo stack.
 */
export function getRecordUndo(): boolean {
  return recordUndo;
}

/** Allow change events to be created and fired. */
let disabled = 0;

/**
 * Name of event that creates a block. Will be deprecated for BLOCK_CREATE.
 */
export const CREATE = 'create';

/**
 * Name of event that creates a block.
 */
export const BLOCK_CREATE = CREATE;

/**
 * Name of event that deletes a block. Will be deprecated for BLOCK_DELETE.
 */
export const DELETE = 'delete';

/**
 * Name of event that deletes a block.
 */
export const BLOCK_DELETE = DELETE;

/**
 * Name of event that changes a block. Will be deprecated for BLOCK_CHANGE.
 */
export const CHANGE = 'change';

/**
 * Name of event that changes a block.
 */
export const BLOCK_CHANGE = CHANGE;

/**
 * Name of event representing an in-progress change to a field of a block, which
 * is expected to be followed by a block change event.
 */
export const BLOCK_FIELD_INTERMEDIATE_CHANGE =
  'block_field_intermediate_change';

/**
 * Name of event that moves a block. Will be deprecated for BLOCK_MOVE.
 */
export const MOVE = 'move';

/**
 * Name of event that moves a block.
 */
export const BLOCK_MOVE = MOVE;

/**
 * Name of event that creates a variable.
 */
export const VAR_CREATE = 'var_create';

/**
 * Name of event that deletes a variable.
 */
export const VAR_DELETE = 'var_delete';

/**
 * Name of event that renames a variable.
 */
export const VAR_RENAME = 'var_rename';

/**
 * Name of generic event that records a UI change.
 */
export const UI = 'ui';

/**
 * Name of event that record a block drags a block.
 */
export const BLOCK_DRAG = 'drag';

/**
 * Name of event that records a change in selected element.
 */
export const SELECTED = 'selected';

/**
 * Name of event that records a click.
 */
export const CLICK = 'click';

/**
 * Name of event that records a marker move.
 */
export const MARKER_MOVE = 'marker_move';

/**
 * Name of event that records a bubble open.
 */
export const BUBBLE_OPEN = 'bubble_open';

/**
 * Name of event that records a trashcan open.
 */
export const TRASHCAN_OPEN = 'trashcan_open';

/**
 * Name of event that records a toolbox item select.
 */
export const TOOLBOX_ITEM_SELECT = 'toolbox_item_select';

/**
 * Name of event that records a theme change.
 */
export const THEME_CHANGE = 'theme_change';

/**
 * Name of event that records a viewport change.
 */
export const VIEWPORT_CHANGE = 'viewport_change';

/**
 * Name of event that creates a comment.
 */
export const COMMENT_CREATE = 'comment_create';

/**
 * Name of event that deletes a comment.
 */
export const COMMENT_DELETE = 'comment_delete';

/**
 * Name of event that changes a comment.
 */
export const COMMENT_CHANGE = 'comment_change';

/**
 * Name of event that moves a comment.
 */
export const COMMENT_MOVE = 'comment_move';

/**
 * Name of event that records a workspace load.
 */
export const FINISHED_LOADING = 'finished_loading';

/**
 * Type of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 */
export type BumpEvent = BlockCreate | BlockMove | CommentCreate | CommentMove;

/**
 * List of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 */
export const BUMP_EVENTS: string[] = [
  BLOCK_CREATE,
  BLOCK_MOVE,
  COMMENT_CREATE,
  COMMENT_MOVE,
];

/** List of events queued for firing. */
const FIRE_QUEUE: Abstract[] = [];

/**
 * Create a custom event and fire it.
 *
 * @param event Custom data for event.
 */
export function fire(event: Abstract) {
  TEST_ONLY.fireInternal(event);
}

/**
 * Private version of fireInternal for stubbing in tests.
 */
function fireInternal(event: Abstract) {
  if (!isEnabled()) {
    return;
  }
  if (!FIRE_QUEUE.length) {
    // First event added; schedule a firing of the event queue.
    try {
      // If we are in a browser context, we want to make sure that the event
      // fires after blocks have been rerendered this frame.
      requestAnimationFrame(() => {
        setTimeout(fireNow, 0);
      });
    } catch (e) {
      // Otherwise we just want to delay so events can be coallesced.
      // requestAnimationFrame will error triggering this.
      setTimeout(fireNow, 0);
    }
  }
  FIRE_QUEUE.push(event);
}

/** Fire all queued events. */
function fireNow() {
  const queue = filter(FIRE_QUEUE, true);
  FIRE_QUEUE.length = 0;
  for (let i = 0, event; (event = queue[i]); i++) {
    if (!event.workspaceId) {
      continue;
    }
    const eventWorkspace = common.getWorkspaceById(event.workspaceId);
    if (eventWorkspace) {
      eventWorkspace.fireChangeListener(event);
    }
  }

  // Post-filter the undo stack to squash and remove any events that result in
  // a null event

  // 1. Determine which workspaces will need to have their undo stacks validated
  const workspaceIds = new Set(queue.map((e) => e.workspaceId));
  for (const workspaceId of workspaceIds) {
    // Only process valid workspaces
    if (!workspaceId) {
      continue;
    }
    const eventWorkspace = common.getWorkspaceById(workspaceId);
    if (!eventWorkspace) {
      continue;
    }

    // Find the last contiguous group of events on the stack
    const undoStack = eventWorkspace.getUndoStack();
    let i;
    let group: string | undefined = undefined;
    for (i = undoStack.length; i > 0; i--) {
      const event = undoStack[i - 1];
      if (event.group === '') {
        break;
      } else if (group === undefined) {
        group = event.group;
      } else if (event.group !== group) {
        break;
      }
    }
    if (!group || i == undoStack.length - 1) {
      // Need a group of two or more events on the stack. Nothing to do here.
      continue;
    }

    // Extract the event group, filter, and add back to the undo stack
    let events = undoStack.splice(i, undoStack.length - i);
    events = filter(events, true);
    undoStack.push(...events);
  }
}

/**
 * Filter the queued events and merge duplicates.
 *
 * @param queueIn Array of events.
 * @param forward True if forward (redo), false if backward (undo).
 * @returns Array of filtered events.
 */
export function filter(queueIn: Abstract[], forward: boolean): Abstract[] {
  let queue = queueIn.slice();
  // Shallow copy of queue.
  if (!forward) {
    // Undo is merged in reverse order.
    queue.reverse();
  }
  const mergedQueue = [];
  const hash = Object.create(null);
  // Merge duplicates.
  for (let i = 0, event; (event = queue[i]); i++) {
    if (!event.isNull()) {
      // Treat all UI events as the same type in hash table.
      const eventType = event.isUiEvent ? UI : event.type;
      // TODO(#5927): Check whether `blockId` exists before accessing it.
      const blockId = (event as AnyDuringMigration).blockId;
      const key = [eventType, blockId, event.workspaceId].join(' ');

      const lastEntry = hash[key];
      const lastEvent = lastEntry ? lastEntry.event : null;
      if (!lastEntry) {
        // Each item in the hash table has the event and the index of that event
        // in the input array.  This lets us make sure we only merge adjacent
        // move events.
        hash[key] = {event, index: i};
        mergedQueue.push(event);
      } else if (event.type === MOVE && lastEntry.index === i - 1) {
        const moveEvent = event as BlockMove;
        // Merge move events.
        lastEvent.newParentId = moveEvent.newParentId;
        lastEvent.newInputName = moveEvent.newInputName;
        lastEvent.newCoordinate = moveEvent.newCoordinate;
        if (moveEvent.reason) {
          if (lastEvent.reason) {
            // Concatenate reasons without duplicates.
            const reasonSet = new Set(
              moveEvent.reason.concat(lastEvent.reason),
            );
            lastEvent.reason = Array.from(reasonSet);
          } else {
            lastEvent.reason = moveEvent.reason;
          }
        }
        lastEntry.index = i;
      } else if (
        event.type === CHANGE &&
        (event as BlockChange).element === lastEvent.element &&
        (event as BlockChange).name === lastEvent.name
      ) {
        const changeEvent = event as BlockChange;
        // Merge change events.
        lastEvent.newValue = changeEvent.newValue;
      } else if (event.type === VIEWPORT_CHANGE) {
        const viewportEvent = event as ViewportChange;
        // Merge viewport change events.
        lastEvent.viewTop = viewportEvent.viewTop;
        lastEvent.viewLeft = viewportEvent.viewLeft;
        lastEvent.scale = viewportEvent.scale;
        lastEvent.oldScale = viewportEvent.oldScale;
      } else if (event.type === CLICK && lastEvent.type === BUBBLE_OPEN) {
        // Drop click events caused by opening/closing bubbles.
      } else {
        // Collision: newer events should merge into this event to maintain
        // order.
        hash[key] = {event, index: i};
        mergedQueue.push(event);
      }
    }
  }
  // Filter out any events that have become null due to merging.
  queue = mergedQueue.filter(function (e) {
    return !e.isNull();
  });
  if (!forward) {
    // Restore undo order.
    queue.reverse();
  }
  // Move mutation events to the top of the queue.
  // Intentionally skip first event.
  for (let i = 1, event; (event = queue[i]); i++) {
    // AnyDuringMigration because:  Property 'element' does not exist on type
    // 'Abstract'.
    if (
      event.type === CHANGE &&
      (event as AnyDuringMigration).element === 'mutation'
    ) {
      queue.unshift(queue.splice(i, 1)[0]);
    }
  }
  return queue;
}

/**
 * Modify pending undo events so that when they are fired they don't land
 * in the undo stack.  Called by Workspace.clearUndo.
 */
export function clearPendingUndo() {
  for (let i = 0, event; (event = FIRE_QUEUE[i]); i++) {
    event.recordUndo = false;
  }
}

/**
 * Stop sending events.  Every call to this function MUST also call enable.
 */
export function disable() {
  disabled++;
}

/**
 * Start sending events.  Unless events were already disabled when the
 * corresponding call to disable was made.
 */
export function enable() {
  disabled--;
}

/**
 * Returns whether events may be fired or not.
 *
 * @returns True if enabled.
 */
export function isEnabled(): boolean {
  return disabled === 0;
}

/**
 * Current group.
 *
 * @returns ID string.
 */
export function getGroup(): string {
  return group;
}

/**
 * Start or stop a group.
 *
 * @param state True to start new group, false to end group.
 *   String to set group explicitly.
 */
export function setGroup(state: boolean | string) {
  TEST_ONLY.setGroupInternal(state);
}

/**
 * Private version of setGroup for stubbing in tests.
 */
function setGroupInternal(state: boolean | string) {
  if (typeof state === 'boolean') {
    group = state ? idGenerator.genUid() : '';
  } else {
    group = state;
  }
}

/**
 * Compute a list of the IDs of the specified block and all its descendants.
 *
 * @param block The root block.
 * @returns List of block IDs.
 * @internal
 */
export function getDescendantIds(block: Block): string[] {
  const ids = [];
  const descendants = block.getDescendants(false);
  for (let i = 0, descendant; (descendant = descendants[i]); i++) {
    ids[i] = descendant.id;
  }
  return ids;
}

/**
 * Decode the JSON into an event.
 *
 * @param json JSON representation.
 * @param workspace Target workspace for event.
 * @returns The event represented by the JSON.
 * @throws {Error} if an event type is not found in the registry.
 */
export function fromJson(
  json: AnyDuringMigration,
  workspace: Workspace,
): Abstract {
  const eventClass = get(json['type']);
  if (!eventClass) throw Error('Unknown event type.');

  return (eventClass as any).fromJson(json, workspace);
}

/**
 * Gets the class for a specific event type from the registry.
 *
 * @param eventType The type of the event to get.
 * @returns The event class with the given type.
 */
export function get(
  eventType: string,
): new (...p1: AnyDuringMigration[]) => Abstract {
  const event = registry.getClass(registry.Type.EVENT, eventType);
  if (!event) {
    throw new Error(`Event type ${eventType} not found in registry.`);
  }
  return event;
}

/**
 * Enable/disable a block depending on whether it is properly connected.
 * Use this on applications where all blocks should be connected to a top block.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to re-enable disabled orphan blocks.
 *
 * @param event Custom data for event.
 */
export function disableOrphans(event: Abstract) {
  if (event.type === MOVE || event.type === CREATE) {
    const blockEvent = event as BlockMove | BlockCreate;
    if (!blockEvent.workspaceId) {
      return;
    }
    const eventWorkspace = common.getWorkspaceById(
      blockEvent.workspaceId,
    ) as WorkspaceSvg;
    if (!blockEvent.blockId) {
      throw new Error('Encountered a blockEvent without a proper blockId');
    }
    let block = eventWorkspace.getBlockById(blockEvent.blockId);
    if (block) {
      // Changing blocks as part of this event shouldn't be undoable.
      const initialUndoFlag = recordUndo;
      try {
        recordUndo = false;
        const parent = block.getParent();
        if (parent && parent.isEnabled()) {
          const children = block.getDescendants(false);
          for (let i = 0, child; (child = children[i]); i++) {
            child.setEnabled(true);
          }
        } else if (
          (block.outputConnection || block.previousConnection) &&
          !eventWorkspace.isDragging()
        ) {
          do {
            block.setEnabled(false);
            block = block.getNextBlock();
          } while (block);
        }
      } finally {
        recordUndo = initialUndoFlag;
      }
    }
  }
}

export const TEST_ONLY = {
  FIRE_QUEUE,
  fireNow,
  fireInternal,
  setGroupInternal,
};
