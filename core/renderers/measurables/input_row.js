/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a row that holds one or more inputs on a
 * rendered block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.InputRow');
goog.module.declareLegacyNamespace();

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


/**
 * An object containing information about a row that holds one or more inputs.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
const InputRow = function(constants) {
  InputRow.superClass_.constructor.call(this, constants);
  this.type |= Blockly.blockRendering.Types.INPUT_ROW;

  /**
   * The total width of all blocks connected to this row.
   * @type {number}
   * @package
   */
  this.connectedBlockWidths = 0;
};
Blockly.utils.object.inherits(InputRow,
    Blockly.blockRendering.Row);

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
    if (Blockly.blockRendering.Types.isInput(elem)) {
      if (Blockly.blockRendering.Types.isStatementInput(elem)) {
        connectedBlockWidths += elem.connectedBlockWidth;
      } else if (Blockly.blockRendering.Types.isExternalInput(elem) &&
          elem.connectedBlockWidth != 0) {
        connectedBlockWidths += (elem.connectedBlockWidth -
          elem.connectionWidth);
      }
    }
    if (!(Blockly.blockRendering.Types.isSpacer(elem))) {
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

exports = InputRow;
