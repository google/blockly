/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview List blocks for Blockly.
 * @suppress {checkTypes}
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.libraryBlocks.lists');

import * as fieldRegistry from '../core/field_registry.js';
import * as xmlUtils from '../core/utils/xml.js';
import {Align} from '../core/input.js';
import type {Block} from '../core/block.js';
import type {BlockDefinition} from '../core/blocks.js';
import {ConnectionType} from '../core/connection_type.js';
import type {FieldDropdown} from '../core/field_dropdown.js';
import {Msg} from '../core/msg.js';
import {Mutator} from '../core/mutator.js';
import type {Workspace} from '../core/workspace.js';
import {createBlockDefinitionsFromJsonArray, defineBlocks} from '../core/common.js';
import '../core/field_dropdown.js';


/**
 * A dictionary of the block definitions provided by this module.
 */
export const blocks = createBlockDefinitionsFromJsonArray([
  // Block for creating an empty list
  // The 'list_create_with' block is preferred as it is more flexible.
  // <block type="lists_create_with">
  //   <mutation items="0"></mutation>
  // </block>
  {
    'type': 'lists_create_empty',
    'message0': '%{BKY_LISTS_CREATE_EMPTY_TITLE}',
    'output': 'Array',
    'style': 'list_blocks',
    'tooltip': '%{BKY_LISTS_CREATE_EMPTY_TOOLTIP}',
    'helpUrl': '%{BKY_LISTS_CREATE_EMPTY_HELPURL}',
  },
  // Block for creating a list with one element repeated.
  {
    'type': 'lists_repeat',
    'message0': '%{BKY_LISTS_REPEAT_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'ITEM',
      },
      {
        'type': 'input_value',
        'name': 'NUM',
        'check': 'Number',
      },
    ],
    'output': 'Array',
    'style': 'list_blocks',
    'tooltip': '%{BKY_LISTS_REPEAT_TOOLTIP}',
    'helpUrl': '%{BKY_LISTS_REPEAT_HELPURL}',
  },
  // Block for reversing a list.
  {
    'type': 'lists_reverse',
    'message0': '%{BKY_LISTS_REVERSE_MESSAGE0}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'LIST',
        'check': 'Array',
      },
    ],
    'output': 'Array',
    'inputsInline': true,
    'style': 'list_blocks',
    'tooltip': '%{BKY_LISTS_REVERSE_TOOLTIP}',
    'helpUrl': '%{BKY_LISTS_REVERSE_HELPURL}',
  },
  // Block for checking if a list is empty
  {
    'type': 'lists_isEmpty',
    'message0': '%{BKY_LISTS_ISEMPTY_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': ['String', 'Array'],
      },
    ],
    'output': 'Boolean',
    'style': 'list_blocks',
    'tooltip': '%{BKY_LISTS_ISEMPTY_TOOLTIP}',
    'helpUrl': '%{BKY_LISTS_ISEMPTY_HELPURL}',
  },
  // Block for getting the list length
  {
    'type': 'lists_length',
    'message0': '%{BKY_LISTS_LENGTH_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': ['String', 'Array'],
      },
    ],
    'output': 'Number',
    'style': 'list_blocks',
    'tooltip': '%{BKY_LISTS_LENGTH_TOOLTIP}',
    'helpUrl': '%{BKY_LISTS_LENGTH_HELPURL}',
  },
]);

type CreateWithBlock = Block|typeof blocks['lists_create_with'];

