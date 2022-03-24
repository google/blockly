/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing an input (value, statement, or dummy).
 */
'use strict';

/**
 * Object representing an input (value, statement, or dummy).
 * @class
 */
goog.module('Blockly.Input');

const fieldRegistry = goog.require('Blockly.fieldRegistry');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {Connection} = goog.requireType('Blockly.Connection');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
const {inputTypes} = goog.require('Blockly.inputTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.FieldLabel');


/**
 * Class for an input with an optional field.
 * @alias Blockly.Input
 */
class Input {
  /**
   * @param {number} type The type of the input.
   * @param {string} name Language-neutral identifier which may used to find
   *     this input again.
   * @param {!Block} block The block containing this input.
   * @param {Connection} connection Optional connection for this input.
   */
  constructor(type, name, block, connection) {
    if (type !== inputTypes.DUMMY && !name) {
      throw Error(
          'Value inputs and statement inputs must have non-empty name.');
    }
    /** @type {number} */
    this.type = type;
    /** @type {string} */
    this.name = name;
    /**
     * @type {!Block}
     * @private
     */
    this.sourceBlock_ = block;
    /** @type {Connection} */
    this.connection = connection;
    /** @type {!Array<!Field>} */
    this.fieldRow = [];

    /**
     * Alignment of input's fields (left, right or centre).
     * @type {number}
     */
    this.align = Align.LEFT;

    /**
     * Is the input visible?
     * @type {boolean}
     * @private
     */
    this.visible_ = true;
  }

  /**
   * Get the source block for this input.
   * @return {?Block} The source block, or null if there is none.
   */
  getSourceBlock() {
    return this.sourceBlock_;
  }

  /**
   * Add a field (or label from string), and all prefix and suffix fields, to
   * the end of the input's field row.
   * @param {string|!Field} field Something to add as a field.
   * @param {string=} opt_name Language-neutral identifier which may used to
   *     find this field again.  Should be unique to the host block.
   * @return {!Input} The input being append to (to allow chaining).
   */
  appendField(field, opt_name) {
    this.insertFieldAt(this.fieldRow.length, field, opt_name);
    return this;
  }

  /**
   * Inserts a field (or label from string), and all prefix and suffix fields,
   * at the location of the input's field row.
   * @param {number} index The index at which to insert field.
   * @param {string|!Field} field Something to add as a field.
   * @param {string=} opt_name Language-neutral identifier which may used to
   *     find this field again.  Should be unique to the host block.
   * @return {number} The index following the last inserted field.
   */
  insertFieldAt(index, field, opt_name) {
    if (index < 0 || index > this.fieldRow.length) {
      throw Error('index ' + index + ' out of bounds.');
    }
    // Falsy field values don't generate a field, unless the field is an empty
    // string and named.
    if (!field && !(field === '' && opt_name)) {
      return index;
    }

    // Generate a FieldLabel when given a plain text field.
    if (typeof field === 'string') {
      field = /** @type {!Field} **/ (fieldRegistry.fromJson({
        'type': 'field_label',
        'text': field,
      }));
    }

    field.setSourceBlock(this.sourceBlock_);
    if (this.sourceBlock_.rendered) {
      field.init();
      field.applyColour();
    }
    field.name = opt_name;
    field.setVisible(this.isVisible());

    if (field.prefixField) {
      // Add any prefix.
      index = this.insertFieldAt(index, field.prefixField);
    }
    // Add the field to the field row.
    this.fieldRow.splice(index, 0, field);
    index++;
    if (field.suffixField) {
      // Add any suffix.
      index = this.insertFieldAt(index, field.suffixField);
    }

    if (this.sourceBlock_.rendered) {
      this.sourceBlock_ = /** @type {!BlockSvg} */ (this.sourceBlock_);
      this.sourceBlock_.render();
      // Adding a field will cause the block to change shape.
      this.sourceBlock_.bumpNeighbours();
    }
    return index;
  }

  /**
   * Remove a field from this input.
   * @param {string} name The name of the field.
   * @param {boolean=} opt_quiet True to prevent an error if field is not
   *     present.
   * @return {boolean} True if operation succeeds, false if field is not present
   *     and opt_quiet is true.
   * @throws {Error} if the field is not present and opt_quiet is false.
   */
  removeField(name, opt_quiet) {
    for (let i = 0, field; (field = this.fieldRow[i]); i++) {
      if (field.name === name) {
        field.dispose();
        this.fieldRow.splice(i, 1);
        if (this.sourceBlock_.rendered) {
          this.sourceBlock_ = /** @type {!BlockSvg} */ (this.sourceBlock_);
          this.sourceBlock_.render();
          // Removing a field will cause the block to change shape.
          this.sourceBlock_.bumpNeighbours();
        }
        return true;
      }
    }
    if (opt_quiet) {
      return false;
    }
    throw Error('Field "' + name + '" not found.');
  }

