/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for a block change event.
 *
 * @class
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Events.BlockChange');

import type {Block} from '../block.js';
import type {BlockSvg} from '../block_svg.js';
import * as registry from '../registry.js';
import * as Xml from '../xml.js';

import {BlockBase, BlockBaseJson} from './events_block_base.js';
import * as eventUtils from './utils.js';


/**
 * Class for a block change event.
 *
 * @alias Blockly.Events.BlockChange
 */
export class BlockChange extends BlockBase {
  override type: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  element!: string;
  // TODO(b/109816955): remove '!', see go/strict-prop-init-fix.
  name!: string|null;
  oldValue: unknown;
  newValue: unknown;

  /**
   * @param opt_block The changed block.  Undefined for a blank event.
   * @param opt_element One of 'field', 'comment', 'disabled', etc.
   * @param opt_name Name of input or field affected, or null.
   * @param opt_oldValue Previous value of element.
   * @param opt_newValue New value of element.
   */
  constructor(
      opt_block?: Block, opt_element?: string, opt_name?: string|null,
      opt_oldValue?: unknown, opt_newValue?: unknown) {
    super(opt_block);

    /** Type of this event. */
    this.type = eventUtils.BLOCK_CHANGE;

    if (!opt_block) {
      return;  // Blank event to be populated by fromJson.
    }
    this.element = typeof opt_element === 'undefined' ? '' : opt_element;
    this.name = typeof opt_name === 'undefined' ? '' : opt_name;
    this.oldValue = typeof opt_oldValue === 'undefined' ? '' : opt_oldValue;
    this.newValue = typeof opt_newValue === 'undefined' ? '' : opt_newValue;
  }

  /**
   * Encode the event as JSON.
   *
   * @returns JSON representation.
   */
  override toJson(): BlockChangeJson {
    const json = super.toJson() as BlockChangeJson;
    json['element'] = this.element;
    if (this.name) {
      json['name'] = this.name;
    }
    json['oldValue'] = this.oldValue;
    json['newValue'] = this.newValue;
    return json;
  }

  /**
   * Decode the JSON event.
   *
   * @param json JSON representation.
   */
  override fromJson(json: BlockChangeJson) {
    super.fromJson(json);
    this.element = json['element'];
    this.name = json['name'] || '';
    this.oldValue = json['oldValue'];
    this.newValue = json['newValue'];
  }

  /**
   * Does this event record any change of state?
   *
   * @returns False if something changed.
   */
  override isNull(): boolean {
    return this.oldValue === this.newValue;
  }

  /**
   * Run a change event.
   *
   * @param forward True if run forward, false if run backward (undo).
   */
  override run(forward: boolean) {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      console.warn('Can\'t change non-existent block: ' + this.blockId);
      return;
    }
    // Assume the block is rendered so that then we can check.
    const blockSvg = block as BlockSvg;
    if (blockSvg.mutator) {
      // Close the mutator (if open) since we don't want to update it.
      blockSvg.mutator.setVisible(false);
    }
    const value = forward ? this.newValue : this.oldValue;
    switch (this.element) {
      case 'field': {
        const field = block.getField(this.name!);
        if (field) {
          field.setValue(value);
        } else {
          console.warn('Can\'t set non-existent field: ' + this.name);
        }
        break;
      }
      case 'comment':
        block.setCommentText(value as string || null);
        break;
      case 'collapsed':
        block.setCollapsed(!!value);
        break;
      case 'disabled':
        block.setEnabled(!value);
        break;
      case 'inline':
        block.setInputsInline(!!value);
        break;
      case 'mutation': {
        const oldState = BlockChange.getExtraBlockState_(block as BlockSvg);
        if (block.loadExtraState) {
          block.loadExtraState(JSON.parse(value as string || '{}'));
        } else if (block.domToMutation) {
          block.domToMutation(Xml.textToDom(value as string || '<mutation/>'));
        }
        eventUtils.fire(
            new BlockChange(block, 'mutation', null, oldState, value));
        break;
      }
      default:
        console.warn('Unknown change type: ' + this.element);
    }
  }

  // TODO (#5397): Encapsulate this in the BlocklyMutationChange event when
  //    refactoring change events.
  /**
   * Returns the extra state of the given block (either as XML or a JSO,
   * depending on the block's definition).
   *
   * @param block The block to get the extra state of.
   * @returns A stringified version of the extra state of the given block.
   * @internal
   */
  static getExtraBlockState_(block: BlockSvg): string {
    if (block.saveExtraState) {
      const state = block.saveExtraState();
      return state ? JSON.stringify(state) : '';
    } else if (block.mutationToDom) {
      const state = block.mutationToDom();
      return state ? Xml.domToText(state) : '';
    }
    return '';
  }
}

export interface BlockChangeJson extends BlockBaseJson {
  element: string;
  name?: string;
  newValue: unknown;
  oldValue: unknown;
}

registry.register(registry.Type.EVENT, eventUtils.CHANGE, BlockChange);