blocks['lists_create_with'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   */
  init: function(this: CreateWithBlock) {
    this.setHelpUrl(Msg['LISTS_CREATE_WITH_HELPURL']);
    this.setStyle('list_blocks');
    this.itemCount_ = 3;
    this.updateShape_();
    this.setOutput(true, 'Array');
    this.setMutator(new Mutator(['lists_create_with_item'], this));
    this.setTooltip(Msg['LISTS_CREATE_WITH_TOOLTIP']);
  },
  /**
   * Create XML to represent list inputs.
   * Backwards compatible serialization implementation.
   */
  mutationToDom: function(this: CreateWithBlock): Element {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * Backwards compatible serialization implementation.
   *
   * @param xmlElement XML storage element.
   */
  domToMutation: function(this: CreateWithBlock, xmlElement: Element) {
    const items = xmlElement.getAttribute('items');
    if (items === null) throw new TypeError('element did not have items');
    this.itemCount_ = parseInt(items, 10);
    this.updateShape_();
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   *
   * @return The state of this block, ie the item count.
   */
  saveExtraState: function(): {itemCount: number} {
    return {
      'itemCount': this.itemCount_,
    };
  },
  /**
   * Applies the given state to this block.
   *
   * @param state The state to apply to this block, ie the item count.
   */
  loadExtraState: function(state: AnyDuringMigration) {
    this.itemCount_ = state['itemCount'];
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   *
   * @param workspace Mutator's workspace.
   * @return Root block in mutator.
   */
  decompose: function(this: CreateWithBlock, workspace: Workspace): Block {
    const containerBlock: ContainerBlock = workspace.newBlock('lists_create_with_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock: ItemBlock = workspace.newBlock('lists_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   *
   * @param containerBlock Root block in mutator.
   */
  compose: function(this: CreateWithBlock, containerBlock: Block) {
    let itemBlock: ItemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    const connections = [];
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock();
        continue;
      }
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.getNextBlock();
    }
    // Disconnect any children that don't belong.
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput('ADD' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (let i = 0; i < this.itemCount_; i++) {
      Mutator.reconnect(connections[i], this, 'ADD' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   *
   * @param containerBlock Root block in mutator.
   */
  saveConnections: function(this: CreateWithBlock, containerBlock: Block) {
    let itemBlock: ItemBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (itemBlock) {
      if (itemBlock.isInsertionMarker()) {
        itemBlock = itemBlock.getNextBlock();
        continue;
      }
      const input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      itemBlock = itemBlock.getNextBlock();
      i++;
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   */
  updateShape_: function(this: CreateWithBlock) {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY').appendField(
          Msg['LISTS_CREATE_EMPTY_TITLE']);
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        const input = this.appendValueInput('ADD' + i).setAlign(Align.RIGHT);
        if (i === 0) {
          input.appendField(Msg['LISTS_CREATE_WITH_INPUT_WITH']);
        }
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
      this.removeInput('ADD' + i);
    }
  },
};

type ContainerBlock = Block|typeof blocks['lists_create_with_container'];

blocks['lists_create_with_container'] = {
  /**
   * Mutator block for list container.
   */
  init: function(this: ContainerBlock) {
    this.setStyle('list_blocks');
    this.appendDummyInput().appendField(
        Msg['LISTS_CREATE_WITH_CONTAINER_TITLE_ADD']);
    this.appendStatementInput('STACK');
    this.setTooltip(Msg['LISTS_CREATE_WITH_CONTAINER_TOOLTIP']);
    this.contextMenu = false;
  },
};

type ItemBlock = Block|typeof blocks['lists_create_with_item'];

blocks['lists_create_with_item'] = {
  /**
   * Mutator block for adding items.
   */
  init: function(this: ItemBlock) {
    this.setStyle('list_blocks');
    this.appendDummyInput().appendField(Msg['LISTS_CREATE_WITH_ITEM_TITLE']);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Msg['LISTS_CREATE_WITH_ITEM_TOOLTIP']);
    this.contextMenu = false;
  },
};

type IndexOfBlock = Block|typeof blocks['lists_indexOf'];

blocks['lists_indexOf'] = {
  /**
   * Block for finding an item in the list.
   */
  init: function(this: IndexOfBlock) {
    const OPERATORS = [
      [Msg['LISTS_INDEX_OF_FIRST'], 'FIRST'],
      [Msg['LISTS_INDEX_OF_LAST'], 'LAST'],
    ];
    this.setHelpUrl(Msg['LISTS_INDEX_OF_HELPURL']);
    this.setStyle('list_blocks');
    this.setOutput(true, 'Number');
    this.appendValueInput('VALUE').setCheck('Array').appendField(
        Msg['LISTS_INDEX_OF_INPUT_IN_LIST']);
    const operatorsDropdown = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: OPERATORS,
    });
    if (operatorsDropdown === null) throw new Error('field_dropdown not found');
    this.appendValueInput('FIND').appendField(operatorsDropdown, 'END');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    const thisBlock = this;
    this.setTooltip(function() {
      return Msg['LISTS_INDEX_OF_TOOLTIP'].replace(
          '%1', thisBlock.workspace.options.oneBasedIndex ? '0' : '-1');
    });
  },
};

type GetIndexBlock = Block|typeof blocks['lists_getIndex'];

blocks['lists_getIndex'] = {
  /**
   * Block for getting element at index.
   */
  init: function(this: GetIndexBlock) {
    const MODE = [
      [Msg['LISTS_GET_INDEX_GET'], 'GET'],
      [Msg['LISTS_GET_INDEX_GET_REMOVE'], 'GET_REMOVE'],
      [Msg['LISTS_GET_INDEX_REMOVE'], 'REMOVE'],
    ];
    this.WHERE_OPTIONS = [
      [Msg['LISTS_GET_INDEX_FROM_START'], 'FROM_START'],
      [Msg['LISTS_GET_INDEX_FROM_END'], 'FROM_END'],
      [Msg['LISTS_GET_INDEX_FIRST'], 'FIRST'],
      [Msg['LISTS_GET_INDEX_LAST'], 'LAST'],
      [Msg['LISTS_GET_INDEX_RANDOM'], 'RANDOM'],
    ];
    this.setHelpUrl(Msg['LISTS_GET_INDEX_HELPURL']);
    this.setStyle('list_blocks');
    const modeMenu = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: MODE,
    }) as FieldDropdown;
    modeMenu.setValidator(
        /** @param value The input value. */
        function(this: FieldDropdown, value: string) {
          const isStatement = (value === 'REMOVE');
          (this.getSourceBlock() as GetIndexBlock).updateStatement_(isStatement);
          return undefined;
        });
    this.appendValueInput('VALUE').setCheck('Array').appendField(
        Msg['LISTS_GET_INDEX_INPUT_IN_LIST']);
    this.appendDummyInput()
        .appendField(modeMenu, 'MODE')
        .appendField('', 'SPACE');
    this.appendDummyInput('AT');
    if (Msg['LISTS_GET_INDEX_TAIL']) {
      this.appendDummyInput('TAIL').appendField(Msg['LISTS_GET_INDEX_TAIL']);
    }
    this.setInputsInline(true);
    this.setOutput(true);
    this.updateAt_(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    const thisBlock = this;
    this.setTooltip(function() {
      const mode = thisBlock.getFieldValue('MODE');
      const where = thisBlock.getFieldValue('WHERE');
      let tooltip = '';
      switch (mode + ' ' + where) {
        case 'GET FROM_START':
        case 'GET FROM_END':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_FROM'];
          break;
        case 'GET FIRST':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_FIRST'];
          break;
        case 'GET LAST':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_LAST'];
          break;
        case 'GET RANDOM':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_RANDOM'];
          break;
        case 'GET_REMOVE FROM_START':
        case 'GET_REMOVE FROM_END':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM'];
          break;
        case 'GET_REMOVE FIRST':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST'];
          break;
        case 'GET_REMOVE LAST':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST'];
          break;
        case 'GET_REMOVE RANDOM':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM'];
          break;
        case 'REMOVE FROM_START':
        case 'REMOVE FROM_END':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM'];
          break;
        case 'REMOVE FIRST':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST'];
          break;
        case 'REMOVE LAST':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST'];
          break;
        case 'REMOVE RANDOM':
          tooltip = Msg['LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM'];
          break;
      }
      if (where === 'FROM_START' || where === 'FROM_END') {
        const msg = (where === 'FROM_START') ?
            Msg['LISTS_INDEX_FROM_START_TOOLTIP'] :
            Msg['LISTS_INDEX_FROM_END_TOOLTIP'];
        tooltip += '  ' +
            msg.replace(
                '%1', thisBlock.workspace.options.oneBasedIndex ? '#1' : '#0');
      }
      return tooltip;
    });
  },
  /**
   * Create XML to represent whether the block is a statement or a value.
   * Also represent whether there is an 'AT' input.
   *
   * @return XML storage element.
   */
  mutationToDom: function(this: GetIndexBlock): Element {
    const container = xmlUtils.createElement('mutation');
    const isStatement = !this.outputConnection;
    container.setAttribute('statement', String(isStatement));
    const isAt = this.getInput('AT').type === ConnectionType.INPUT_VALUE;
    container.setAttribute('at', String(isAt));
    return container;
  },
  /**
   * Parse XML to restore the 'AT' input.
   *
   * @param xmlElement XML storage element.
   */
  domToMutation: function(this: GetIndexBlock, xmlElement: Element) {
    // Note: Until January 2013 this block did not have mutations,
    // so 'statement' defaults to false and 'at' defaults to true.
    const isStatement = (xmlElement.getAttribute('statement') === 'true');
    this.updateStatement_(isStatement);
    const isAt = (xmlElement.getAttribute('at') !== 'false');
    this.updateAt_(isAt);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * Returns null for efficiency if no state is needed (not a statement)
   *
   * @return The state of this block, ie whether it's a statement.
   */
  saveExtraState: function(this: GetIndexBlock): {isStatement: boolean} | null {
    if (!this.outputConnection) {
      return {
        'isStatement': true,
      };
    }
    return null;
  },

  /**
   * Applies the given state to this block.
   *
   * @param state The state to apply to this block, ie whether it's a
   *     statement.
   */
  loadExtraState: function(this: GetIndexBlock, state: AnyDuringMigration) {
    if (state['isStatement']) {
      this.updateStatement_(true);
    } else if (typeof state === 'string') {
      // backward compatible for json serialised mutations
      this.domToMutation(xmlUtils.textToDom(state));
    }
  },

  /**
   * Switch between a value block and a statement block.
   *
   * @param newStatement True if the block should be a statement.
   *     False if the block should be a value.
   */
  updateStatement_: function(this: GetIndexBlock, newStatement: boolean) {
    const oldStatement = !this.outputConnection;
    if (newStatement !== oldStatement) {
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
  /**
   * Create or delete an input for the numeric index.
   *
   * @param isAt True if the input should exist.
   */
  updateAt_: function(this: GetIndexBlock, isAt: boolean) {
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck('Number');
      if (Msg['ORDINAL_NUMBER_SUFFIX']) {
        this.appendDummyInput('ORDINAL').appendField(
            Msg['ORDINAL_NUMBER_SUFFIX']);
      }
    } else {
      this.appendDummyInput('AT');
    }
    const menu = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: this.WHERE_OPTIONS,
    }) as FieldDropdown;
    menu.setValidator(
        /**
         * @param value The input value.
         * @return Null if the field has been replaced; otherwise undefined.
         */
        function(this: FieldDropdown, value: string) {
          const newAt = (value === 'FROM_START') || (value === 'FROM_END');
          // The 'isAt' variable is available due to this function being a
          // closure.
          if (newAt !== isAt) {
            const block = this.getSourceBlock() as GetIndexBlock;
            block.updateAt_(newAt);
            // This menu has been destroyed and replaced.  Update the
            // replacement.
            block.setFieldValue(value, 'WHERE');
            return null;
          }
          return undefined;
        });
    this.getInput('AT').appendField(menu, 'WHERE');
    if (Msg['LISTS_GET_INDEX_TAIL']) {
      this.moveInputBefore('TAIL', null);
    }
  },
};

type SetIndexBlock = Block | typeof blocks['lists_setIndex'];

blocks['lists_setIndex'] = {
  /**
   * Block for setting the element at index.
   */
  init: function(this: SetIndexBlock) {
    const MODE = [
      [Msg['LISTS_SET_INDEX_SET'], 'SET'],
      [Msg['LISTS_SET_INDEX_INSERT'], 'INSERT'],
    ];
    this.WHERE_OPTIONS = [
      [Msg['LISTS_GET_INDEX_FROM_START'], 'FROM_START'],
      [Msg['LISTS_GET_INDEX_FROM_END'], 'FROM_END'],
      [Msg['LISTS_GET_INDEX_FIRST'], 'FIRST'],
      [Msg['LISTS_GET_INDEX_LAST'], 'LAST'],
      [Msg['LISTS_GET_INDEX_RANDOM'], 'RANDOM'],
    ];
    this.setHelpUrl(Msg['LISTS_SET_INDEX_HELPURL']);
    this.setStyle('list_blocks');
    this.appendValueInput('LIST').setCheck('Array').appendField(
        Msg['LISTS_SET_INDEX_INPUT_IN_LIST']);
    const operationDropdown = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: MODE,
    });
    this.appendDummyInput()
        .appendField(operationDropdown, 'MODE')
        .appendField('', 'SPACE');
    this.appendDummyInput('AT');
    this.appendValueInput('TO').appendField(Msg['LISTS_SET_INDEX_INPUT_TO']);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Msg['LISTS_SET_INDEX_TOOLTIP']);
    this.updateAt_(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    const thisBlock = this;
    this.setTooltip(function() {
      const mode = thisBlock.getFieldValue('MODE');
      const where = thisBlock.getFieldValue('WHERE');
      let tooltip = '';
      switch (mode + ' ' + where) {
        case 'SET FROM_START':
        case 'SET FROM_END':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_SET_FROM'];
          break;
        case 'SET FIRST':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_SET_FIRST'];
          break;
        case 'SET LAST':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_SET_LAST'];
          break;
        case 'SET RANDOM':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_SET_RANDOM'];
          break;
        case 'INSERT FROM_START':
        case 'INSERT FROM_END':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_INSERT_FROM'];
          break;
        case 'INSERT FIRST':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST'];
          break;
        case 'INSERT LAST':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_INSERT_LAST'];
          break;
        case 'INSERT RANDOM':
          tooltip = Msg['LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM'];
          break;
      }
      if (where === 'FROM_START' || where === 'FROM_END') {
        tooltip += '  ' +
            Msg['LISTS_INDEX_FROM_START_TOOLTIP'].replace(
                '%1', thisBlock.workspace.options.oneBasedIndex ? '#1' : '#0');
      }
      return tooltip;
    });
  },
  /**
   * Create XML to represent whether there is an 'AT' input.
   *
   * @return XML storage element.
   */
  mutationToDom: function(this: SetIndexBlock): Element {
    const container = xmlUtils.createElement('mutation');
    const isAt = this.getInput('AT').type === ConnectionType.INPUT_VALUE;
    container.setAttribute('at', String(isAt));
    return container;
  },
  /**
   * Parse XML to restore the 'AT' input.
   *
   * @param xmlElement XML storage element.
   */
  domToMutation: function(this: SetIndexBlock, xmlElement: Element) {
    // Note: Until January 2013 this block did not have mutations,
    // so 'at' defaults to true.
    const isAt = (xmlElement.getAttribute('at') !== 'false');
    this.updateAt_(isAt);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * This block does not need to serialize any specific state as it is already
   * encoded in the dropdown values, but must have an implementation to avoid
   * the backward compatible XML mutations being serialized.
   *
   * @return The state of this block.
   */
  saveExtraState: function(): null {
    return null;
  },

  /**
   * Applies the given state to this block.
   * No extra state is needed or expected as it is already encoded in the
   * dropdown values.
   */
  loadExtraState: function() {},

  /**
   * Create or delete an input for the numeric index.
   *
   * @param isAt True if the input should exist.
   */
  updateAt_: function(this: SetIndexBlock, isAt: boolean) {
    // Destroy old 'AT' and 'ORDINAL' input.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck('Number');
      if (Msg['ORDINAL_NUMBER_SUFFIX']) {
        this.appendDummyInput('ORDINAL').appendField(
            Msg['ORDINAL_NUMBER_SUFFIX']);
      }
    } else {
      this.appendDummyInput('AT');
    }
    const menu = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: this.WHERE_OPTIONS,
    }) as FieldDropdown;
    menu.setValidator(
        /**
         * @param value The input value.
         * @return Null if the field has been replaced; otherwise undefined.
         */
        function(this: FieldDropdown, value: string) {
          const newAt = (value === 'FROM_START') || (value === 'FROM_END');
          // The 'isAt' variable is available due to this function being a
          // closure.
          if (newAt !== isAt) {
            const block = this.getSourceBlock() as SetIndexBlock;
            block.updateAt_(newAt);
            // This menu has been destroyed and replaced.  Update the
            // replacement.
            block.setFieldValue(value, 'WHERE');
            return null;
          }
          return undefined;
        });
    this.moveInputBefore('AT', 'TO');
    if (this.getInput('ORDINAL')) {
      this.moveInputBefore('ORDINAL', 'TO');
    }

    this.getInput('AT').appendField(menu, 'WHERE');
  },
};

