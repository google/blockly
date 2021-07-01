/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Events fired as a result of actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Events fired as a result of actions in Blockly's editor.
 * @namespace Blockly.Events
 */
goog.provide('Blockly.Events');

goog.require('Blockly.registry');
goog.require('Blockly.utils');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.Events.Abstract');
goog.requireType('Blockly.Workspace');


/**
 * Group ID for new events.  Grouped events are indivisible.
 * @type {string}
 * @private
 */
Blockly.Events.group_ = '';

/**
 * Sets whether the next event should be added to the undo stack.
 * @type {boolean}
 */
Blockly.Events.recordUndo = true;

/**
 * Allow change events to be created and fired.
 * @type {number}
 * @private
 */
Blockly.Events.disabled_ = 0;

/**
 * Name of event that creates a block. Will be deprecated for BLOCK_CREATE.
 * @const
 */
Blockly.Events.CREATE = 'create';

/**
 * Name of event that creates a block.
 * @const
 */
Blockly.Events.BLOCK_CREATE = Blockly.Events.CREATE;

/**
 * Name of event that deletes a block. Will be deprecated for BLOCK_DELETE.
 * @const
 */
Blockly.Events.DELETE = 'delete';

/**
 * Name of event that deletes a block.
 * @const
 */
Blockly.Events.BLOCK_DELETE = Blockly.Events.DELETE;

/**
 * Name of event that changes a block. Will be deprecated for BLOCK_CHANGE.
 * @const
 */
Blockly.Events.CHANGE = 'change';

/**
 * Name of event that changes a block.
 * @const
 */
Blockly.Events.BLOCK_CHANGE = Blockly.Events.CHANGE;

/**
 * Name of event that moves a block. Will be deprecated for BLOCK_MOVE.
 * @const
 */
Blockly.Events.MOVE = 'move';

/**
 * Name of event that moves a block.
 * @const
 */
Blockly.Events.BLOCK_MOVE = Blockly.Events.MOVE;

/**
 * Name of event that creates a variable.
 * @const
 */
Blockly.Events.VAR_CREATE = 'var_create';

/**
 * Name of event that deletes a variable.
 * @const
 */
Blockly.Events.VAR_DELETE = 'var_delete';

/**
 * Name of event that renames a variable.
 * @const
 */
Blockly.Events.VAR_RENAME = 'var_rename';

/**
 * Name of generic event that records a UI change.
 * @const
 */
Blockly.Events.UI = 'ui';

/**
 * Name of event that record a block drags a block.
 * @const
 */
Blockly.Events.BLOCK_DRAG = 'drag';

/**
 * Name of event that records a change in selected element.
 * @const
 */
Blockly.Events.SELECTED = 'selected';

/**
 * Name of event that records a click.
 * @const
 */
Blockly.Events.CLICK = 'click';

/**
 * Name of event that records a marker move.
 * @const
 */
Blockly.Events.MARKER_MOVE = 'marker_move';

/**
 * Name of event that records a bubble open.
 * @const
 */
Blockly.Events.BUBBLE_OPEN = 'bubble_open';

/**
 * Name of event that records a trashcan open.
 * @const
 */
Blockly.Events.TRASHCAN_OPEN = 'trashcan_open';

/**
 * Name of event that records a toolbox item select.
 * @const
 */
Blockly.Events.TOOLBOX_ITEM_SELECT = 'toolbox_item_select';

/**
 * Name of event that records a theme change.
 * @const
 */
Blockly.Events.THEME_CHANGE = 'theme_change';

/**
 * Name of event that records a viewport change.
 * @const
 */
Blockly.Events.VIEWPORT_CHANGE = 'viewport_change';

/**
 * Name of event that creates a comment.
 * @const
 */
Blockly.Events.COMMENT_CREATE = 'comment_create';

/**
 * Name of event that deletes a comment.
 * @const
 */
Blockly.Events.COMMENT_DELETE = 'comment_delete';

/**
 * Name of event that changes a comment.
 * @const
 */
Blockly.Events.COMMENT_CHANGE = 'comment_change';

/**
 * Name of event that moves a comment.
 * @const
 */
Blockly.Events.COMMENT_MOVE = 'comment_move';

/**
 * Name of event that records a workspace load.
 */
Blockly.Events.FINISHED_LOADING = 'finished_loading';