  /**
   * Gets whether this input is visible or not.
   * @return {boolean} True if visible.
   */
  isVisible() {
    return this.visible_;
  }

  /**
   * Sets whether this input is visible or not.
   * Should only be used to collapse/uncollapse a block.
   * @param {boolean} visible True if visible.
   * @return {!Array<!BlockSvg>} List of blocks to render.
   * @package
   */
  setVisible(visible) {
    // Note: Currently there are only unit tests for block.setCollapsed()
    // because this function is package. If this function goes back to being a
    // public API tests (lots of tests) should be added.
    let renderList = [];
    if (this.visible_ === visible) {
      return renderList;
    }
    this.visible_ = visible;

    for (let y = 0, field; (field = this.fieldRow[y]); y++) {
      field.setVisible(visible);
    }
    if (this.connection) {
      this.connection =
          /** @type {!RenderedConnection} */ (this.connection);
      // Has a connection.
      if (visible) {
        renderList = this.connection.startTrackingAll();
      } else {
        this.connection.stopTrackingAll();
      }
      const child = this.connection.targetBlock();
      if (child) {
        child.getSvgRoot().style.display = visible ? 'block' : 'none';
      }
    }
    return renderList;
  }

  /**
   * Mark all fields on this input as dirty.
   * @package
   */
  markDirty() {
    for (let y = 0, field; (field = this.fieldRow[y]); y++) {
      field.markDirty();
    }
  }

  /**
   * Change a connection's compatibility.
   * @param {string|Array<string>|null} check Compatible value type or
   *     list of value types.  Null if all types are compatible.
   * @return {!Input} The input being modified (to allow chaining).
   */
  setCheck(check) {
    if (!this.connection) {
      throw Error('This input does not have a connection.');
    }
    this.connection.setCheck(check);
    return this;
  }

  /**
   * Change the alignment of the connection's field(s).
   * @param {number} align One of the values of Align
   *   In RTL mode directions are reversed, and Align.RIGHT aligns to the left.
   * @return {!Input} The input being modified (to allow chaining).
   */
  setAlign(align) {
    this.align = align;
    if (this.sourceBlock_.rendered) {
      this.sourceBlock_ = /** @type {!BlockSvg} */ (this.sourceBlock_);
      this.sourceBlock_.render();
    }
    return this;
  }

  /**
   * Changes the connection's shadow block.
   * @param {?Element} shadow DOM representation of a block or null.
   * @return {!Input} The input being modified (to allow chaining).
   */
  setShadowDom(shadow) {
    if (!this.connection) {
      throw Error('This input does not have a connection.');
    }
    this.connection.setShadowDom(shadow);
    return this;
  }

  /**
   * Returns the XML representation of the connection's shadow block.
   * @return {?Element} Shadow DOM representation of a block or null.
   */
  getShadowDom() {
    if (!this.connection) {
      throw Error('This input does not have a connection.');
    }
    return this.connection.getShadowDom();
  }

  /**
   * Initialize the fields on this input.
   */
  init() {
    if (!this.sourceBlock_.workspace.rendered) {
      return;  // Headless blocks don't need fields initialized.
    }
    for (let i = 0; i < this.fieldRow.length; i++) {
      this.fieldRow[i].init();
    }
  }

  /**
   * Sever all links to this input.
   * @suppress {checkTypes}
   */
  dispose() {
    for (let i = 0, field; (field = this.fieldRow[i]); i++) {
      field.dispose();
    }
    if (this.connection) {
      this.connection.dispose();
    }
    this.sourceBlock_ = null;
  }
}

/**
 * Enum for alignment of inputs.
 * @enum {number}
 * @alias Blockly.Input.Align
 */
const Align = {
  LEFT: -1,
  CENTRE: 0,
  RIGHT: 1,
};
exports.Align = Align;

// Add Align to Input so that `Blockly.Input.Align` is publicly accessible.
Input.Align = Align;

exports.Input = Input;
