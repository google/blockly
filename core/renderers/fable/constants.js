/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview An object that provides constants for rendering blocks in Fable
 * mode.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.fable.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.object');

/**
 * An object that provides constants for rendering blocks in Fable mode.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.fable.ConstantProvider = function () {
  Blockly.fable.ConstantProvider.superClass_.constructor.call(this);

  // The dark/shadow path in classic rendering is the same as the normal block
  // path, but translated down one and right one.
  this.DARK_PATH_OFFSET = 1;

  // this.TAB_HEIGHT = 15;

  // VERTICAL(!) Margin (empty space) that is added to the top and bottom of each block.
  // Added before the first line of a block and after the last line of it.
  // NOTE: USED WHEN THE BLOCK HAS AN ICON.
  this.Y_MARGIN_TOP_WITH_IMAGE = 15;

  // VERTICAL(!) Margin (empty space) that is added to the top and bottom of each block.
  // Added before the first line of a block and after the last line of it.
  // NOTE: USED WHEN THE BLOCK DOES NOT HAVE AN ICON.
  this.Y_MARGIN_TOP = 5;

  // VERTICAL(!) Margin (empty space) that is added between lines in each block.
  // If only 1 line exists, this will not be added.
  this.ROW_SPACING = 5;

  this.INLINE_PADDING_Y = 5;

  this.NOTCH_WIDTH = 16;
  this.NOTCH_INNER_WIDTH = 2;

  // Unknown if we need these
  this.SEP_SPACE_X = 10;
  this.SEP_SPACE_Y = 10;
  this.MIN_BLOCK_Y = 25;
  this.JAGGED_TEETH_HEIGHT = 20;
  this.JAGGED_TEETH_WIDTH = 15;

  this.START_HAT = false;
};
Blockly.utils.object.inherits(Blockly.fable.ConstantProvider,
  Blockly.blockRendering.ConstantProvider);
