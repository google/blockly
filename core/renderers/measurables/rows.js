/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An object representing a single row on a rendered block and all
 * of its subcomponents.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Rows');

goog.require('Blockly.blockRendering.constants');
goog.require('Blockly.blockRendering.Input');
goog.require('Blockly.blockRendering.InRowSpacer');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.RenderedConnection');

/**
 * An object representing a single row on a rendered block and all of its
 * subcomponents.
 * @package
 * @constructor
 */
Blockly.blockRendering.Row = function() {
  /**
   * The type of this rendering object.
   * @package
   * @type {string}
   */
  this.type = 'row';

  /**
   * An array of elements contained in this row.
   * @package
   * @type {!Array.<!Blockly.blockRendering.Measurable>}
   */
  this.elements = [];

  // TODO: Should row extend measurable?  Some of these properties are shared.
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
   * The width of the row, from the left edge of the block to the edge of the
   * block or any connected child blocks.
   * @package
   * @type {number}
   */
  this.widthWithConnectedBlocks = 0;

  /**
   * The Y position of the row relative to the origin of the block's svg group.
   * @package
   * @type {number}
   */
  this.yPos = 0;

  /**
   * The X position of the row relative to the origin of the block's svg group.
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
};

/**
 * The shape object to use when drawing previous and next connections.
 * TODO (#2803): Formalize type annotations for these objects.
 * @type {Object}
 */
Blockly.blockRendering.Row.prototype.notchShape =
    Blockly.blockRendering.constants.NOTCH;

/**
 * Whether this is a spacer row.
 * @return {boolean} Always false.
 * @package
 */
Blockly.blockRendering.Row.prototype.isSpacer = function() {
  return false;
};

/**
 * Inspect all subcomponents and populate all size properties on the row.
 * @package
 */
Blockly.blockRendering.Row.prototype.measure = function() {
  var connectedBlockWidths = 0;
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (elem.isInput) {
      if (elem.type == 'statement input') {
        connectedBlockWidths += elem.connectedBlockWidth;
      } else if (elem.type == 'external value input' &&
          elem.connectedBlockWidth != 0) {
        connectedBlockWidths += (elem.connectedBlockWidth - elem.connectionWidth);
      }
    }
    if (!(elem.isSpacer())) {
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
};

/**
 * Get the last input on this row, if it has one.
 * @return {Blockly.blockRendering.Input} The last input on the row, or null.
 * @package
 */
Blockly.blockRendering.Row.prototype.getLastInput = function() {
  for (var i = this.elements.length - 1; i >= 0; i--) {
    var elem = this.elements[i];
    if (elem.isSpacer()) {
      continue;
    }
    if (elem.isInput) {
      return /** @type {Blockly.blockRendering.Input} */ (elem);
    } else if (elem.isField()) {
      return /** @type {Blockly.blockRendering.Input} */ (elem.parentInput);
    }
  }
  return null;
};

/**
 * Convenience method to get the first spacer element on this row.
 * TODO: I want to say that this is guaranteed to exist, but I'm not sure how.
 * I could check if it's null and throw, but that seems like overkill.
 * @return {Blockly.blockRendering.InRowSpacer} The first spacer element on
 *   this row.
 * @package
 */
Blockly.blockRendering.Row.prototype.getFirstSpacer = function() {
  return /** @type {Blockly.blockRendering.InRowSpacer} */ (this.elements[0]);
};

/**
 * Convenience method to get the last spacer element on this row.
 * TODO: I want to say that this is guaranteed to exist, but I'm not sure how.
 * I could check if it's null and throw, but that seems like overkill.
 * @return {Blockly.blockRendering.InRowSpacer} The last spacer element on
 *   this row.
 * @package
 */
Blockly.blockRendering.Row.prototype.getLastSpacer = function() {
  /* eslint-disable-next-line max-len */
  return /** @type {Blockly.blockRendering.InRowSpacer} */ (this.elements[this.elements.length - 1]);
};

/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * @param {!Blockly.BlockSvg} block The block for which this represents the top
 *     row.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.blockRendering.TopRow = function(block) {
  Blockly.blockRendering.TopRow.superClass_.constructor.call(this);

  this.type = 'top row';

  /**
   * The starting point for drawing the row, in the y direction.
   * This allows us to draw hats and simliar shapes that don't start at the
   * origin. Must be non-negative (see #2820).
   * @package
   * @type {number}
   */
  this.startY = 0;

  /**
   * Whether the block has a previous connection.
   * @package
   * @type {boolean}
   */
  this.hasPreviousConnection = !!block.previousConnection;

  /**
   * The previous connection on the block, if any.
   * TODO: Should this be the connection measurable instead? It would add some
   * indirection but would mean we aren't mixing connections and connection
   * measurables.
   * @type {Blockly.RenderedConnection}
   */
  this.connection = block.previousConnection;

  var precedesStatement = block.inputList.length &&
      block.inputList[0].type == Blockly.NEXT_STATEMENT;

  // This is the minimum height for the row. If one of its elements has a
  // greater height it will be overwritten in the compute pass.
  if (precedesStatement && !block.isCollapsed()) {
    this.height = Blockly.blockRendering.constants.LARGE_PADDING;
  } else {
    this.height = Blockly.blockRendering.constants.MEDIUM_PADDING;
  }
};
goog.inherits(Blockly.blockRendering.TopRow, Blockly.blockRendering.Row);

/**
 * Convenience method to get the measurable representing the previous
 * connection, if one exists.
 * @return {Blockly.blockRendering.PreviousConnection} The measurable that
 *     represents the previous connection on this block, or null.
 * @package
 */
Blockly.blockRendering.TopRow.prototype.getPreviousConnection = function() {
  if (this.hasPreviousConnection) {
    return /** @type {Blockly.blockRendering.PreviousConnection} */ (this.elements[2]);
  }
  return null;
};

/**
 * @override
 */
Blockly.blockRendering.TopRow.prototype.measure = function() {
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (!(elem.isSpacer())) {
      if (elem.type == 'hat') {
        this.startY = elem.startY;
        this.height = this.height + elem.height;
      }
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width;
};

/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next connections.
 * @param {!Blockly.BlockSvg} block The block for which this represents the
 *     bottom row.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.blockRendering.BottomRow = function(block) {
  Blockly.blockRendering.BottomRow.superClass_.constructor.call(this);
  this.type = 'bottom row';

  /**
   * Whether the block has a next connection.
   * @package
   * @type {boolean}
   */
  this.hasNextConnection = !!block.nextConnection;

  /**
   * The next connection on the block, if any.
   * TODO: Should this be the connection measurable instead?  It would add some
   * indirection but would mean we aren't mixing connections and connection
   * measurables.
   * @package
   * @type {Blockly.RenderedConnection}
   */
  this.connection = block.nextConnection;

  /**
   * The amount that the bottom of the block extends below the horizontal edge,
   * e.g. because of a next connection.  Must be non-negative (see #2820).
   * @package
   * @type {number}
   */
  this.overhangY = 0;

  var followsStatement =
      block.inputList.length &&
      block.inputList[block.inputList.length - 1].type == Blockly.NEXT_STATEMENT;
  this.hasFixedWidth = followsStatement && block.getInputsInline();

  // This is the minimum height for the row. If one of its elements has a greater
  // height it will be overwritten in the compute pass.
  if (followsStatement) {
    this.height = Blockly.blockRendering.constants.LARGE_PADDING;
  } else {
    this.height = this.notchShape.height;
  }
};
goog.inherits(Blockly.blockRendering.BottomRow,
    Blockly.blockRendering.Row);

/**
 * Convenience method to get the measurable representing the next
 * connection, if one exists.
 * @return {Blockly.blockRendering.NextConnection} The measurable that
 *     represents the next connection on this block, or null.
 * @package
 */
Blockly.blockRendering.BottomRow.prototype.getNextConnection = function() {
  if (this.hasNextConnection) {
    return /** @type {Blockly.blockRendering.NextConnection} */ (this.elements[2]);
  }
  return null;
};

/**
 * @override
 */
Blockly.blockRendering.BottomRow.prototype.measure = function() {
  for (var e = 0; e < this.elements.length; e++) {
    var elem = this.elements[e];
    this.width += elem.width;
    if (!(elem.isSpacer())) {
      if (elem.type == 'next connection') {
        this.height = this.height + elem.height;
        this.overhangY = elem.height;
      }
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.widthWithConnectedBlocks = this.width;
};
