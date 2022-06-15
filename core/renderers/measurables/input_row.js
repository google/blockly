/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a row that holds one or more inputs on a
 * rendered block.
 */

/**
 * Object representing a row that holds one or more inputs on a
 * rendered block.
 * @class
 */
goog.module('Blockly.blockRendering.InputRow');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {InputConnection} = goog.require('Blockly.blockRendering.InputConnection');
const {ExternalValueInput} = goog.require('Blockly.blockRendering.ExternalValueInput');
const {Row} = goog.require('Blockly.blockRendering.Row');
const {StatementInput} = goog.require('Blockly.blockRendering.StatementInput');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about a row that holds one or more inputs.
 * @extends {Row}
 * @struct
 * @alias Blockly.blockRendering.InputRow
 */
class InputRow extends Row {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    super(constants);
    this.type |= Types.INPUT_ROW;

    /**
     * The total width of all blocks connected to this row.
     * @type {number}
     * @package
     */
    this.connectedBlockWidths = 0;
  }

  /**
   * Inspect all subcomponents and populate all size properties on the row.
   * @package
   */
  measure() {
    this.width = this.minWidth;
    this.height = this.minHeight;
    let connectedBlockWidths = 0;
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      this.width += elem.width;
      if (Types.isInput(elem) && elem instanceof InputConnection) {
        if (Types.isStatementInput(elem) && elem instanceof StatementInput) {
          connectedBlockWidths += elem.connectedBlockWidth;
        } else if (
            Types.isExternalInput(elem) && elem instanceof ExternalValueInput &&
            elem.connectedBlockWidth !== 0) {
          connectedBlockWidths +=
              (elem.connectedBlockWidth - elem.connectionWidth);
        }
      }
      if (!(Types.isSpacer(elem))) {
        this.height = Math.max(this.height, elem.height);
      }
    }
    this.connectedBlockWidths = connectedBlockWidths;
    this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
  }

  /**
   * @override
   */
  endsWithElemSpacer() {
    return !this.hasExternalInput && !this.hasStatement;
  }
}

exports.InputRow = InputRow;
