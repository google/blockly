/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Text blocks for Blockly.
 * @suppress {checkTypes}
 */
'use strict';

goog.module('Blockly.blocks.texts');

const Extensions = goog.require('Blockly.Extensions');
const {Msg} = goog.require('Blockly.Msg');
/* eslint-disable-next-line no-unused-vars */
const xmlUtils = goog.require('Blockly.utils.xml');
const {Align} = goog.require('Blockly.Input');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {Blocks} = goog.require('Blockly.blocks');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {FieldDropdown} = goog.require('Blockly.FieldDropdown');
const {FieldLabel} = goog.require('Blockly.FieldLabel');
const {FieldTextInput} = goog.require('Blockly.FieldTextInput');
const {Mutator} = goog.require('Blockly.Mutator');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {defineBlocksWithJsonArray} = goog.require('Blockly.common');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldMultilineInput');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldVariable');


defineBlocksWithJsonArray([
  {
    'type': 'text_multiline',
    'message0': '%1 %2',
    'args0': [
      {
        'type': 'field_label',
        'class': 'blocklyFont',
        'text': '¶',
      },
      {
        'type': 'field_multilinetext',
        'name': 'TEXT',
        'text': '',
      },
    ],
    'output': 'String',
    'style': 'text_blocks',
    'helpUrl': '%{BKY_TEXT_TEXT_HELPURL}',
    'tooltip': '%{BKY_TEXT_TEXT_TOOLTIP}',
    'extensions': [
      'parent_tooltip_when_inline',
    ],
  },
  {
    'type': 'text_join',
    'message0': '',
    'output': 'String',
    'style': 'text_blocks',
    'helpUrl': '%{BKY_TEXT_JOIN_HELPURL}',
    'tooltip': '%{BKY_TEXT_JOIN_TOOLTIP}',
    'mutator': 'text_join_mutator',

  },
  {
    'type': 'text_create_join_container',
    'message0': '%{BKY_TEXT_CREATE_JOIN_TITLE_JOIN} %1 %2',
    'args0': [
      {
        'type': 'input_dummy',
      },
      {
        'type': 'input_statement',
        'name': 'STACK',
      },
    ],
    'style': 'text_blocks',
    'tooltip': '%{BKY_TEXT_CREATE_JOIN_TOOLTIP}',
    'enableContextMenu': false,
  },
  {
    'type': 'text_create_join_item',
    'message0': '%{BKY_TEXT_CREATE_JOIN_ITEM_TITLE_ITEM}',
    'previousStatement': null,
    'nextStatement': null,
    'style': 'text_blocks',
    'tooltip': '%{BKY_TEXT_CREATE_JOIN_ITEM_TOOLTIP}',
    'enableContextMenu': false,
  },
  {
    'type': 'text_append',
    'message0': '%{BKY_TEXT_APPEND_TITLE}',
    'args0': [
      {
        'type': 'field_variable',
        'name': 'VAR',
        'variable': '%{BKY_TEXT_APPEND_VARIABLE}',
      },
      {
        'type': 'input_value',
        'name': 'TEXT',
      },
    ],
    'previousStatement': null,
    'nextStatement': null,
    'style': 'text_blocks',
    'extensions': [
      'text_append_tooltip',
    ],
  },
  {
    'type': 'text_length',
    'message0': '%{BKY_TEXT_LENGTH_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': ['String', 'Array'],
      },
    ],
    'output': 'Number',
    'style': 'text_blocks',
    'tooltip': '%{BKY_TEXT_LENGTH_TOOLTIP}',
    'helpUrl': '%{BKY_TEXT_LENGTH_HELPURL}',
  },
  {
    'type': 'text_isEmpty',
    'message0': '%{BKY_TEXT_ISEMPTY_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': ['String', 'Array'],
      },
    ],
    'output': 'Boolean',
    'style': 'text_blocks',
    'tooltip': '%{BKY_TEXT_ISEMPTY_TOOLTIP}',
    'helpUrl': '%{BKY_TEXT_ISEMPTY_HELPURL}',
  },
  {
    'type': 'text_indexOf',
    'message0': '%{BKY_TEXT_INDEXOF_TITLE}',
    'args0': [
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': 'String',
      },
      {
        'type': 'field_dropdown',
        'name': 'END',
        'options': [
          [
            '%{BKY_TEXT_INDEXOF_OPERATOR_FIRST}',
            'FIRST',
          ],
          [
            '%{BKY_TEXT_INDEXOF_OPERATOR_LAST}',
            'LAST',
          ],
        ],
      },
      {
        'type': 'input_value',
        'name': 'FIND',
        'check': 'String',
      },
    ],
    'output': 'Number',
    'style': 'text_blocks',
    'helpUrl': '%{BKY_TEXT_INDEXOF_HELPURL}',
    'inputsInline': true,
    'extensions': [
      'text_indexOf_tooltip',
    ],
  },
  {
    'type': 'text_charAt',
    'message0': '%{BKY_TEXT_CHARAT_TITLE}',  // "in text %1 %2"
    'args0': [
      {
        'type': 'input_value',
        'name': 'VALUE',
        'check': 'String',
      },
      {
        'type': 'field_dropdown',
        'name': 'WHERE',
        'options': [
          ['%{BKY_TEXT_CHARAT_FROM_START}', 'FROM_START'],
          ['%{BKY_TEXT_CHARAT_FROM_END}', 'FROM_END'],
          ['%{BKY_TEXT_CHARAT_FIRST}', 'FIRST'],
          ['%{BKY_TEXT_CHARAT_LAST}', 'LAST'],
          ['%{BKY_TEXT_CHARAT_RANDOM}', 'RANDOM'],
        ],
      },
    ],
    'output': 'String',
    'style': 'text_blocks',
    'helpUrl': '%{BKY_TEXT_CHARAT_HELPURL}',
    'inputsInline': true,
    'mutator': 'text_charAt_mutator',
  },
]);