type GetSublistBlock = Block | typeof blocks['lists_getSublist'];

blocks['lists_getSublist'] = {
  /**
   * Block for getting sublist.
   */
  init: function(this: GetSublistBlock) {
    this['WHERE_OPTIONS_1'] = [
      [Msg['LISTS_GET_SUBLIST_START_FROM_START'], 'FROM_START'],
      [Msg['LISTS_GET_SUBLIST_START_FROM_END'], 'FROM_END'],
      [Msg['LISTS_GET_SUBLIST_START_FIRST'], 'FIRST'],
    ];
    this['WHERE_OPTIONS_2'] = [
      [Msg['LISTS_GET_SUBLIST_END_FROM_START'], 'FROM_START'],
      [Msg['LISTS_GET_SUBLIST_END_FROM_END'], 'FROM_END'],
      [Msg['LISTS_GET_SUBLIST_END_LAST'], 'LAST'],
    ];
    this.setHelpUrl(Msg['LISTS_GET_SUBLIST_HELPURL']);
    this.setStyle('list_blocks');
    this.appendValueInput('LIST').setCheck('Array').appendField(
        Msg['LISTS_GET_SUBLIST_INPUT_IN_LIST']);
    this.appendDummyInput('AT1');
    this.appendDummyInput('AT2');
    if (Msg['LISTS_GET_SUBLIST_TAIL']) {
      this.appendDummyInput('TAIL').appendField(Msg['LISTS_GET_SUBLIST_TAIL']);
    }
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.updateAt_(1, true);
    this.updateAt_(2, true);
    this.setTooltip(Msg['LISTS_GET_SUBLIST_TOOLTIP']);
  },
  /**
   * Create XML to represent whether there are 'AT' inputs.
   *
   * @return XML storage element.
   */
  mutationToDom: function(this: GetSublistBlock): Element {
    const container = xmlUtils.createElement('mutation');
    const isAt1 = this.getInput('AT1').type === ConnectionType.INPUT_VALUE;
    container.setAttribute('at1', String(isAt1));
    const isAt2 = this.getInput('AT2').type === ConnectionType.INPUT_VALUE;
    container.setAttribute('at2', String(isAt2));
    return container;
  },
  /**
   * Parse XML to restore the 'AT' inputs.
   *
   * @param xmlElement XML storage element.
   */
  domToMutation: function(this: GetSublistBlock, xmlElement: Element) {
    const isAt1 = (xmlElement.getAttribute('at1') === 'true');
    const isAt2 = (xmlElement.getAttribute('at2') === 'true');
    this.updateAt_(1, isAt1);
    this.updateAt_(2, isAt2);
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * This block does not need to serialize any specific state as it is already
   * encoded in the dropdown values, but must have an implementation to avoid
   * the backward compatible XML mutations being serialized.
   *
   * @return The state of this block.
   */
  saveExtraState: function(): null {
    return null;
  },

  /**
   * Applies the given state to this block.
   * No extra state is needed or expected as it is already encoded in the
   * dropdown values.
   */
  loadExtraState: function() {},

  /**
   * Create or delete an input for a numeric index.
   * This block has two such inputs, independent of each other.
   *
   * @param n Specify first or second input (1 or 2).
   * @param isAt True if the input should exist.
   */
  updateAt_: function(this: GetSublistBlock, n: number, isAt: boolean) {
    // Create or delete an input for the numeric index.
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT' + n);
    this.removeInput('ORDINAL' + n, true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT' + n).setCheck('Number');
      if (Msg['ORDINAL_NUMBER_SUFFIX']) {
        this.appendDummyInput('ORDINAL' + n)
            .appendField(Msg['ORDINAL_NUMBER_SUFFIX']);
      }
    } else {
      this.appendDummyInput('AT' + n);
    }
    const menu = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: this['WHERE_OPTIONS_' + n],
    }) as FieldDropdown;
    menu.setValidator(
        /**
         * @param value The input value.
         * @return Null if the field has been replaced; otherwise undefined.
         */
        function(this: FieldDropdown, value: string) {
          const newAt = (value === 'FROM_START') || (value === 'FROM_END');
          // The 'isAt' variable is available due to this function being a
          // closure.
          if (newAt !== isAt) {
            const block = this.getSourceBlock() as GetSublistBlock;
            block.updateAt_(n, newAt);
            // This menu has been destroyed and replaced.
            // Update the replacement.
            block.setFieldValue(value, 'WHERE' + n);
            return null;
          }
        });
    this.getInput('AT' + n).appendField(menu, 'WHERE' + n);
    if (n === 1) {
      this.moveInputBefore('AT1', 'AT2');
      if (this.getInput('ORDINAL1')) {
        this.moveInputBefore('ORDINAL1', 'AT2');
      }
    }
    if (Msg['LISTS_GET_SUBLIST_TAIL']) {
      this.moveInputBefore('TAIL', null);
    }
  },
};

