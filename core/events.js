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
 * Create a custom event and fire it.
 * @param {Object} detail Custom data for event.
 */
Blockly.Events.fire = function(detail) {
  if (!Blockly.Events.isEnabled()) {
    return;  // No events allowed.
  }
  console.log(detail);
  var workspace = Blockly.Workspace.getById(detail.workspaceId);
  if (workspace.rendered) {
    // Create a custom event in a browser-compatible way.
    if (typeof CustomEvent == 'function') {
      // W3
      var evt = new CustomEvent('blocklyWorkspaceChange', {'detail': detail});
    } else {
      // MSIE
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(eventName, false, false, detail);
    }
    workspace.getCanvas().dispatchEvent(evt);
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
 * Abstract class for a change event.
 * @constructor
 */
Blockly.Events.Abstract = function() {};

/**
 * Class for a block creation event.
 * @param {!Blockly.Workspace} workspace The workspace.
 * @param {!Element} xml XML DOM.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Create = function(workspace, xml) {
  this.type = Blockly.Events.CREATE;
  this.workspaceId = workspace.id;
  this.xml = xml;
};
goog.inherits(Blockly.Events.Create, Blockly.Events.Abstract);

/**
 * Class for a block deletion event.
 * @param {!Blockly.Block} block The deleted block.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Delete = function(block) {
  this.type = Blockly.Events.DELETE;
  this.workspaceId = block.workspace.id;
  this.blockId = block.id;
  this.oldXml = Blockly.Xml.blockToDom(block);
  var parent = block.getParent();
  if (parent) {
    this.oldParentId = parent.id;
    this.oldInput = getInputWithBlock(block).name
  }
};
goog.inherits(Blockly.Events.Delete, Blockly.Events.Abstract);

/**
 * Class for a block change event.
 * @param {!Blockly.Block} block The deleted block.
 * @param {string} element One of 'field', 'comment', 'disabled', etc.
 * @param {?string} name Name of input or field affected, or null.
 * @param {string} oldValue Previous value of element.
 * @param {string} newValue New value of element.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.Change = function(block, element, name, oldValue, newValue) {
  this.type = Blockly.Events.CHANGE;
  this.workspaceId = block.workspace.id;
  this.blockId = block.id;
  this.element = element;
  this.name = name;
  this.oldValue = oldValue;
  this.newValue = newValue;
};
goog.inherits(Blockly.Events.Create, Blockly.Events.Abstract);
