/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Argument local block for Blockly.
 * @suppress {checkTypes|visibility}
 */

'use strict';

goog.module('Blockly.libraryBlocks.argumentLocal');

const dialog = goog.require('Blockly.dialog');
const Extensions = goog.require('Blockly.Extensions');
const Events = goog.require('Blockly.Events');
const {Msg} = goog.require('Blockly.Msg');
const {defineBlocks} = goog.require('Blockly.common');

// For local argument block of this block type should rename label and value equally.
const blockTypesRenameValue = ['controls_for_with_argument', 'controls_forEach_with_argument'];


const blocks = {};

blocks['argument_local'] = {
  init: function() {
    this.jsonInit({
      'message0': '%1',
      'args0': [
        {
          'type': 'field_label_hover',
          'name': 'VALUE',
          'text': '',
        },
      ],
      'style': 'argument_local_blocks',
      'inputsInline': true,
      'output': null,
      'extensions': ['contextMenu'],
    });
  },
  onchange: function(event) {
    if (event.type !== Events.BLOCK_MOVE) {
      return;
    }

    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return; // Don't change state at the start of a drag.
    }

    let enable = true;

    if (!this.getParent()) {
      enable = false;
    }

    Events.disable();
    if (enable) {
      this.setEnabled(true);
    } else {
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setEnabled(false);
      }
    }
    Events.enable();
  },

  /**
   * Create or delete an input for a numeric index.
   * This block has two such inputs, independent of each other.
   * @param {Block} block Specify first or second input (1 or 2).
   * @param {string} newName True if the input should exist.
   * @param {boolean} isRenameValue Rename field value
   * @private
    */
  renameField_: function(block, newName, isRenameValue) {
    if (isRenameValue) {
      block.setFieldValue(newName, 'VALUE');
    }
    block.setFieldText(newName, 'VALUE');

    const field = block.getField('VALUE');
    field.forceRerender();
  },

  changeArgumentName: function(newName) {
    const parentBlock = this.getParent();

    const argumentField = this.getField('VALUE');
    const argumentFieldText = argumentField.getText('VALUE');
    
    if (parentBlock) {
      const parentBlockType = parentBlock.type;
      const allBlocks = parentBlock.getDescendants();
      const argumentsLocal = allBlocks.filter((block) => block.type === 'argument_local' && !block.isShadow());

      const isShouldRenameValue = blockTypesRenameValue.includes(parentBlockType);
      this.renameField_(this, newName, isShouldRenameValue);

      for (let i = 0, childArgumentBlock; (childArgumentBlock = argumentsLocal[i]); i++) {
          const childLocalArgField = childArgumentBlock.getField('VALUE');
          const childLocalArgFieldText = childLocalArgField.getText('VALUE');

          // Rename only child argument block with same label
          if (childLocalArgFieldText === argumentFieldText) {
            this.renameField_(childArgumentBlock, newName, isShouldRenameValue);
          }
      }
    } else {
      this.renameField_(this, newName, true);
    }
  },
};


exports.blocks = blocks;

/**
 * Mixin to add context menu items to rename argument.
 * Used by blocks 'argument_local'.
 * @mixin
 * @augments Block
 * @package
 * @readonly
 */
const CUSTOM_CONTEXT_MENU = {
  /**
   * Add menu option to rename argument and delete option
   * to disable block.
   * @param {!Array} options List of menu options to add to.
   * @this {Block}
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }

    // Disable rename variable with context menu for procedures block.
    const block = this;
    const parentBlock = block.getParent();
    if (parentBlock &&
       (parentBlock.type === 'procedures_with_argument_defnoreturn' ||
        parentBlock.type === 'procedures_with_argument_defreturn')) {
      return;
    }

    const option = {
      enabled: true,
      text: Msg['RENAME_ARGUMENT'],
      callback: renameOptionCallbackFactory(this),
    };
    options.unshift(option);
  },
};

// Register provided blocks.
defineBlocks(blocks);

/**
 * Factory for callbacks for rename argument dropdown menu option
 * @param {!Block} block The block with the argument to rename.
 * @return {!function()} A function that renames the argument.
 */
const renameOptionCallbackFactory = function(block) {
  const argumentValue = block.getFieldText('VALUE');

  return function() {
    const callback = (newName) => {
      block.changeArgumentName.call(block, newName);
    };
    const msg = Msg['RENAME_ARGUMENT_TITLE'].replace('%1', argumentValue);
    dialog.prompt(msg, 'default', callback);
  };
};

Extensions.registerMixin('contextMenu', CUSTOM_CONTEXT_MENU);