/**
 * Type of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 * @typedef {!Blockly.Events.BlockCreate|!Blockly.Events.BlockMove|
 * !Blockly.Events.CommentCreate|!Blockly.Events.CommentMove}
 */
Blockly.Events.BumpEvent;

/**
 * List of events that cause objects to be bumped back into the visible
 * portion of the workspace.
 *
 * Not to be confused with bumping so that disconnected connections do not
 * appear connected.
 * @const
 */
Blockly.Events.BUMP_EVENTS = [
  Blockly.Events.BLOCK_CREATE,
  Blockly.Events.BLOCK_MOVE,
  Blockly.Events.COMMENT_CREATE,
  Blockly.Events.COMMENT_MOVE
];

/**
 * List of events queued for firing.
 * @private
 */
Blockly.Events.FIRE_QUEUE_ = [];

/**
 * Create a custom event and fire it.
 * @param {!Blockly.Events.Abstract} event Custom data for event.
 */
Blockly.Events.fire = function(event) {
  if (!Blockly.Events.isEnabled()) {
    return;
  }
  if (!Blockly.Events.FIRE_QUEUE_.length) {
    // First event added; schedule a firing of the event queue.
    setTimeout(Blockly.Events.fireNow_, 0);
  }
  Blockly.Events.FIRE_QUEUE_.push(event);
};

/**
 * Fire all queued events.
 * @private
 */
Blockly.Events.fireNow_ = function() {
  var queue = Blockly.Events.filter(Blockly.Events.FIRE_QUEUE_, true);
  Blockly.Events.FIRE_QUEUE_.length = 0;
  for (var i = 0, event; (event = queue[i]); i++) {
    if (!event.workspaceId) {
      continue;
    }
    var workspace = Blockly.Workspace.getById(event.workspaceId);
    if (workspace) {
      workspace.fireChangeListener(event);
    }
  }
};

/**
 * Filter the queued events and merge duplicates.
 * @param {!Array<!Blockly.Events.Abstract>} queueIn Array of events.
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array<!Blockly.Events.Abstract>} Array of filtered events.
 */
Blockly.Events.filter = function(queueIn, forward) {
  var queue = queueIn.slice();  // Shallow copy of queue.
  if (!forward) {
    // Undo is merged in reverse order.
    queue.reverse();
  }
  var mergedQueue = [];
  var hash = Object.create(null);
  // Merge duplicates.
  for (var i = 0, event; (event = queue[i]); i++) {
    if (!event.isNull()) {
      // Treat all UI events as the same type in hash table.
      var eventType = event.isUiEvent ? Blockly.Events.UI : event.type;
      var key = [eventType, event.blockId, event.workspaceId].join(' ');

      var lastEntry = hash[key];
      var lastEvent = lastEntry ? lastEntry.event : null;
      if (!lastEntry) {
        // Each item in the hash table has the event and the index of that event
        // in the input array.  This lets us make sure we only merge adjacent
        // move events.
        hash[key] = { event: event, index: i};
        mergedQueue.push(event);
      } else if (event.type == Blockly.Events.MOVE &&
          lastEntry.index == i - 1) {
        // Merge move events.
        lastEvent.newParentId = event.newParentId;
        lastEvent.newInputName = event.newInputName;
        lastEvent.newCoordinate = event.newCoordinate;
        lastEntry.index = i;
      } else if (event.type == Blockly.Events.CHANGE &&
          event.element == lastEvent.element &&
          event.name == lastEvent.name) {
        // Merge change events.
        lastEvent.newValue = event.newValue;
      } else if (event.type == Blockly.Events.VIEWPORT_CHANGE) {
        // Merge viewport change events.
        lastEvent.viewTop = event.viewTop;
        lastEvent.viewLeft = event.viewLeft;
        lastEvent.scale = event.scale;
        lastEvent.oldScale = event.oldScale;
      } else if (event.type == Blockly.Events.CLICK &&
          lastEvent.type == Blockly.Events.BUBBLE_OPEN) {
        // Drop click events caused by opening/closing bubbles.
      } else {
        // Collision: newer events should merge into this event to maintain
        // order.
        hash[key] = {event: event, index: i};
        mergedQueue.push(event);
      }
    }
  }
  // Filter out any events that have become null due to merging.
  queue = mergedQueue.filter(function(e) { return !e.isNull(); });
  if (!forward) {
    // Restore undo order.
    queue.reverse();
  }
  // Move mutation events to the top of the queue.
  // Intentionally skip first event.
  for (var i = 1, event; (event = queue[i]); i++) {
    if (event.type == Blockly.Events.CHANGE &&
        event.element == 'mutation') {
      queue.unshift(queue.splice(i, 1)[0]);
    }
  }
  return queue;
};

