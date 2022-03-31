/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a single row on a rendered block.
 */

/**
 * Object representing a single row on a rendered block.
 * @class
 */
goog.module('Blockly.blockRendering.Row');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {InRowSpacer} = goog.requireType('Blockly.blockRendering.InRowSpacer');
/* eslint-disable-next-line no-unused-vars */
const {InputConnection} = goog.requireType('Blockly.blockRendering.InputConnection');
/* eslint-disable-next-line no-unused-vars */
const {Measurable} = goog.requireType('Blockly.blockRendering.Measurable');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object representing a single row on a rendered block and all of its
 * subcomponents.
 * @alias Blockly.blockRendering.Row
 */
class Row {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    /**
     * The type of this rendering object.
     * @package
     * @type {number}
     */
    this.type = Types.ROW;

    /**
     * An array of elements contained in this row.
     * @package
     * @type {!Array<!Measurable>}
     */
    this.elements = [];

    /**
     * The height of the row.
     * @package
     * @type {number}
     */
    this.height = 0;

    /**
     * The width of the row, from the left edge of the block to the right.
     * Does not include child blocks unless they are inline.
     * @package
     * @type {number}
     */
    this.width = 0;

    /**
     * The minimum height of the row.
     * @package
     * @type {number}
     */
    this.minHeight = 0;

    /**
     * The minimum width of the row, from the left edge of the block to the
     * right. Does not include child blocks unless they are inline.
     * @package
     * @type {number}
     */
    this.minWidth = 0;

    /**
     * The width of the row, from the left edge of the block to the edge of the
     * block or any connected child blocks.
     * @package
     * @type {number}
     */
    this.widthWithConnectedBlocks = 0;

    /**
     * The Y position of the row relative to the origin of the block's svg
     * group.
     * @package
     * @type {number}
     */
    this.yPos = 0;

    /**
     * The X position of the row relative to the origin of the block's svg
     * group.
     * @package
     * @type {number}
     */
    this.xPos = 0;

    /**
     * Whether the row has any external inputs.
     * @package
     * @type {boolean}
     */
    this.hasExternalInput = false;

    /**
     * Whether the row has any statement inputs.
     * @package
     * @type {boolean}
     */
    this.hasStatement = false;

    /**
     * Where the left edge of all of the statement inputs on the block should
     * be. This makes sure that statement inputs which are proceded by fields
     * of varius widths are all aligned.
     * @type {number}
     */
    this.statementEdge = 0;

    /**
     * Whether the row has any inline inputs.
     * @package
     * @type {boolean}
     */
    this.hasInlineInput = false;

    /**
     * Whether the row has any dummy inputs.
     * @package
     * @type {boolean}
     */
    this.hasDummyInput = false;

    /**
     * Whether the row has a jagged edge.
     * @package
     * @type {boolean}
     */
    this.hasJaggedEdge = false;

    /**
     * The renderer's constant provider.
     * @type {!ConstantProvider}
     * @protected
     */
    this.constants_ = constants;

    /**
     * @type {number}
     */
    this.notchOffset = this.constants_.NOTCH_OFFSET_LEFT;

    /**
     * Alignment of the row.
     * @package
     * @type {?number}
     */
    this.align = null;
  }

  /**
   * Get the last input on this row, if it has one.
   * @return {InputConnection} The last input on the row,
   *     or null.
   * @package
   */
  getLastInput() {
    // TODO: Consider moving this to InputRow, if possible.
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const elem = this.elements[i];
      if (Types.isInput(elem)) {
        return /** @type {InputConnection} */ (elem);
      }
    }
    return null;
  }

  /**
   * Inspect all subcomponents and populate all size properties on the row.
   * @package
   */
  measure() {
    throw Error('Unexpected attempt to measure a base Row.');
  }

  /**
   * Determines whether this row should start with an element spacer.
   * @return {boolean} Whether the row should start with a spacer.
   * @package
   */
  startsWithElemSpacer() {
    return true;
  }

  /**
   * Determines whether this row should end with an element spacer.
   * @return {boolean} Whether the row should end with a spacer.
   * @package
   */
  endsWithElemSpacer() {
    return true;
  }

  /**
   * Convenience method to get the first spacer element on this row.
   * @return {InRowSpacer} The first spacer element on
   *   this row.
   * @package
   */
  getFirstSpacer() {
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      if (Types.isSpacer(elem)) {
        return /** @type {InRowSpacer} */ (elem);
      }
    }
    return null;
  }

  /**
   * Convenience method to get the last spacer element on this row.
   * @return {InRowSpacer} The last spacer element on
   *   this row.
   * @package
   */
  getLastSpacer() {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const elem = this.elements[i];
      if (Types.isSpacer(elem)) {
        return /** @type {InRowSpacer} */ (elem);
      }
    }
    return null;
  }
}

exports.Row = Row;
