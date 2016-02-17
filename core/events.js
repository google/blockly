/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Events fired as a result of actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events');


/**
 * Group ID for new events.  Grouped events are indivisible.
 * @type {string}
 */
Blockly.Events.group = '';

/**
 * Allow change events to be created and fired.
 * @type {number}
 * @private
 */
Blockly.Events.disabled_ = 0;

/**
 * Name of event that creates a block.
 * @const
 */
Blockly.Events.CREATE = 'create';

/**
 * Name of event that deletes a block.
 * @const
 */
Blockly.Events.DELETE = 'delete';

/**
 * Name of event that changes a block.
 * @const
 */
Blockly.Events.CHANGE = 'change';

/**
 * Name of event that moves a block.
 * @const
 */
Blockly.Events.MOVE = 'move';

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
  if (Blockly.Events.FIRE_QUEUE_.length == 0) {
    // Schedule a firing of the event queue.
    setTimeout(Blockly.Events.fireNow_, 0);
  }
  Blockly.Events.FIRE_QUEUE_.push(event);
};

/**
 * Fire all queued events.
 * @private
 */
Blockly.Events.fireNow_ = function() {
  var queue = Blockly.Events.filter_(Blockly.Events.FIRE_QUEUE_);
  Blockly.Events.FIRE_QUEUE_.length = 0;
  for (var i = 0, event; event = queue[i]; i++) {
    var workspace = Blockly.Workspace.getById(event.workspaceId);
    if (workspace) {
      workspace.fireChangeListener(event);
    }
  }
};

/**
 * Filter the queued events and merge duplicates.
 * @param {!Array.<!Blockly.Events.Abstract>} queueIn Array of events.
 * @return {!Array.<!Blockly.Events.Abstract>} Array of filtered events.
 * @private
 */
Blockly.Events.filter_ = function(queueIn) {
  var queue = goog.array.clone(queueIn);
  // Merge duplicates.  O(n^2), but n should be very small.
  for (var i = 0, event1; event1 = queue[i]; i++) {
    for (var j = i + 1, event2; event2 = queue[j]; j++) {
      if (event1.type == Blockly.Events.MOVE &&
          event2.type == Blockly.Events.MOVE &&
          event1.blockId == event2.blockId) {
        // Merge move events.
        event1.newParentId = event2.newParentId;
        event1.newInputName = event2.newInputName;
        event1.newCoordinate = event2.newCoordinate;
        queue.splice(j, 1);
        j--;
      } else if (event1.type == Blockly.Events.CHANGE &&
          event2.type == Blockly.Events.CHANGE &&
          event1.blockId == event2.blockId &&
          event1.element == event2.element &&
          event1.name == event2.name) {
        // Merge change events.
        event1.newValue = event2.newValue;
        queue.splice(j, 1);
        j--;
      }
    }
  }
  // Remove null events.
  for (var i = queue.length - 1; i >= 0; i--) {
    if (queue[i].isNull()) {
      queue.splice(i, 1);
    }
  }
  return queue;
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
 * Abstract class for an event.
 * @param {!Blockly.Block} block The block.
 * @constructor
 */
Blockly.Events.Abstract = function(block) {
  if (block.isShadow()) {
    console.error('Creating event for shadow block: ' + block.id);
  }
  this.blockId = block.id;
  this.workspaceId = block.workspace.id;
  this.group = Blockly.Events.group;
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
Blockly.Events.Abstract.prototype.isNull = function() {
  return false;
};

/**
 * Class for a block creation event.
 * @param {!Blockly.Block} block The created block.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Create = function(block) {
  Blockly.Events.Create.superClass_.constructor.call(this, block);
  this.xml = Blockly.Xml.blockToDomWithXY(block);
};
goog.inherits(Blockly.Events.Create, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Create.prototype.type = Blockly.Events.CREATE;

/**
 * Class for a block deletion event.
 * @param {!Blockly.Block} block The deleted block.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Delete = function(block) {
  if (block.getParent()) {
    throw 'Connected blocks cannot be deleted.';
  }
  Blockly.Events.Delete.superClass_.constructor.call(this, block);
  this.oldXml = Blockly.Xml.blockToDomWithXY(block);
};
goog.inherits(Blockly.Events.Delete, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Delete.prototype.type = Blockly.Events.DELETE;

/**
 * Class for a block change event.
 * @param {!Blockly.Block} block The changed block.
 * @param {string} element One of 'field', 'comment', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {string} oldValue Previous value of element.
 * @param {string} newValue New value of element.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Change = function(block, element, name, oldValue, newValue) {
  Blockly.Events.Change.superClass_.constructor.call(this, block);
  this.element = element;
  this.name = name;
  this.oldValue = oldValue;
  this.newValue = newValue;
};
goog.inherits(Blockly.Events.Change, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Change.prototype.type = Blockly.Events.CHANGE;

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
Blockly.Events.Change.prototype.isNull = function() {
  return this.oldValue == this.newValue;
};

/**
 * Class for a block move event.  Created before the move.
 * @param {!Blockly.Block} block The moved block.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Move = function(block) {
  Blockly.Events.Move.superClass_.constructor.call(this, block);
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldCoordinate = location.coordinate;
};
goog.inherits(Blockly.Events.Move, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Move.prototype.type = Blockly.Events.MOVE;

/**
 * Record the block's new location.  Called after the move.
 */
Blockly.Events.Move.prototype.recordNew = function() {
  var location = this.currentLocation_();
  this.newParentId = location.parentId;
  this.newInputName = location.inputName;
  this.newCoordinate = location.coordinate;
};

/**
 * Returns the parentId and input if the block is connected,
 *   or the XY location if disconnected.
 * @return {!Object} Collection of location info.
 * @private
 */
Blockly.Events.Move.prototype.currentLocation_ = function() {
  var block = Blockly.Block.getById(this.blockId);
  var location = {};
  var parent = block.getParent();
  if (parent) {
    location.parentId = parent.id;
    var input = parent.getInputWithBlock(block);
    if (input) {
      location.inputName = input.name
    }
  } else {
    location.coordinate = block.getRelativeToSurfaceXY();
  }
  return location;
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
Blockly.Events.Move.prototype.isNull = function() {
  return this.oldParentId == this.newParentId &&
      this.oldInputName == this.newInputName &&
      goog.math.Coordinate.equals(this.oldCoordinate, this.newCoordinate);
};