Blocks['text'] = {
  /**
   * Block for text value.
   * @this {Block}
   */
  init: function() {
    this.jsonInit({
      'type': 'text',
      'message0': '%1%2%3',
      'args0': [{
        'type': 'field_label',
        'text': this.RTL ? '❞' : '❝',
        'class': 'blocklyFont',
      },
      {
        'type': 'field_input',
        'name': 'TEXT',
        'text': '',
      },
      {
        'type': 'field_label',
        'text': this.RTL ? '❝' : '❞',
        'class': 'blocklyFont',
      }],
      'output': 'String',
      'style': 'text_blocks',
      'helpUrl': '%{BKY_TEXT_TEXT_HELPURL}',
      'tooltip': '%{BKY_TEXT_TEXT_TOOLTIP}',
      'extensions': [
        'parent_tooltip_when_inline',
      ],
    });
  },
};

Blocks['text_getSubstring'] = {
  /**
   * Block for getting substring.
   * @this {Block}
   */
  init: function() {
    this['WHERE_OPTIONS_1'] = [
      [Msg['TEXT_GET_SUBSTRING_START_FROM_START'], 'FROM_START'],
      [Msg['TEXT_GET_SUBSTRING_START_FROM_END'], 'FROM_END'],
      [Msg['TEXT_GET_SUBSTRING_START_FIRST'], 'FIRST'],
    ];
    this['WHERE_OPTIONS_2'] = [
      [Msg['TEXT_GET_SUBSTRING_END_FROM_START'], 'FROM_START'],
      [Msg['TEXT_GET_SUBSTRING_END_FROM_END'], 'FROM_END'],
      [Msg['TEXT_GET_SUBSTRING_END_LAST'], 'LAST'],
    ];
    this.setHelpUrl(Msg['TEXT_GET_SUBSTRING_HELPURL']);
    this.setStyle('text_blocks');
    this.appendValueInput('STRING').setCheck('String').appendField(
        Msg['TEXT_GET_SUBSTRING_INPUT_IN_TEXT']);
    this.appendDummyInput('AT1');
    this.appendDummyInput('AT2');
    if (Msg['TEXT_GET_SUBSTRING_TAIL']) {
      this.appendDummyInput('TAIL').appendField(Msg['TEXT_GET_SUBSTRING_TAIL']);
    }
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.updateAt_(1, true);
    this.updateAt_(2, true);
    this.setTooltip(Msg['TEXT_GET_SUBSTRING_TOOLTIP']);
  },
  /**
   * Create XML to represent whether there are 'AT' inputs.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    const isAt1 = this.getInput('AT1').type === ConnectionType.INPUT_VALUE;
    container.setAttribute('at1', isAt1);
    const isAt2 = this.getInput('AT2').type === ConnectionType.INPUT_VALUE;
    container.setAttribute('at2', isAt2);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' inputs.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    const isAt1 = (xmlElement.getAttribute('at1') === 'true');
    const isAt2 = (xmlElement.getAttribute('at2') === 'true');
    this.updateAt_(1, isAt1);
    this.updateAt_(2, isAt2);
  },

  // This block does not need JSO serialization hooks (saveExtraState and
  // loadExtraState) because the state of this object is already encoded in the
  // dropdown values.
  // XML hooks are kept for backwards compatibility.

  /**
   * Create or delete an input for a numeric index.
   * This block has two such inputs, independent of each other.
   * @param {number} n Specify first or second input (1 or 2).
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this {Block}
   */
  updateAt_: function(n, isAt) {
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
    // Move tail, if present, to end of block.
    if (n === 2 && Msg['TEXT_GET_SUBSTRING_TAIL']) {
      this.removeInput('TAIL', true);
      this.appendDummyInput('TAIL').appendField(Msg['TEXT_GET_SUBSTRING_TAIL']);
    }
    const menu = new FieldDropdown(
        this['WHERE_OPTIONS_' + n],
        /**
         * @param {*} value The input value.
         * @this {FieldDropdown}
         * @returns {null|undefined} Null if the field has been replaced;
         *     otherwise undefined.
         */
        function(value) {
          const newAt = (value === 'FROM_START') || (value === 'FROM_END');
          // The 'isAt' variable is available due to this function being a
          // closure.
          if (newAt !== isAt) {
            const block = this.getSourceBlock();
            block.updateAt_(n, newAt);
            // This menu has been destroyed and replaced.
            // Update the replacement.
            block.setFieldValue(value, 'WHERE' + n);
            return null;
          }
          return undefined;
        });

    this.getInput('AT' + n).appendField(menu, 'WHERE' + n);
    if (n === 1) {
      this.moveInputBefore('AT1', 'AT2');
      if (this.getInput('ORDINAL1')) {
        this.moveInputBefore('ORDINAL1', 'AT2');
      }
    }
  },
};