type SortBlock = Block | typeof blocks['lists_sort'];

blocks['lists_sort'] = {
  /**
   * Block for sorting a list.
   */
  init: function(this: SortBlock) {
    this.jsonInit({
      'message0': '%{BKY_LISTS_SORT_TITLE}',
      'args0': [
        {
          'type': 'field_dropdown',
          'name': 'TYPE',
          'options': [
            ['%{BKY_LISTS_SORT_TYPE_NUMERIC}', 'NUMERIC'],
            ['%{BKY_LISTS_SORT_TYPE_TEXT}', 'TEXT'],
            ['%{BKY_LISTS_SORT_TYPE_IGNORECASE}', 'IGNORE_CASE'],
          ],
        },
        {
          'type': 'field_dropdown',
          'name': 'DIRECTION',
          'options': [
            ['%{BKY_LISTS_SORT_ORDER_ASCENDING}', '1'],
            ['%{BKY_LISTS_SORT_ORDER_DESCENDING}', '-1'],
          ],
        },
        {
          'type': 'input_value',
          'name': 'LIST',
          'check': 'Array',
        },
      ],
      'output': 'Array',
      'style': 'list_blocks',
      'tooltip': '%{BKY_LISTS_SORT_TOOLTIP}',
      'helpUrl': '%{BKY_LISTS_SORT_HELPURL}',
    });
  },
};