/**
 * Modify pending undo events so that when they are fired they don't land
 * in the undo stack.  Called by Blockly.Workspace.clearUndo.
 */
Blockly.Events.clearPendingUndo = function() {
  for (var i = 0, event; (event = Blockly.Events.FIRE_QUEUE_[i]); i++) {
    event.recordUndo = false;
  }
};

/**
 * Stop sending events.  Every call to this function MUST also call enable.
 */
Blockly.Events.disable = function() {
  Blockly.Events.disabled_++;
};

/**
 * Start sending events.  Unless events were already disabled when the
 * corresponding call to disable was made.
 */
Blockly.Events.enable = function() {
  Blockly.Events.disabled_--;
};

/**
 * Returns whether events may be fired or not.
 * @return {boolean} True if enabled.
 */
Blockly.Events.isEnabled = function() {
  return Blockly.Events.disabled_ == 0;
};

/**
 * Current group.
 * @return {string} ID string.
 */
Blockly.Events.getGroup = function() {
  return Blockly.Events.group_;
};

/**
 * Start or stop a group.
 * @param {boolean|string} state True to start new group, false to end group.
 *   String to set group explicitly.
 */
Blockly.Events.setGroup = function(state) {
  if (typeof state == 'boolean') {
    Blockly.Events.group_ = state ? Blockly.utils.genUid() : '';
  } else {
    Blockly.Events.group_ = state;
  }
};

/**
 * Compute a list of the IDs of the specified block and all its descendants.
 * @param {!Blockly.Block} block The root block.
 * @return {!Array<string>} List of block IDs.
 * @package
 */
Blockly.Events.getDescendantIds = function(block) {
  var ids = [];
  var descendants = block.getDescendants(false);
  for (var i = 0, descendant; (descendant = descendants[i]); i++) {
    ids[i] = descendant.id;
  }
  return ids;
};

/**
 * Decode the JSON into an event.
 * @param {!Object} json JSON representation.
 * @param {!Blockly.Workspace} workspace Target workspace for event.
 * @return {!Blockly.Events.Abstract} The event represented by the JSON.
 * @throws {Error} if an event type is not found in the registry.
 */
Blockly.Events.fromJson = function(json, workspace) {
  var eventClass = Blockly.Events.get(json.type);
  if (!eventClass) {
    throw Error('Unknown event type.');
  }
  var event = new eventClass();
  event.fromJson(json);
  event.workspaceId = workspace.id;
  return event;
};

/**
 * Gets the class for a specific event type from the registry.
 * @param {string} eventType The type of the event to get.
 * @return {?function(new:Blockly.Events.Abstract, ...?)} The event class with
 *     the given type or null if none exists.
 */
Blockly.Events.get = function(eventType) {
  return Blockly.registry.getClass(Blockly.registry.Type.EVENT, eventType);
};

/**
 * Enable/disable a block depending on whether it is properly connected.
 * Use this on applications where all blocks should be connected to a top block.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to re-enable disabled orphan blocks.
 * @param {!Blockly.Events.Abstract} event Custom data for event.
 */
Blockly.Events.disableOrphans = function(event) {
  if (event.type == Blockly.Events.MOVE ||
      event.type == Blockly.Events.CREATE) {
    if (!event.workspaceId) {
      return;
    }
    var workspace = Blockly.Workspace.getById(event.workspaceId);
    var block = workspace.getBlockById(event.blockId);
    if (block) {
      // Changing blocks as part of this event shouldn't be undoable.
      var initialUndoFlag = Blockly.Events.recordUndo;
      try {
        Blockly.Events.recordUndo = false;
        var parent = block.getParent();
        if (parent && parent.isEnabled()) {
          var children = block.getDescendants(false);
          for (var i = 0, child; (child = children[i]); i++) {
            child.setEnabled(true);
          }
        } else if ((block.outputConnection || block.previousConnection) &&
                  !workspace.isDragging()) {
          do {
            block.setEnabled(false);
            block = block.getNextBlock();
          } while (block);
        }
      } finally {
        Blockly.Events.recordUndo = initialUndoFlag;
      }
    }
  }
};