Blocks['text_changeCase'] = {
  /**
   * Block for changing capitalization.
   * @this {Block}
   */
  init: function() {
    const OPERATORS = [
      [Msg['TEXT_CHANGECASE_OPERATOR_UPPERCASE'], 'UPPERCASE'],
      [Msg['TEXT_CHANGECASE_OPERATOR_LOWERCASE'], 'LOWERCASE'],
      [Msg['TEXT_CHANGECASE_OPERATOR_TITLECASE'], 'TITLECASE'],
    ];
    this.setHelpUrl(Msg['TEXT_CHANGECASE_HELPURL']);
    this.setStyle('text_blocks');
    this.appendValueInput('TEXT').setCheck('String').appendField(
        new FieldDropdown(OPERATORS), 'CASE');
    this.setOutput(true, 'String');
    this.setTooltip(Msg['TEXT_CHANGECASE_TOOLTIP']);
  },
};

Blocks['text_trim'] = {
  /**
   * Block for trimming spaces.
   * @this {Block}
   */
  init: function() {
    const OPERATORS = [
      [Msg['TEXT_TRIM_OPERATOR_BOTH'], 'BOTH'],
      [Msg['TEXT_TRIM_OPERATOR_LEFT'], 'LEFT'],
      [Msg['TEXT_TRIM_OPERATOR_RIGHT'], 'RIGHT'],
    ];
    this.setHelpUrl(Msg['TEXT_TRIM_HELPURL']);
    this.setStyle('text_blocks');
    this.appendValueInput('TEXT').setCheck('String').appendField(
        new FieldDropdown(OPERATORS), 'MODE');
    this.setOutput(true, 'String');
    this.setTooltip(Msg['TEXT_TRIM_TOOLTIP']);
  },
};