type SplitBlock = Block | typeof blocks['lists_split'];

blocks['lists_split'] = {
  /**
   * Block for splitting text into a list, or joining a list into text.
   */
  init: function(this: SplitBlock) {
    // Assign 'this' to a variable for use in the closures below.
    const thisBlock = this;
    const dropdown = fieldRegistry.fromJson({
      type: 'field_dropdown',
      options: [
        [Msg['LISTS_SPLIT_LIST_FROM_TEXT'], 'SPLIT'],
        [Msg['LISTS_SPLIT_TEXT_FROM_LIST'], 'JOIN'],
      ],
    });
    if (dropdown === null) throw new Error('field_dropdown not found');
    dropdown.setValidator(function(newMode) {
      thisBlock.updateType_(newMode);
    });
    this.setHelpUrl(Msg['LISTS_SPLIT_HELPURL']);
    this.setStyle('list_blocks');
    this.appendValueInput('INPUT').setCheck('String').appendField(
        dropdown, 'MODE');
    this.appendValueInput('DELIM').setCheck('String').appendField(
        Msg['LISTS_SPLIT_WITH_DELIMITER']);
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.setTooltip(function() {
      const mode = thisBlock.getFieldValue('MODE');
      if (mode === 'SPLIT') {
        return Msg['LISTS_SPLIT_TOOLTIP_SPLIT'];
      } else if (mode === 'JOIN') {
        return Msg['LISTS_SPLIT_TOOLTIP_JOIN'];
      }
      throw Error('Unknown mode: ' + mode);
    });
  },
  /**
   * Modify this block to have the correct input and output types.
   *
   * @param newMode Either 'SPLIT' or 'JOIN'.
   */
  updateType_: function(this: SplitBlock, newMode: string) {
    const mode = this.getFieldValue('MODE');
    if (mode !== newMode) {
      const inputConnection = this.getInput('INPUT')!.connection;
      inputConnection!.setShadowDom(null);
      const inputBlock = inputConnection!.targetBlock();
      if (inputBlock) {
        inputConnection!.disconnect();
        if (inputBlock.isShadow()) {
          inputBlock.dispose(false);
        } else {
          this.bumpNeighbours();
        }
      }
    }
    if (newMode === 'SPLIT') {
      this.outputConnection!.setCheck('Array');
      this.getInput('INPUT')!.setCheck('String');
    } else {
      this.outputConnection!.setCheck('String');
      this.getInput('INPUT')!.setCheck('Array');
    }
  },
  /**
   * Create XML to represent the input and output types.
   *
   * @return XML storage element.
   */
  mutationToDom: function(this: SplitBlock): Element {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('mode', this.getFieldValue('MODE'));
    return container;
  },
  /**
   * Parse XML to restore the input and output types.
   *
   * @param xmlElement XML storage element.
   */
  domToMutation: function(this: SplitBlock, xmlElement: Element) {
    this.updateType_(xmlElement.getAttribute('mode'));
  },

  /**
   * Returns the state of this block as a JSON serializable object.
   * This block does not need to serialize any specific state as it is already
   * encoded in the dropdown values, but must have an implementation to avoid
   * the backward compatible XML mutations being serialized.
   *
   * @return The state of this block.
   */
  saveExtraState: function(): null {
    return null;
  },

  /**
   * Applies the given state to this block.
   * No extra state is needed or expected as it is already encoded in the
   * dropdown values.
   */
  loadExtraState: function() {},
};

// Register provided blocks.
defineBlocks(blocks);
