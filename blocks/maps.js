/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Map blocks for Blockly.
 * @author toebes@extremenetworks.com (John Toebes)
 */
'use strict';

goog.provide('Blockly.Blocks.maps');

goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.loops');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.maps.HUE = 345;

Blockly.Blocks['maps_create_empty'] = {
  /**
   * Block for creating an empty list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "id": "maps_create_empty",
      "message0": Blockly.Msg.MAPS_CREATE_EMPTY_TITLE,
      "args0": [],
      "inputsInline": true,
      "output": "Map",
      "colour": Blockly.Blocks.maps.HUE,
      "tooltip": Blockly.Msg.MAPS_CREATE_EMPTY_TOOLTIP,
      "helpUrl": Blockly.Msg.MAPS_CREATE_EMPTY_HELPURL
    });
  },
  typeblock: Blockly.Msg.MAPS_CREATE_EMPTY_TYPEBLOCK
};


Blockly.Blocks['maps_create_with'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MAPS_CREATE_WITH_HELPURL);
    this.setColour(Blockly.Blocks.maps.HUE);
    if (this.workspace.options.useMutators) {
      this.setMutator(new Blockly.Mutator(['maps_create_with_item']));
    } else {
      this.appendAddSubGroup(Blockly.Msg.MAPS_CREATE_WITH_INPUT_WITH, 'items',
                           null,
                           Blockly.Msg.MAPS_CREATE_EMPTY_TITLE);
    }
    this.itemCount_ = 1;
    this.updateShape_();
    this.setOutput(true, 'Map');
    this.setTooltip(Blockly.Msg.MAPS_CREATE_WITH_TOOLTIP);
  },
  getAddSubName: function(name,pos) {
    return 'ADD'+pos;
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock =
        Blockly.Block.obtain(workspace, 'maps_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = Blockly.Block.obtain(workspace, 'maps_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      if (connections[i]) {
        this.getInput('ADD' + i).connection.connect(connections[i]);
      }
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    // Delete everything.
    if (this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else {
      var i = 0;
      while (this.getInput('ADD' + i)) {
        this.removeInput('ADD' + i);
        i++;
      }
    }
    // Rebuild block.
    if (this.itemCount_ == 0) {
      this.appendDummyInput('EMPTY')
          .appendField(Blockly.Msg.MAPS_CREATE_EMPTY_TITLE);
    } else {
      for (var i = 0; i < this.itemCount_; i++) {
        var input = this.appendValueInput('ADD' + i);
        if (i == 0) {
          input.appendField(Blockly.Msg.MAPS_CREATE_WITH_INPUT_WITH);
        }
      }
    }
  },
  typeblock: [
      { entry: Blockly.Msg.MAPS_CREATE_WITH_TYPEBLOCK,
        mutatorAttributes: { items: 2 } }
//      ,{ entry: Blockly.Msg.MAPS_CREATE_EMPTY_TYPEBLOCK,
//        mutatorAttributes: { items: 0 } }
             ]
};

Blockly.Blocks['maps_create_with_container'] = {
  /**
   * Mutator block for list container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.maps.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.MAPS_CREATE_WITH_CONTAINER_TITLE_ADD);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.MAPS_CREATE_WITH_CONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['maps_create_with_item'] = {
  /**
   * Mutator bolck for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.maps.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.MAPS_CREATE_WITH_ITEM_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.MAPS_CREATE_WITH_ITEM_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['maps_length'] = {
  /**
   * Block for Map length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
  "id": "maps_length",
  "message0": Blockly.Msg.MAPS_LENGTH_TITLE,
  "args0": [
    {
      "type": "input_value",
      "name": "MAP",
      "check": "Map"
    }
  ],
  "inputsInline": false,
  "output": "Number",
  "colour": Blockly.Blocks.maps.HUE,
  "tooltip": Blockly.Msg.MAPS_LENGTH_TOOLTIP,
  "helpUrl": Blockly.Msg.MAPS_LENGTH_URL
    });
  },
  typeblock: Blockly.Msg.MAPS_LENGTH_TYPEBLOCK
};

Blockly.Blocks['maps_isempty'] = {
  /**
   * Block for is the list empty?
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
  "id": "maps_isempty",
  "message0": Blockly.Msg.MAPS_ISEMPTY_TITLE,
  "args0": [
    {
      "type": "input_value",
      "name": "MAP",
      "check": "Map"
    }
  ],
  "inputsInline": true,
  "output": "Boolean",
  "colour": Blockly.Blocks.maps.HUE,
  "tooltip": Blockly.Msg.MAPS_ISEMPTY_TOOLTIP,
  "helpUrl": Blockly.Msg.MAPS_ISEMPTY_HELPURL
    });
  },
  typeblock: Blockly.Msg.MAPS_ISEMPTY_TYPEBLOCK
};

Blockly.Blocks['maps_create'] = {
  /**
   * Block for is the list empty?
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
  "id": "maps_create",
  "message0": Blockly.Msg.MAPS_CREATE_TITLE,
  "args0": [
    {
      "type": "input_value",
      "name": "KEY",
      "check": "String"
    },
    {
      "type": "input_value",
      "name": "VAL"
    }
  ],
  "inputsInline": true,
  "output": "Map",
  "colour": Blockly.Blocks.maps.HUE,
  "tooltip": Blockly.Msg.MAPS_CREATE_TOOLTIP,
  "helpUrl": Blockly.Msg.MAPS_CREATE_HELPURL
    });
  },
  typeblock: Blockly.Msg.MAPS_CREATE_TYPEBLOCK
};

Blockly.Blocks['maps_getIndex'] = {
  /**
   * Block for getting element at index.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
  "id": "maps_getIndex",
  "message0": Blockly.Msg.MAPS_GET_INDEX_INPUT_IN_MAP + "%1 %2 %3",
  "args0": [
    {
      "type": "input_value",
      "name": "MAP",
      "check": "Map"
    },
    {
      "type": "field_dropdown",
      "name": "MODE",
      "options": [
        [ Blockly.Msg.LISTS_GET_INDEX_GET,        "GET"        ],
        [ Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE, "GET_REMOVE" ],
        [ Blockly.Msg.LISTS_GET_INDEX_REMOVE,     "REMOVE"     ]
      ]
    },
    {
      "type": "input_value",
      "name": "KEY",
      "check": "String"
    }
  ],
  "inputsInline": true,
  "colour": Blockly.Blocks.maps.HUE,
  "helpUrl": Blockly.Msg.MAPS_GET_INDEX_HELPURL
  });

  this.getField('MODE').setChangeHandler(function(value) {
      var isStatement = (value == 'REMOVE');
      this.sourceBlock_.updateStatement_(isStatement);
    });

    this.updateStatement_(false);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg['MAPS_GET_INDEX_TOOLTIP_' +
        thisBlock.getFieldValue('MODE')];
    });
  },
  /**
   * Create XML to represent whether the block is a statement or a value.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var isStatement = !this.outputConnection;
    container.setAttribute('statement', isStatement);
    return container;
  },
  /**
   * Parse XML to restore the inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var isStatement = (xmlElement.getAttribute('statement') == 'true');
    this.updateStatement_(isStatement);
  },
  /**
   * Switch between a value block and a statement block.
   * @param {boolean} newStatement True if the block should be a statement.
   *     False if the block should be a value.
   * @private
   * @this Blockly.Block
   */
  updateStatement_: function(newStatement) {
    var oldStatement = !this.outputConnection;
    if (newStatement != oldStatement) {
      this.unplug(true, true);
      if (newStatement) {
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      } else {
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setOutput(true);
      }
    }
  },
  typeblock: function() {
    var result = [];
    var modeOptions = ['GET', 'GET_REMOVE', 'REMOVE'];
    for (var modeSlot = 0; modeSlot < modeOptions.length; modeSlot++) {
      var mode = modeOptions[modeSlot];
      result.push({ entry: Blockly.Msg['MAPS_GET_INDEX_'+ mode + '_TYPEBLOCK'],
                      values: { 'MAP': '<block type="variables_get">'+
                                     '<field name="VAR">map</field></block>' },
                      fields: { 'MODE': mode }});
    }
    return result;
  }
};

