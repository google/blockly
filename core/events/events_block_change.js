/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a block change event.
 */
'use strict';

/**
 * Class for a block change event.
 * @class
 */
goog.module('Blockly.Events.BlockChange');

const Xml = goog.require('Blockly.Xml');
const eventUtils = goog.require('Blockly.Events.utils');
const registry = goog.require('Blockly.registry');
const {BlockBase} = goog.require('Blockly.Events.BlockBase');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');


/**
 * Class for a block change event.
 * @extends {BlockBase}
 * @alias Blockly.Events.BlockChange
 */
class BlockChange extends BlockBase {
  /**
   * @param {!Block=} opt_block The changed block.  Undefined for a blank
   *     event.
   * @param {string=} opt_element One of 'field', 'comment', 'disabled', etc.
   * @param {?string=} opt_name Name of input or field affected, or null.
   * @param {*=} opt_oldValue Previous value of element.
   * @param {*=} opt_newValue New value of element.
   */
  constructor(opt_block, opt_element, opt_name, opt_oldValue, opt_newValue) {
    super(opt_block);

    /**
     * Type of this event.
     * @type {string}
     */
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
   * @return {!Object} JSON representation.
   */
  toJson() {
    const json = super.toJson();
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
   * @param {!Object} json JSON representation.
   */
  fromJson(json) {
    super.fromJson(json);
    this.element = json['element'];
    this.name = json['name'];
    this.oldValue = json['oldValue'];
    this.newValue = json['newValue'];
  }

  /**
   * Does this event record any change of state?
   * @return {boolean} False if something changed.
   */
  isNull() {
    return this.oldValue === this.newValue;
  }

  /**
   * Run a change event.
   * @param {boolean} forward True if run forward, false if run backward (undo).
   */
  run(forward) {
    const workspace = this.getEventWorkspace_();
    const block = workspace.getBlockById(this.blockId);
    if (!block) {
      console.warn('Can\'t change non-existent block: ' + this.blockId);
      return;
    }

    // Assume the block is rendered so that then we can check.
    const blockSvg = /** @type {!BlockSvg} */ (block);
    if (blockSvg.mutator) {
      // Close the mutator (if open) since we don't want to update it.
      blockSvg.mutator.setVisible(false);
    }
    const value = forward ? this.newValue : this.oldValue;
    switch (this.element) {
      case 'field': {
        const field = block.getField(this.name);
        if (field) {
          field.setValue(value);
        } else {
          console.warn('Can\'t set non-existent field: ' + this.name);
        }
        break;
      }
      case 'comment':
        block.setCommentText(/** @type {string} */ (value) || null);
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
        const oldState = BlockChange.getExtraBlockState_(
            /** @type {!BlockSvg} */ (block));
        if (block.loadExtraState) {
          block.loadExtraState(
              JSON.parse(/** @type {string} */ (value) || '{}'));
        } else if (block.domToMutation) {
          block.domToMutation(
              Xml.textToDom(/** @type {string} */ (value) || '<mutation/>'));
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
   * @param {!BlockSvg} block The block to get the extra state of.
   * @return {string} A stringified version of the extra state of the given
   *     block.
   * @package
   */
  static getExtraBlockState_(block) {
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

registry.register(registry.Type.EVENT, eventUtils.CHANGE, BlockChange);

exports.BlockChange = BlockChange;
