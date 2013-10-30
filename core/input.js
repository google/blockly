/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Object representing an input (value, statement, or dummy).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Input');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.Connection');
goog.require('Blockly.FieldLabel');


/**
 * Class for an input with an optional title.
 * @param {number} type The type of the input.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.
 * @param {!Blockly.Block} block The block containing this input.
 * @param {Blockly.Connection} connection Optional connection for this input.
 * @constructor
 */
Blockly.Input = function(type, name, block, connection) {
  this.type = type;
  this.name = name;
  this.sourceBlock_ = block;
  this.connection = connection;
  this.titleRow = [];
  this.align = Blockly.ALIGN_LEFT;

  this.visible_ = true;
};

/**
 * Add an item to the end of the input's title row.
 * @param {*} title Something to add as a title.
 * @param {string} opt_name Language-neutral identifier which may used to find
 *     this title again.  Should be unique to the host block.
 * @return {!Blockly.Input} The input being append to (to allow chaining).
 */
Blockly.Input.prototype.appendTitle = function(title, opt_name) {
  // Empty string, Null or undefined generates no title, unless title is named.
  if (!title && !opt_name) {
    return this;
  }
  // Generate a FieldLabel when given a plain text title.
  if (goog.isString(title)) {
    title = new Blockly.FieldLabel(/** @type {string} */ (title));
  }
  if (this.sourceBlock_.svg_) {
    title.init(this.sourceBlock_);
  }
  title.name = opt_name;

  if (title.prefixTitle) {
    // Add any prefix.
    this.appendTitle(title.prefixTitle);
  }
  // Add the title to the title row.
  this.titleRow.push(title);
  if (title.suffixTitle) {
    // Add any suffix.
    this.appendTitle(title.suffixTitle);
  }

  if (this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    // Adding a title will cause the block to change shape.
    this.sourceBlock_.bumpNeighbours_();
  }
  return this;
};

/**
 * Gets whether this input is visible or not.
 * @return {boolean} True if visible.
 */
Blockly.Input.prototype.isVisible = function() {
  return this.visible_;
};

/**
 * Sets whether this input is visible or not.
 * @param {boolean} visible True if visible.
 * @return {!Array.<!Blockly.Block>} List of blocks to render.
 */
Blockly.Input.prototype.setVisible = function(visible) {
  var renderList = [];
  if (this.visible_ == visible) {
    return renderList;
  }
  this.visible_ = visible;

  var display = visible ? 'block' : 'none';
  for (var y = 0, title; title = this.titleRow[y]; y++) {
    title.setVisible(visible);
  }
  if (this.connection) {
    // Has a connection.
    if (visible) {
      renderList = this.connection.unhideAll();
    } else {
      renderList = this.connection.hideAll();
    }
    var child = this.connection.targetBlock();
    if (child) {
      child.svg_.getRootElement().style.display = display;
      if (!visible) {
        child.rendered = false;
      }
    }
  }
  return renderList;
};

/**
 * Change a connection's compatibility.
 * @param {string|Array.<string>|null} check Compatible value type or
 *     list of value types.  Null if all types are compatible.
 * @return {!Blockly.Input} The input being modified (to allow chaining).
 */
Blockly.Input.prototype.setCheck = function(check) {
  if (!this.connection) {
    throw 'This input does not have a connection.';
  }
  this.connection.setCheck(check);
  return this;
};

/**
 * Change the alignment of the connection's title(s).
 * @param {number} align One of Blockly.ALIGN_LEFT, ALIGN_CENTRE, ALIGN_RIGHT.
 *   In RTL mode directions are reversed, and ALIGN_RIGHT aligns to the left.
 * @return {!Blockly.Input} The input being modified (to allow chaining).
 */
Blockly.Input.prototype.setAlign = function(align) {
  this.align = align;
  if (this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
  }
  return this;
};

/**
 * Initialize the titles on this input.
 */
Blockly.Input.prototype.init = function() {
  for (var x = 0; x < this.titleRow.length; x++) {
    this.titleRow[x].init(this.sourceBlock_);
  }
};

/**
 * Sever all links to this input.
 */
Blockly.Input.prototype.dispose = function() {
  for (var i = 0, title; title = this.titleRow[i]; i++) {
    title.dispose();
  }
  if (this.connection) {
    this.connection.dispose();
  }
  this.sourceBlock_ = null;
};