Blockly.Blocks['maps_setIndex'] = {
  /**
   * Block for setting the element at index.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
  "id": "maps_setindex",
  "message0": Blockly.Msg.MAPS_SET_INDEX_INPUT_IN_MAP + "%1" +
              Blockly.Msg.MAPS_SET_INDEX_SET          + "%2" +
              Blockly.Msg.MAPS_SET_INDEX_INPUT_TO     + "%3",
  "args0": [
    {
      "type": "input_value",
      "name": "MAP",
      "check": "Map"
    },
    {
      "type": "input_value",
      "name": "KEY",
      "check": "String"
    },
    {
      "type": "input_value",
      "name": "VAL"
    }
  ],
  "inputsInline": true,
  "previousStatement": null,
  "nextStatement": null,
  "colour": Blockly.Blocks.maps.HUE,
  "tooltip": Blockly.Msg.MAPS_SET_INDEX_TOOLTIP,
  "helpUrl": Blockly.Msg.MAPS_SET_INDEX_HELPURL
  });
  },
  typeblock: [{ entry: Blockly.Msg.MAPS_SET_INDEX_TYPEBLOCK,
               values: { 'MAP': '<block type="variables_get">'+
                              '<field name="VAR">map</field></block>' }
             }]
};

Blockly.Blocks['maps_keys'] = {
  /**
   * Block for creating an empty list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
  "id": "maps_keys",
  "message0": Blockly.Msg.MAPS_KEYS_TITLE,
  "args0": [
    {
      "type": "input_value",
      "name": "MAP",
      "check": "Map"
    }
  ],
  "inputsInline": true,
  "output": "Array",
      "colour": Blockly.Blocks.maps.HUE,
      "tooltip": Blockly.Msg.MAPS_KEYS_TOOLTIP,
      "helpUrl": Blockly.Msg.MAPS_KEYS_HELPURL
    });
  },
  typeblock: Blockly.Msg.MAPS_KEYS_TYPEBLOCK
};

Blockly.Blocks['controls_forEachKey'] = {
  /**
   * Block for 'for each' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOREACH_KEY_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "LIST",
          "check": "Map"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOREACH_KEY_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOREACH_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  isLoop: true,
  getVars: Blockly.Blocks['controls_forEach'].getVars,
  /**
   * Return all types of variables referenced by this block.
   * @return {!Array.<Object>} List of variable names with their types.
   * @this Blockly.Block
   */
  getVarsTypes: function() {
      var vartypes = {};
      vartypes[this.getFieldValue('VAR')] = ['String'];
      return vartypes;
  },
  renameVar: Blockly.Blocks['controls_forEach'].renameVar,
  customContextMenu: Blockly.Blocks['controls_forEach'].customContextMenu,
  typeblock: Blockly.Msg.CONTROLS_FOREACH_KEY_TYPEBLOCK
};
