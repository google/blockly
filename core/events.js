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

/**
 * Events fired as a result of actions in Blockly's editor.
 * @namespace Blockly.Events
 */
goog.provide('Blockly.Events');

goog.require('goog.array');
goog.require('goog.math.Coordinate');


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
 * Name of event that records a UI change.
 * @const
 */
Blockly.Events.UI = 'ui';

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
 * @param {boolean} forward True if forward (redo), false if backward (undo).
 * @return {!Array.<!Blockly.Events.Abstract>} Array of filtered events.
 */
Blockly.Events.filter = function(queueIn, forward) {
  var queue = goog.array.clone(queueIn);
  if (!forward) {
    // Undo is merged in reverse order.
    queue.reverse();
  }
  var mergedQueue = [];
  var hash = Object.create(null);
  // Merge duplicates.
  for (var i = 0, event; event = queue[i]; i++) {
    if (!event.isNull()) {
      var key = [event.type, event.blockId, event.workspaceId].join(' ');
      var lastEvent = hash[key];
      if (!lastEvent) {
        hash[key] = event;
        mergedQueue.push(event);
      } else if (event.type == Blockly.Events.MOVE) {
        // Merge move events.
        lastEvent.newParentId = event.newParentId;
        lastEvent.newInputName = event.newInputName;
        lastEvent.newCoordinate = event.newCoordinate;
      } else if (event.type == Blockly.Events.CHANGE &&
          event.element == lastEvent.element &&
          event.name == lastEvent.name) {
        // Merge change events.
        lastEvent.newValue = event.newValue;
      } else if (event.type == Blockly.Events.UI &&
          event.element == 'click' &&
          (lastEvent.element == 'commentOpen' ||
           lastEvent.element == 'mutatorOpen' ||
           lastEvent.element == 'warningOpen')) {
        // Merge click events.
        lastEvent.newValue = event.newValue;
      } else {
        // Collision: newer events should merge into this event to maintain order
        hash[key] = event;
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
  for (var i = 1, event; event = queue[i]; i++) {
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
  for (var i = 0, event; event = Blockly.Events.FIRE_QUEUE_[i]; i++) {
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
 * @return {!Array.<string>} List of block IDs.
 * @private
 */
Blockly.Events.getDescendantIds_ = function(block) {
  var ids = [];
  var descendants = block.getDescendants();
  for (var i = 0, descendant; descendant = descendants[i]; i++) {
    ids[i] = descendant.id;
  }
  return ids;
};

/**
 * Decode the JSON into an event.
 * @param {!Object} json JSON representation.
 * @param {!Blockly.Workspace} workspace Target workspace for event.
 * @return {!Blockly.Events.Abstract} The event represented by the JSON.
 */
Blockly.Events.fromJson = function(json, workspace) {
  var event;
  switch (json.type) {
    case Blockly.Events.CREATE:
      event = new Blockly.Events.Create(null);
      break;
    case Blockly.Events.DELETE:
      event = new Blockly.Events.Delete(null);
      break;
    case Blockly.Events.CHANGE:
      event = new Blockly.Events.Change(null, '', '', '', '');
      break;
    case Blockly.Events.MOVE:
      event = new Blockly.Events.Move(null);
      break;
    case Blockly.Events.VAR_CREATE:
      event = new Blockly.Events.VarCreate(null);
      break;
    case Blockly.Events.VAR_DELETE:
      event = new Blockly.Events.VarDelete(null);
      break;
    case Blockly.Events.VAR_RENAME:
      event = new Blockly.Events.VarRename(null, '');
      break;
    case Blockly.Events.UI:
      event = new Blockly.Events.Ui(null);
      break;
    default:
      throw 'Unknown event type.';
  }
  event.fromJson(json);
  event.workspaceId = workspace.id;
  return event;
};

/**
 * Abstract class for an event.
 * @param {Blockly.Block|Blockly.VariableModel} elem The block or variable.
 * @constructor
 */
Blockly.Events.Abstract = function(elem) {
  /**
   * The block id for the block this event pertains to, if appropriate for the
   * event type.
   * @type {string|undefined}
   */
  this.blockId = undefined;

  /**
   * The variable id for the variable this event pertains to. Only set in
   * VarCreate, VarDelete, and VarRename events.
   * @type {string|undefined}
   */
  this.varId = undefined;

  /**
   * The workspace identifier for this event.
   * @type {string|undefined}
   */
  this.workspaceId = undefined;

  /**
   * The event group id for the group this event belongs to. Groups define
   * events that should be treated as an single action from the user's
   * perspective, and should be undone together.
   * @type {string}
   */
  this.group = undefined;

  /**
   * Sets whether the event should be added to the undo stack.
   * @type {boolean}
   */
  this.recordUndo = undefined;

  if (elem instanceof Blockly.Block) {
    this.blockId = elem.id;
    this.workspaceId = elem.workspace.id;
  } else if (elem instanceof Blockly.VariableModel) {
    this.workspaceId = elem.workspace.id;
    this.varId = elem.getId();
  }
  this.group = Blockly.Events.group_;
  this.recordUndo = Blockly.Events.recordUndo;
};

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Abstract.prototype.toJson = function() {
  var json = {
    'type': this.type
  };
  if (this.blockId) {
    json['blockId'] = this.blockId;
  }
  if (this.varId) {
    json['varId'] = this.varId;
  }
  if (this.group) {
    json['group'] = this.group;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Abstract.prototype.fromJson = function(json) {
  this.blockId = json['blockId'];
  this.varId = json['varId'];
  this.group = json['group'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if null, false if something changed.
 */
Blockly.Events.Abstract.prototype.isNull = function() {
  return false;
};

/**
 * Run an event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Abstract.prototype.run = function(
    /* eslint-disable no-unused-vars */ forward
    /* eslint-enable no-unused-vars */) {
  // Defined by subclasses.
};

/**
 * Get workspace the event belongs to.
 * @return {Blockly.Workspace} The workspace the event belongs to.
 * @throws {Error} if workspace is null.
 * @private
 */
Blockly.Events.Abstract.prototype.getEventWorkspace_ = function() {
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  if (!workspace) {
    throw Error('Workspace is null. Event must have been generated from real' +
      ' Blockly events.');
  }
  return workspace;
};

/**
 * Class for a block creation event.
 * @param {Blockly.Block} block The created block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Create = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Create.superClass_.constructor.call(this, block);

  if (block.workspace.rendered) {
    this.xml = Blockly.Xml.blockToDomWithXY(block);
  } else {
    this.xml = Blockly.Xml.blockToDom(block);
  }
  this.ids = Blockly.Events.getDescendantIds_(block);
};
goog.inherits(Blockly.Events.Create, Blockly.Events.Abstract);

/**
 * Class for a block creation event.
 * @param {Blockly.Block} block The created block. Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockCreate = Blockly.Events.Create;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Create.prototype.type = Blockly.Events.CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Create.prototype.toJson = function() {
  var json = Blockly.Events.Create.superClass_.toJson.call(this);
  json['xml'] = Blockly.Xml.domToText(this.xml);
  json['ids'] = this.ids;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Create.prototype.fromJson = function(json) {
  Blockly.Events.Create.superClass_.fromJson.call(this, json);
  this.xml = Blockly.Xml.textToDom('<xml>' + json['xml'] + '</xml>').firstChild;
  this.ids = json['ids'];
};

/**
 * Run a creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Create.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    var xml = goog.dom.createDom('xml');
    xml.appendChild(this.xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  } else {
    for (var i = 0, id; id = this.ids[i]; i++) {
      var block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false, false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't uncreate non-existent block: " + id);
      }
    }
  }
};

/**
 * Class for a block deletion event.
 * @param {Blockly.Block} block The deleted block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Delete = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  if (block.getParent()) {
    throw 'Connected blocks cannot be deleted.';
  }
  Blockly.Events.Delete.superClass_.constructor.call(this, block);

  if (block.workspace.rendered) {
    this.oldXml = Blockly.Xml.blockToDomWithXY(block);
  } else {
    this.oldXml = Blockly.Xml.blockToDom(block);
  }
  this.ids = Blockly.Events.getDescendantIds_(block);
};
goog.inherits(Blockly.Events.Delete, Blockly.Events.Abstract);

/**
 * Class for a block deletion event.
 * @param {Blockly.Block} block The deleted block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockDelete = Blockly.Events.Delete;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Delete.prototype.type = Blockly.Events.DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Delete.prototype.toJson = function() {
  var json = Blockly.Events.Delete.superClass_.toJson.call(this);
  json['ids'] = this.ids;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Delete.prototype.fromJson = function(json) {
  Blockly.Events.Delete.superClass_.fromJson.call(this, json);
  this.ids = json['ids'];
};

/**
 * Run a deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Delete.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    for (var i = 0, id; id = this.ids[i]; i++) {
      var block = workspace.getBlockById(id);
      if (block) {
        block.dispose(false, false);
      } else if (id == this.blockId) {
        // Only complain about root-level block.
        console.warn("Can't delete non-existent block: " + id);
      }
    }
  } else {
    var xml = goog.dom.createDom('xml');
    xml.appendChild(this.oldXml);
    Blockly.Xml.domToWorkspace(xml, workspace);
  }
};

/**
 * Class for a block change event.
 * @param {Blockly.Block} block The changed block.  Null for a blank event.
 * @param {string} element One of 'field', 'comment', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {*} oldValue Previous value of element.
 * @param {*} newValue New value of element.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Change = function(block, element, name, oldValue, newValue) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Change.superClass_.constructor.call(this, block);
  this.element = element;
  this.name = name;
  this.oldValue = oldValue;
  this.newValue = newValue;
};
goog.inherits(Blockly.Events.Change, Blockly.Events.Abstract);

/**
 * Class for a block change event.
 * @param {Blockly.Block} block The changed block.  Null for a blank event.
 * @param {string} element One of 'field', 'comment', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {*} oldValue Previous value of element.
 * @param {*} newValue New value of element.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockChange = Blockly.Events.Change;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Change.prototype.type = Blockly.Events.CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Change.prototype.toJson = function() {
  var json = Blockly.Events.Change.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.name) {
    json['name'] = this.name;
  }
  json['newValue'] = this.newValue;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Change.prototype.fromJson = function(json) {
  Blockly.Events.Change.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.name = json['name'];
  this.newValue = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} True if something changed.
 */
Blockly.Events.Change.prototype.isNull = function() {
  return this.oldValue == this.newValue;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Change.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't change non-existent block: " + this.blockId);
    return;
  }
  if (block.mutator) {
    // Close the mutator (if open) since we don't want to update it.
    block.mutator.setVisible(false);
  }
  var value = forward ? this.newValue : this.oldValue;
  switch (this.element) {
    case 'field':
      var field = block.getField(this.name);
      if (field) {
        // Run the validator for any side-effects it may have.
        // The validator's opinion on validity is ignored.
        field.callValidator(value);
        field.setValue(value);
      } else {
        console.warn("Can't set non-existent field: " + this.name);
      }
      break;
    case 'comment':
      block.setCommentText(value || null);
      break;
    case 'collapsed':
      block.setCollapsed(value);
      break;
    case 'disabled':
      block.setDisabled(value);
      break;
    case 'inline':
      block.setInputsInline(value);
      break;
    case 'mutation':
      var oldMutation = '';
      if (block.mutationToDom) {
        var oldMutationDom = block.mutationToDom();
        oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
      }
      if (block.domToMutation) {
        value = value || '<mutation></mutation>';
        var dom = Blockly.Xml.textToDom('<xml>' + value + '</xml>');
        block.domToMutation(dom.firstChild);
      }
      Blockly.Events.fire(new Blockly.Events.Change(
          block, 'mutation', null, oldMutation, value));
      break;
    default:
      console.warn('Unknown change type: ' + this.element);
  }
};

/**
 * Class for a block move event.  Created before the move.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Move = function(block) {
  if (!block) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.Move.superClass_.constructor.call(this, block);
  var location = this.currentLocation_();
  this.oldParentId = location.parentId;
  this.oldInputName = location.inputName;
  this.oldCoordinate = location.coordinate;
};
goog.inherits(Blockly.Events.Move, Blockly.Events.Abstract);


/**
 * Class for a block move event.  Created before the move.
 * @param {Blockly.Block} block The moved block.  Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.BlockMove = Blockly.Events.Move;

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Move.prototype.type = Blockly.Events.MOVE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Move.prototype.toJson = function() {
  var json = Blockly.Events.Move.superClass_.toJson.call(this);
  if (this.newParentId) {
    json['newParentId'] = this.newParentId;
  }
  if (this.newInputName) {
    json['newInputName'] = this.newInputName;
  }
  if (this.newCoordinate) {
    json['newCoordinate'] = Math.round(this.newCoordinate.x) + ',' +
        Math.round(this.newCoordinate.y);
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Move.prototype.fromJson = function(json) {
  Blockly.Events.Move.superClass_.fromJson.call(this, json);
  this.newParentId = json['newParentId'];
  this.newInputName = json['newInputName'];
  if (json['newCoordinate']) {
    var xy = json['newCoordinate'].split(',');
    this.newCoordinate =
        new goog.math.Coordinate(parseFloat(xy[0]), parseFloat(xy[1]));
  }
};

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
  var workspace = Blockly.Workspace.getById(this.workspaceId);
  var block = workspace.getBlockById(this.blockId);
  var location = {};
  var parent = block.getParent();
  if (parent) {
    location.parentId = parent.id;
    var input = parent.getInputWithBlock(block);
    if (input) {
      location.inputName = input.name;
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

/**
 * Run a move event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.Move.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  var block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn("Can't move non-existent block: " + this.blockId);
    return;
  }
  var parentId = forward ? this.newParentId : this.oldParentId;
  var inputName = forward ? this.newInputName : this.oldInputName;
  var coordinate = forward ? this.newCoordinate : this.oldCoordinate;
  var parentBlock = null;
  if (parentId) {
    parentBlock = workspace.getBlockById(parentId);
    if (!parentBlock) {
      console.warn("Can't connect to non-existent block: " + parentId);
      return;
    }
  }
  if (block.getParent()) {
    block.unplug();
  }
  if (coordinate) {
    var xy = block.getRelativeToSurfaceXY();
    block.moveBy(coordinate.x - xy.x, coordinate.y - xy.y);
  } else {
    var blockConnection = block.outputConnection || block.previousConnection;
    var parentConnection;
    if (inputName) {
      var input = parentBlock.getInput(inputName);
      if (input) {
        parentConnection = input.connection;
      }
    } else if (blockConnection.type == Blockly.PREVIOUS_STATEMENT) {
      parentConnection = parentBlock.nextConnection;
    }
    if (parentConnection) {
      blockConnection.connect(parentConnection);
    } else {
      console.warn("Can't connect to non-existent input: " + inputName);
    }
  }
};

/**
 * Class for a UI event.
 * @param {Blockly.Block} block The affected block.
 * @param {string} element One of 'selected', 'comment', 'mutator', etc.
 * @param {*} oldValue Previous value of element.
 * @param {*} newValue New value of element.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Ui = function(block, element, oldValue, newValue) {
  Blockly.Events.Ui.superClass_.constructor.call(this, block);
  this.element = element;
  this.oldValue = oldValue;
  this.newValue = newValue;
  this.recordUndo = false;
};
goog.inherits(Blockly.Events.Ui, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.Ui.prototype.type = Blockly.Events.UI;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.Ui.prototype.toJson = function() {
  var json = Blockly.Events.Ui.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.newValue !== undefined) {
    json['newValue'] = this.newValue;
  }
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.Ui.prototype.fromJson = function(json) {
  Blockly.Events.Ui.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.newValue = json['newValue'];
};

/**
 * Class for a variable creation event.
 * @param {Blockly.VariableModel} variable The created variable.
 *     Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.VarCreate = function(variable) {
  if (!variable) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.VarCreate.superClass_.constructor.call(this, variable);
  this.varType = variable.type;
  this.varName = variable.name;
};
goog.inherits(Blockly.Events.VarCreate, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.VarCreate.prototype.type = Blockly.Events.VAR_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarCreate.prototype.toJson = function() {
  var json = Blockly.Events.VarCreate.superClass_.toJson.call(this);
  json['varType'] = this.varType;
  json['varName'] = this.varName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarCreate.prototype.fromJson = function(json) {
  Blockly.Events.VarCreate.superClass_.fromJson.call(this, json);
  this.varType = json['varType'];
  this.varName = json['varName'];
};

/**
 * Run a variable creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.VarCreate.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.createVariable(this.varName, this.varType, this.varId);
  } else {
    workspace.deleteVariableById(this.varId);
  }
};

/**
 * Class for a variable deletion event.
 * @param {Blockly.VariableModel} variable The deleted variable.
 *     Null for a blank event.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.VarDelete = function(variable) {
  if (!variable) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.VarDelete.superClass_.constructor.call(this, variable);
  this.varType = variable.type;
  this.varName = variable.name;
};
goog.inherits(Blockly.Events.VarDelete, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.VarDelete.prototype.type = Blockly.Events.VAR_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarDelete.prototype.toJson = function() {
  var json = Blockly.Events.VarDelete.superClass_.toJson.call(this);
  json['varType'] = this.varType;
  json['varName'] = this.varName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarDelete.prototype.fromJson = function(json) {
  Blockly.Events.VarDelete.superClass_.fromJson.call(this, json);
  this.varType = json['varType'];
  this.varName = json['varName'];
};

/**
 * Run a variable deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.VarDelete.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.deleteVariableById(this.varId);
  } else {
    workspace.createVariable(this.varName, this.varType, this.varId);
  }
};

/**
 * Class for a variable rename event.
 * @param {Blockly.VariableModel} variable The renamed variable.
 *     Null for a blank event.
 * @param {string} newName The new name the variable will be changed to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.VarRename = function(variable, newName) {
  if (!variable) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.VarRename.superClass_.constructor.call(this, variable);
  this.oldName = variable.name;
  this.newName = newName;
};
goog.inherits(Blockly.Events.VarRename, Blockly.Events.Abstract);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.VarRename.prototype.type = Blockly.Events.VAR_RENAME;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.VarRename.prototype.toJson = function() {
  var json = Blockly.Events.VarRename.superClass_.toJson.call(this);
  json['oldName'] = this.oldName;
  json['newName'] = this.newName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.VarRename.prototype.fromJson = function(json) {
  Blockly.Events.VarRename.superClass_.fromJson.call(this, json);
  this.oldName = json['oldName'];
  this.newName = json['newName'];
};

/**
 * Run a variable rename event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.VarRename.prototype.run = function(forward) {
  var workspace = this.getEventWorkspace_();
  if (forward) {
    workspace.renameVariableById(this.varId, this.newName);
  } else {
    workspace.renameVariableById(this.varId, this.oldName);
  }
};

/**
 * Enable/disable a block depending on whether it is properly connected.
 * Use this on applications where all blocks should be connected to a top block.
 * Recommend setting the 'disable' option to 'false' in the config so that
 * users don't try to reenable disabled orphan blocks.
 * @param {!Blockly.Events.Abstract} event Custom data for event.
 */
Blockly.Events.disableOrphans = function(event) {
  if (event.type == Blockly.Events.MOVE ||
      event.type == Blockly.Events.CREATE) {
    var workspace = Blockly.Workspace.getById(event.workspaceId);
    var block = workspace.getBlockById(event.blockId);
    if (block) {
      if (block.getParent() && !block.getParent().disabled) {
        var children = block.getDescendants();
        for (var i = 0, child; child = children[i]; i++) {
          child.setDisabled(false);
        }
      } else if ((block.outputConnection || block.previousConnection) &&
                 !workspace.isDragging()) {
        do {
          block.setDisabled(true);
          block = block.getNextBlock();
        } while (block);
      }
    }
  }
};
