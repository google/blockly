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

goog.require('Blockly.blockRendering.Types');

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
  this.type = Blockly.blockRendering.Types.NONE;

  this.xPos = 0;
  this.centerline = 0;

  this.constants_ = Blockly.blockRendering.getConstants();
  this.notchOffset = this.constants_.NOTCH_OFFSET_LEFT;
};
