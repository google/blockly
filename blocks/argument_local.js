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

goog.module('Blockly.blocks.argumentLocal');

const dialog = goog.require('Blockly.dialog');
const Extensions = goog.require('Blockly.Extensions');
const Events = goog.require('Blockly.Events');
const {Blocks} = goog.require('Blockly.blocks');
const {Msg} = goog.require('Blockly.Msg');

 Blocks['argument_local'] = {
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
      'colour': '#8cb3ff',
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
};

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
   * Add menu option to rename argument.
   * @param {!Array} options List of menu options to add to.
   * @this {Block}
   */
  customContextMenu: function(options) {
    if (!this.isInFlyout) {
      const option = {
        enabled: true,
        text: Msg['RENAME_ARGUMENT'],
        callback: renameOptionCallbackFactory(this),
      };
      options.unshift(option);
    }
  },
};

/**
 * Factory for callbacks for rename argument dropdown menu option
 * @param {!Block} block The block with the argument to rename.
 * @return {!function()} A function that renames the argument.
 */
 const renameOptionCallbackFactory = function(block) {
   const argumentValue = block.getFieldValue('VALUE');
  return function() {
    const callback = (newName) => {
      block.setFieldValue(newName, 'VALUE');
      block.setFieldText(newName, 'VALUE');
    };
    const msg = Msg['RENAME_ARGUMENT_TITLE'].replace('%1', argumentValue);
    dialog.prompt(msg, 'default', callback);
  };
};

Extensions.registerMixin('contextMenu', CUSTOM_CONTEXT_MENU);