Blocks['text_print'] = {
  /**
   * Block for print statement.
   * @this {Block}
   */
  init: function() {
    this.jsonInit({
      'message0': Msg['TEXT_PRINT_TITLE'],
      'args0': [
        {
          'type': 'input_value',
          'name': 'TEXT',
        },
      ],
      'previousStatement': null,
      'nextStatement': null,
      'style': 'text_blocks',
      'tooltip': Msg['TEXT_PRINT_TOOLTIP'],
      'helpUrl': Msg['TEXT_PRINT_HELPURL'],
    });
  },
};


/**
 * Common properties for the text_prompt_ext and text_prompt blocks
 * definitions.
 */
const TEXT_PROMPT_COMMON = {
  /**
   * Modify this block to have the correct output type.
   * @param {string} newOp Either 'TEXT' or 'NUMBER'.
   * @private
   * @this {Block}
   */
  updateType_: function(newOp) {
    this.outputConnection.setCheck(newOp === 'NUMBER' ? 'Number' : 'String');
  },
  /**
   * Create XML to represent the output type.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('type', this.getFieldValue('TYPE'));
    return container;
  },
  /**
   * Parse XML to restore the output type.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    this.updateType_(xmlElement.getAttribute('type'));
  },
};

Blocks['text_prompt_ext'] = {
  ...TEXT_PROMPT_COMMON,
  /**
   * Block for prompt function (external message).
   * @this {Block}
   */
  init: function() {
    const TYPES = [
      [Msg['TEXT_PROMPT_TYPE_TEXT'], 'TEXT'],
      [Msg['TEXT_PROMPT_TYPE_NUMBER'], 'NUMBER'],
    ];
    this.setHelpUrl(Msg['TEXT_PROMPT_HELPURL']);
    this.setStyle('text_blocks');
    // Assign 'this' to a variable for use in the closures below.
    const thisBlock = this;
    const dropdown = new FieldDropdown(TYPES, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendValueInput('TEXT').appendField(dropdown, 'TYPE');
    this.setOutput(true, 'String');
    this.setTooltip(function() {
      return (thisBlock.getFieldValue('TYPE') === 'TEXT') ?
          Msg['TEXT_PROMPT_TOOLTIP_TEXT'] :
          Msg['TEXT_PROMPT_TOOLTIP_NUMBER'];
    });
  },

  // This block does not need JSO serialization hooks (saveExtraState and
  // loadExtraState) because the state of this object is already encoded in the
  // dropdown values.
  // XML hooks are kept for backwards compatibility.
};

Blocks['text_prompt'] = {
  ...TEXT_PROMPT_COMMON,
  /**
   * Block for prompt function (internal message).
   * The 'text_prompt_ext' block is preferred as it is more flexible.
   * @this {Block}
   */
  init: function() {
    const TYPES = [
      [Msg['TEXT_PROMPT_TYPE_TEXT'], 'TEXT'],
      [Msg['TEXT_PROMPT_TYPE_NUMBER'], 'NUMBER'],
    ];

    // Assign 'this' to a variable for use in the closures below.
    const thisBlock = this;
    this.setHelpUrl(Msg['TEXT_PROMPT_HELPURL']);
    this.setStyle('text_blocks');
    const dropdown = new FieldDropdown(TYPES, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendDummyInput()
        .appendField(dropdown, 'TYPE')
        .appendField(new FieldLabel(this.RTL ? '❞' : '❝', 'blocklyFont'))
        .appendField(new FieldTextInput(''), 'TEXT')
        .appendField(new FieldLabel(this.RTL ? '❝' : '❞', 'blocklyFont'))
    this.setOutput(true, 'String');
    this.setTooltip(function() {
      return (thisBlock.getFieldValue('TYPE') === 'TEXT') ?
          Msg['TEXT_PROMPT_TOOLTIP_TEXT'] :
          Msg['TEXT_PROMPT_TOOLTIP_NUMBER'];
    });
  },
};

Blocks['text_count'] = {
  /**
   * Block for counting how many times one string appears within another string.
   * @this {Block}
   */
  init: function() {
    this.jsonInit({
      'message0': Msg['TEXT_COUNT_MESSAGE0'],
      'args0': [
        {
          'type': 'input_value',
          'name': 'SUB',
          'check': 'String',
        },
        {
          'type': 'input_value',
          'name': 'TEXT',
          'check': 'String',
        },
      ],
      'output': 'Number',
      'inputsInline': true,
      'style': 'text_blocks',
      'tooltip': Msg['TEXT_COUNT_TOOLTIP'],
      'helpUrl': Msg['TEXT_COUNT_HELPURL'],
    });
  },
};

Blocks['text_replace'] = {
  /**
   * Block for replacing one string with another in the text.
   * @this {Block}
   */
  init: function() {
    this.jsonInit({
      'message0': Msg['TEXT_REPLACE_MESSAGE0'],
      'args0': [
        {
          'type': 'input_value',
          'name': 'FROM',
          'check': 'String',
        },
        {
          'type': 'input_value',
          'name': 'TO',
          'check': 'String',
        },
        {
          'type': 'input_value',
          'name': 'TEXT',
          'check': 'String',
        },
      ],
      'output': 'String',
      'inputsInline': true,
      'style': 'text_blocks',
      'tooltip': Msg['TEXT_REPLACE_TOOLTIP'],
      'helpUrl': Msg['TEXT_REPLACE_HELPURL'],
    });
  },
};

Blocks['text_reverse'] = {
  /**
   * Block for reversing a string.
   * @this {Block}
   */
  init: function() {
    this.jsonInit({
      'message0': Msg['TEXT_REVERSE_MESSAGE0'],
      'args0': [
        {
          'type': 'input_value',
          'name': 'TEXT',
          'check': 'String',
        },
      ],
      'output': 'String',
      'inputsInline': true,
      'style': 'text_blocks',
      'tooltip': Msg['TEXT_REVERSE_TOOLTIP'],
      'helpUrl': Msg['TEXT_REVERSE_HELPURL'],
    });
  },
};

/**
 * Mixin for mutator functions in the 'text_join_mutator' extension.
 * @mixin
 * @augments Block
 * @package
 */
const TEXT_JOIN_MUTATOR_MIXIN = {
  /**
   * Create XML to represent number of text inputs.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Returns the state of this block as a JSON serializable object.
   * @return {{itemCount: number}} The state of this block, ie the item count.
   */
  saveExtraState: function() {
    return {
      'itemCount': this.itemCount_,
    };
  },
  /**
   * Applies the given state to this block.
   * @param {*} state The state to apply to this block, ie the item count.
   */
  loadExtraState: function(state) {
    this.itemCount_ = state['itemCount'];
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Workspace} workspace Mutator's workspace.
   * @return {!Block} Root block in mutator.
   * @this {Block}
   */
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('text_create_join_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock('text_create_join_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  compose: function(containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    const connections = [];
    while (itemBlock && !itemBlock.isInsertionMarker()) {
      connections.push(itemBlock.valueConnection_);
      itemBlock =
          itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
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
   * @param {!Block} containerBlock Root block in mutator.
   * @this {Block}
   */
  saveConnections: function(containerBlock) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (itemBlock) {
      const input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      itemBlock =
          itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
      i++;
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this {Block}
   */
  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField(new FieldLabel('❝❞', 'blocklyFont'));
    }
    // Add new inputs.
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        const input = this.appendValueInput('ADD' + i).setAlign(Align.RIGHT);
        if (i === 0) {
          input.appendField(Msg['TEXT_JOIN_TITLE_CREATEWITH']);
        }
      }
    }
    // Remove deleted inputs.
    for (let i = this.itemCount_; this.getInput('ADD' + i); i++) {
      this.removeInput('ADD' + i);
    }
  },
};

/**
 * Performs final setup of a text_join block.
 * @this {Block}
 */
const TEXT_JOIN_EXTENSION = function() {
  // Initialize the mutator values.
  this.itemCount_ = 2;
  this.updateShape_();
  // Configure the mutator UI.
  this.setMutator(new Mutator(['text_create_join_item']));
};

// Update the tooltip of 'text_append' block to reference the variable.
Extensions.register(
    'text_append_tooltip',
    Extensions.buildTooltipWithFieldText('%{BKY_TEXT_APPEND_TOOLTIP}', 'VAR'));

/**
 * Update the tooltip of 'text_append' block to reference the variable.
 * @this {Block}
 */
const TEXT_INDEXOF_TOOLTIP_EXTENSION = function() {
  // Assign 'this' to a variable for use in the tooltip closure below.
  const thisBlock = this;
  this.setTooltip(function() {
    return Msg['TEXT_INDEXOF_TOOLTIP'].replace(
        '%1', thisBlock.workspace.options.oneBasedIndex ? '0' : '-1');
  });
};

/**
 * Mixin for mutator functions in the 'text_charAt_mutator' extension.
 * @mixin
 * @augments Block
 * @package
 */
const TEXT_CHARAT_MUTATOR_MIXIN = {
  /**
   * Create XML to represent whether there is an 'AT' input.
   * Backwards compatible serialization implementation.
   * @return {!Element} XML storage element.
   * @this {Block}
   */
  mutationToDom: function() {
    const container = xmlUtils.createElement('mutation');
    container.setAttribute('at', !!this.isAt_);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' input.
   * Backwards compatible serialization implementation.
   * @param {!Element} xmlElement XML storage element.
   * @this {Block}
   */
  domToMutation: function(xmlElement) {
    // Note: Until January 2013 this block did not have mutations,
    // so 'at' defaults to true.
    const isAt = (xmlElement.getAttribute('at') !== 'false');
    this.updateAt_(isAt);
  },

  // This block does not need JSO serialization hooks (saveExtraState and
  // loadExtraState) because the state of this object is already encoded in the
  // dropdown values.
  // XML hooks are kept for backwards compatibility.

  /**
   * Create or delete an input for the numeric index.
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this {Block}
   */
  updateAt_: function(isAt) {
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT', true);
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck('Number');
      if (Msg['ORDINAL_NUMBER_SUFFIX']) {
        this.appendDummyInput('ORDINAL').appendField(
            Msg['ORDINAL_NUMBER_SUFFIX']);
      }
    }
    if (Msg['TEXT_CHARAT_TAIL']) {
      this.removeInput('TAIL', true);
      this.appendDummyInput('TAIL').appendField(Msg['TEXT_CHARAT_TAIL']);
    }

    this.isAt_ = isAt;
  },
};

/**
 * Does the initial mutator update of text_charAt and adds the tooltip
 * @this {Block}
 */
const TEXT_CHARAT_EXTENSION = function() {
  const dropdown = this.getField('WHERE');
  dropdown.setValidator(
      /**
       * @param {*} value The input value.
       * @this {FieldDropdown}
       */
      function(value) {
        const newAt = (value === 'FROM_START') || (value === 'FROM_END');
        if (newAt !== this.isAt_) {
          const block = this.getSourceBlock();
          block.updateAt_(newAt);
        }
      });
  this.updateAt_(true);
  // Assign 'this' to a variable for use in the tooltip closure below.
  const thisBlock = this;
  this.setTooltip(function() {
    const where = thisBlock.getFieldValue('WHERE');
    let tooltip = Msg['TEXT_CHARAT_TOOLTIP'];
    if (where === 'FROM_START' || where === 'FROM_END') {
      const msg = (where === 'FROM_START') ?
          Msg['LISTS_INDEX_FROM_START_TOOLTIP'] :
          Msg['LISTS_INDEX_FROM_END_TOOLTIP'];
      if (msg) {
        tooltip += '  ' +
            msg.replace(
                '%1', thisBlock.workspace.options.oneBasedIndex ? '#1' : '#0');
      }
    }
    return tooltip;
  });
};

Extensions.register('text_indexOf_tooltip', TEXT_INDEXOF_TOOLTIP_EXTENSION);

Extensions.registerMutator(
    'text_join_mutator', TEXT_JOIN_MUTATOR_MIXIN, TEXT_JOIN_EXTENSION);

Extensions.registerMutator(
    'text_charAt_mutator', TEXT_CHARAT_MUTATOR_MIXIN, TEXT_CHARAT_EXTENSION);
