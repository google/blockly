/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file Argument local block for Blockly.
 */

// Former: goog.module('Blockly.libraryBlocks.argumentLocal');

import * as dialog from '../core/dialog.js';
import * as Extensions from '../core/extensions.js';
import * as Events from '../core/events/events.js';
import type {Abstract as AbstractEvent} from '../core/events/events_abstract.js';
import {Msg} from '../core/msg.js';
import {defineBlocks} from '../core/common.js';
import type {WorkspaceSvg} from '../core/workspace_svg.js';
import {BlockDefinition} from '../core/blocks';
import {Block} from '../core/block';
import {
  ContextMenuOption,
  LegacyContextMenuOption,
} from '../core/contextmenu_registry.js';

// For local argument block of this block type should rename label and value equally.
const blockTypesRenameValue = [
  'controls_for_with_argument',
  'controls_forEach_with_argument',
  'procedures_with_argument_defnoreturn',
  'procedures_with_argument_defreturn',
];

/** A dictionary of the block definitions provided by this module. */
export const blocks: {[key: string]: BlockDefinition} = {};

/** Type of a block using the ArgumentLocalMixin mixin. */
export type ArgumentLocalBlock = Block & ArgumentLocalMixin;
interface ArgumentLocalMixin extends ArgumentLocalMixinType {}

type ArgumentLocalMixinType = typeof ARGUMENT_LOCAL;

const ARGUMENT_LOCAL = {
  /**
   * Create or delete an input for a numeric index.
   * This block has two such inputs, independent of each other.
   *
   * @param {Block} block Specify first or second input (1 or 2).
   * @param {string} newName True if the input should exist.
   * @param {boolean} isRenameValue Rename field value
   * @private
   */
  renameField_: function (
    block: Block,
    newName: string,
    isRenameValue: boolean,
  ) {
    if (isRenameValue) {
      block.setFieldValue(newName, 'VALUE');
    }
    block.setFieldText(newName, 'VALUE');

    const field = block.getField('VALUE');
    field?.forceRerender();
  },

  changeArgumentName: function (
    this: ArgumentLocalBlock,
    newName: string,
    parentBlock: Block | null,
  ) {
    const argumentField = this.getField('VALUE');
    const argumentFieldText = argumentField?.getText();

    if (parentBlock) {
      const parentBlockType = parentBlock.type;
      const allBlocks = parentBlock.getDescendants(false);
      const argumentsLocal = allBlocks.filter(
        (block: Block) => block.type === 'argument_local' && !block.isShadow(),
      );

      const isShouldRenameValue =
        blockTypesRenameValue.includes(parentBlockType);
      this.renameField_(this, newName, isShouldRenameValue);

      for (
        let i = 0, childArgumentBlock;
        (childArgumentBlock = argumentsLocal[i]);
        i++
      ) {
        const childLocalArgField = childArgumentBlock.getField('VALUE');
        const childLocalArgFieldText = childLocalArgField?.getText();

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

blocks['argument_local'] = {
  init: function () {
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
  onchange: function (this: ArgumentLocalBlock, event: AbstractEvent) {
    if (event.type !== Events.BLOCK_MOVE) {
      return;
    }

    if (
      ((this.workspace as WorkspaceSvg).isDragging &&
        (this.workspace as WorkspaceSvg).isDragging()) ||
      (event.type !== Events.BLOCK_MOVE && event.type !== Events.BLOCK_CREATE)
    ) {
      return; // Don't change state at the start of a drag.
    }

    let legal = false;
    // Is the block nested in a procedure?
    let block = this; // eslint-disable-line @typescript-eslint/no-this-alias

    do {
      if (blockTypesRenameValue.includes(block.type)) {
        legal = true;
        break;
      }
      block = block.getSurroundParent()!;
    } while (block);

    Events.disable();
    if (legal) {
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
 *
 * @mixin
 * @augments Block
 * @package
 * @readonly
 */
const CUSTOM_CONTEXT_MENU = {
  /**
   * Add menu option to rename argument and delete option
   * to disable block.
   *
   * @param {!Array} options List of menu options to add to.
   * @this {Block}
   */
  customContextMenu: function (
    this: Block,
    options: Array<ContextMenuOption | LegacyContextMenuOption>,
  ) {
    if (this.isInFlyout) {
      return;
    }

    const parentBlock = this.getParent();
    if (
      parentBlock &&
      (parentBlock.type === 'procedures_with_argument_defnoreturn' ||
        parentBlock.type === 'procedures_with_argument_defreturn')
    ) {
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
 *
 * @param {!Block} block The block with the argument to rename.
 * @returns {!function()} A function that renames the argument.
 */
const renameOptionCallbackFactory = function (block: Block) {
  const argumentValue = block.getFieldText('VALUE') || '';

  return function () {
    const callback = (newName: string | null) => {
      const parentBlock = block.getParent();
      (block as ArgumentLocalBlock).changeArgumentName.call(
        block as ArgumentLocalBlock,
        newName || '',
        parentBlock,
      );
    };
    const msg = Msg['RENAME_ARGUMENT_TITLE'].replace('%1', argumentValue);
    dialog.prompt(msg, 'default', callback);
  };
};

Extensions.registerMixin('contextMenu', CUSTOM_CONTEXT_MENU);
