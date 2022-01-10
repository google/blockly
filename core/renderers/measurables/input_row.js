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

const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {Row} = goog.require('Blockly.blockRendering.Row');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about a row that holds one or more inputs.
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Row}
 * @alias Blockly.blockRendering.InputRow
 */
const InputRow = function(constants) {
  InputRow.superClass_.constructor.call(this, constants);
  this.type |= Types.INPUT_ROW;

  /**
   * The total width of all blocks connected to this row.
   * @type {number}
   * @package
   */
  this.connectedBlockWidths = 0;
};
object.inherits(InputRow, Row);

/**
 * Inspect all subcomponents and populate all size properties on the row.
 * @package
 */
InputRow.prototype.measure = function() {
  this.width = this.minWidth;
  this.height = this.minHeight;
  let connectedBlockWidths = 0;
  for (let i = 0; i < this.elements.length; i++) {
    const elem = this.elements[i];
    this.width += elem.width;
    if (Types.isInput(elem)) {
      if (Types.isStatementInput(elem)) {
        connectedBlockWidths += elem.connectedBlockWidth;
      } else if (
          Types.isExternalInput(elem) && elem.connectedBlockWidth !== 0) {
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
};

/**
 * @override
 */
InputRow.prototype.endsWithElemSpacer = function() {
  return !this.hasExternalInput && !this.hasStatement;
};

exports.InputRow = InputRow;
