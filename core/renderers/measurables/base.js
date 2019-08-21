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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';

goog.provide('Blockly.blockRendering.Measurable');

goog.require('Blockly.blockRendering.constants');


/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 * @package
 * @constructor
 */
Blockly.blockRendering.Measurable = function() {
  this.isInput = false;
  this.width = 0;
  this.height = 0;
  this.type = null;

  this.xPos = 0;
  this.centerline = 0;
};

/**
 * The shape object to use when drawing input and output connections.
 * TODO (#2803): Formalize type annotations for these objects.
 * @type {Object}
 */
Blockly.blockRendering.Measurable.prototype.connectionShape =
    Blockly.blockRendering.constants.PUZZLE_TAB;

/**
 * The shape object to use when drawing previous and next connections.
 * TODO (#2803): Formalize type annotations for these objects.
 * @type {Object}
 */
Blockly.blockRendering.Measurable.prototype.notchShape =
    Blockly.blockRendering.constants.NOTCH;

/**
 * The offset from the left side of a block or the inside of a statement input
 * to the left side of the connection notch.
 * @type {number}
 */
Blockly.blockRendering.Measurable.prototype.notchOffset =
    Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT;

// TODO: We may remove these helper functions if all of them end up being direct
// checks against types.

/**
 * Whether this stores information about a field.
 * @return {boolean} True if this object stores information about a field.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isField = function() {
  return this.type == 'field';
};

/**
 * Whether this stores information about a hat.
 * @return {boolean} True if this object stores information about a hat.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isHat = function() {
  return this.type == 'hat';
};

/**
 * Whether this stores information about an icon.
 * @return {boolean} True if this object stores information about an icon.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isIcon = function() {
  return this.type == 'icon';
};

/**
 * Whether this stores information about a spacer.
 * @return {boolean} True if this object stores information about a spacer.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isSpacer = function() {
  return this.type == 'between-row spacer' || this.type == 'in-row spacer';
};

/**
 * Whether this stores information about an external input.
 * @return {boolean} True if this object stores information about an external
 * input.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isExternalInput = function() {
  return this.type == 'external value input';
};

/**
 * Whether this stores information about a inline input.
 * @return {boolean} True if this object stores information about a inline
 * input.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isInlineInput = function() {
  return this.type == 'inline input';
};

/**
 * Whether this stores information about a statement input.
 * @return {boolean} True if this object stores information about a statement
 * input.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isStatementInput = function() {
  return this.type == 'statement input';
};

/**
 * Whether this stores information about a previous connection.
 * @return {boolean} True if this object stores information about a previous
 * connection.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isPreviousConnection = function() {
  return this.type == 'previous connection';
};

/**
 * Whether this stores information about a next connection.
 * @return {boolean} True if this object stores information about an next
 * connection.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isNextConnection = function() {
  return this.type == 'next connection';
};

/**
 * Whether this stores information about a rounded corner.
 * @return {boolean} True if this object stores information about an rounded
 * corner.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isRoundedCorner = function() {
  return this.type == 'round corner';
};

/**
 * Whether this stores information about a square corner.
 * @return {boolean} True if this object stores information about an square
 * corner.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isSquareCorner = function() {
  return this.type == 'square corner';
};

/**
 * Whether this stores information about a jagged edge.
 * @return {boolean} True if this object stores information about a jagged edge.
 * @package
 */
Blockly.blockRendering.Measurable.prototype.isJaggedEdge = function() {
  return this.type == 'jagged edge';
};
