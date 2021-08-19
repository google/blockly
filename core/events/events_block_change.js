/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a block change event.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.Events.BlockChange');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const Block = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const BlockSvg = goog.requireType('Blockly.BlockSvg');
const Events = goog.require('Blockly.Events');
const Xml = goog.require('Blockly.Xml');
const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a block change event.
 * @param {!Block=} opt_block The changed block.  Undefined for a blank
 *     event.
 * @param {string=} opt_element One of 'field', 'comment', 'disabled', etc.
 * @param {?string=} opt_name Name of input or field affected, or null.
 * @param {*=} opt_oldValue Previous value of element.
 * @param {*=} opt_newValue New value of element.
 * @extends {Events.BlockBase}
 * @constructor
 */
const BlockChange = function(
    opt_block, opt_element, opt_name, opt_oldValue, opt_newValue) {
  BlockChange.superClass_.constructor.call(this, opt_block);
  if (!opt_block) {
    return;  // Blank event to be populated by fromJson.
  }
  this.element = typeof opt_element == 'undefined' ? '' : opt_element;
  this.name = typeof opt_name == 'undefined' ? '' : opt_name;
  this.oldValue = typeof opt_oldValue == 'undefined' ? '' : opt_oldValue;
  this.newValue = typeof opt_newValue == 'undefined' ? '' : opt_newValue;
};
object.inherits(BlockChange, Events.BlockBase);

/**
 * Type of this event.
 * @type {string}
 */
BlockChange.prototype.type = Events.BLOCK_CHANGE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
BlockChange.prototype.toJson = function() {
  const json = BlockChange.superClass_.toJson.call(this);
  json['element'] = this.element;
  if (this.name) {
    json['name'] = this.name;
  }
  json['oldValue'] = this.oldValue;
  json['newValue'] = this.newValue;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
BlockChange.prototype.fromJson = function(json) {
  BlockChange.superClass_.fromJson.call(this, json);
  this.element = json['element'];
  this.name = json['name'];
  this.oldValue = json['oldValue'];
  this.newValue = json['newValue'];
};

/**
 * Does this event record any change of state?
 * @return {boolean} False if something changed.
 */
BlockChange.prototype.isNull = function() {
  return this.oldValue == this.newValue;
};

/**
 * Run a change event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
BlockChange.prototype.run = function(forward) {
  const workspace = this.getEventWorkspace_();
  const block = workspace.getBlockById(this.blockId);
  if (!block) {
    console.warn('Can\'t change non-existent block: ' + this.blockId);
    return;
  }
  if (block.mutator) {
    // Close the mutator (if open) since we don't want to update it.
    block.mutator.setVisible(false);
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
        block.loadExtraState(JSON.parse(/** @type {string} */ (value) || '{}'));
      } else if (block.domToMutation) {
        block.domToMutation(
            Xml.textToDom(/** @type {string} */ (value) || '<mutation/>'));
      }
      Events.fire(new BlockChange(block, 'mutation', null, oldState, value));
      break;
    }
    default:
      console.warn('Unknown change type: ' + this.element);
  }
};

// TODO (#5397): Encapsulate this in the BlocklyMutationChange event when
//    refactoring change events.
/**
 * Returns the extra state of the given block (either as XML or a JSO, depending
 * on the block's definition).
 * @param {!BlockSvg} block The block to get the extra state of.
 * @return {string} A stringified version of the extra state of the given block.
 * @package
 */
BlockChange.getExtraBlockState_ = function(block) {
  if (block.saveExtraState) {
    const state = block.saveExtraState();
    return state ? JSON.stringify(state) : '';
  } else if (block.mutationToDom) {
    const state = block.mutationToDom();
    return state ? Xml.domToText(state) : '';
  }
  return '';
};

registry.register(registry.Type.EVENT, Events.CHANGE, BlockChange);

exports = BlockChange;
