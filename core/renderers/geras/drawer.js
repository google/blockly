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
 * @fileoverview Renderer that preserves the look and feel of Blockly pre-2019.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Drawer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.geras.Highlighter');
goog.require('Blockly.geras.PathObject');
goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.geras.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.geras.Drawer = function(block, info) {
  Blockly.geras.Drawer.superClass_.constructor.call(this, block, info);
  // Unlike Thrasos, Geras has highlights and drop shadows.
  this.highlighter_ = new Blockly.geras.Highlighter(info);
};
Blockly.utils.object.inherits(Blockly.geras.Drawer,
    Blockly.blockRendering.Drawer);

/**
 * @override
 */
Blockly.geras.Drawer.prototype.draw = function() {
  this.hideHiddenIcons_();
  this.drawOutline_();
  this.drawInternals_();

  this.block_.pathObject.setPaths(this.outlinePath_ + '\n' + this.inlinePath_,
      this.highlighter_.getPath());
  if (this.info_.RTL) {
    this.block_.pathObject.flipRTL();
  }
  if (Blockly.blockRendering.useDebugger) {
    this.block_.renderingDebugger.drawDebug(this.block_, this.info_);
  }
  this.recordSizeOnBlock_();
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawTop_ = function() {
  this.highlighter_.drawTopCorner(this.info_.topRow);
  this.highlighter_.drawRightSideRow(this.info_.topRow);

  Blockly.geras.Drawer.superClass_.drawTop_.call(this);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawJaggedEdge_ = function(row) {
  this.highlighter_.drawJaggedEdge_(row);

  Blockly.geras.Drawer.superClass_.drawJaggedEdge_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawValueInput_ = function(row) {
  this.highlighter_.drawValueInput(row);

  Blockly.geras.Drawer.superClass_.drawValueInput_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawStatementInput_ = function(row) {
  this.highlighter_.drawStatementInput(row);

  Blockly.geras.Drawer.superClass_.drawStatementInput_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawRightSideRow_ = function(row) {
  this.highlighter_.drawRightSideRow(row);
  Blockly.geras.Drawer.superClass_.drawRightSideRow_.call(this, row);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawBottom_ = function() {
  this.highlighter_.drawBottomRow(this.info_.bottomRow);

  Blockly.geras.Drawer.superClass_.drawBottom_.call(this);
};

/**
 * Add steps for the left side of the block, which may include an output
 * connection
 * @private
 */
Blockly.geras.Drawer.prototype.drawLeft_ = function() {
  this.highlighter_.drawLeft();

  Blockly.geras.Drawer.superClass_.drawLeft_.call(this);
};

/**
 * @override
 */
Blockly.geras.Drawer.prototype.drawInlineInput_ = function(input) {
  this.highlighter_.drawInlineInput(input);

  Blockly.geras.Drawer.superClass_.drawInlineInput_.call(this, input);
};
