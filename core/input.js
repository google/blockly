/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Object representing an input (value, statement, or dummy).
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Input');

goog.require('Blockly.Connection');
goog.require('Blockly.FieldLabel');
goog.require('goog.asserts');


/**
 * Class for an input with an optional field.
 * @param {number} type The type of the input.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.
 * @param {!Blockly.Block} block The block containing this input.
 * @param {Blockly.Connection} connection Optional connection for this input.
 * @constructor
 */
Blockly.Input = function(type, name, block, connection) {
  /** @type {number} */
  this.type = type;
  /** @type {string} */
  this.name = name;
  /**
   * @type {!Blockly.Block}
   * @private
   */
  this.sourceBlock_ = block;
  /** @type {Blockly.Connection} */
  this.connection = connection;
  /** @type {!Array.<!Blockly.Field>} */
  this.fieldRow = [];
};

/**
 * Alignment of input's fields (left, right or centre).
 * @type {number}
 */
Blockly.Input.prototype.align = Blockly.ALIGN_LEFT;

/**
 * Is the input visible?
 * @type {boolean}
 * @private
 */
Blockly.Input.prototype.visible_ = true;

/**
 * Add an item to the end of the input's field row.
 * @param {string|!Blockly.Field} field Something to add as a field.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this field again.  Should be unique to the host block.
 * @return {!Blockly.Input} The input being append to (to allow chaining).
 */
Blockly.Input.prototype.appendField = function(field, opt_name) {
  // Empty string, Null or undefined generates no field, unless field is named.
  if (!field && !opt_name) {
    return this;
  }
  // Generate a FieldLabel when given a plain text field.
  if (goog.isString(field)) {
    field = new Blockly.FieldLabel(/** @type {string} */ (field));
  }
  field.setSourceBlock(this.sourceBlock_);
  if (this.sourceBlock_.rendered) {
    field.init();
  }
  field.name = opt_name;

  if (field.prefixField) {
    // Add any prefix.
    this.appendField(field.prefixField);
  }
  // Add the field to the field row.
  this.fieldRow.push(field);
  if (field.suffixField) {
    // Add any suffix.
    this.appendField(field.suffixField);
  }

  if (this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    // Adding a field will cause the block to change shape.
    this.sourceBlock_.bumpNeighbours_();
  }
  return this;
};

/**
 * Remove a field from this input.
 * @param {string} name The name of the field.
 * @throws {goog.asserts.AssertionError} if the field is not present.
 */
Blockly.Input.prototype.removeField = function(name) {
  for (var i = 0, field; field = this.fieldRow[i]; i++) {
    if (field.name === name) {
      field.dispose();
      this.fieldRow.splice(i, 1);
      if (this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
        // Removing a field will cause the block to change shape.
        this.sourceBlock_.bumpNeighbours_();
      }
      return;
    }
  }
  goog.asserts.fail('Field "%s" not found.', name);
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
 * Used to collapse/uncollapse a block.
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
  for (var y = 0, field; field = this.fieldRow[y]; y++) {
    field.setVisible(visible);
  }
  if (this.connection) {
    // Has a connection.
    if (visible) {
      renderList = this.connection.unhideAll();
    } else {
      this.connection.hideAll();
    }
    var child = this.connection.targetBlock();
    if (child) {
      child.getSvgRoot().style.display = display;
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
 * Change the alignment of the connection's field(s).
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
 * Initialize the fields on this input.
 */
Blockly.Input.prototype.init = function() {
  if (!this.sourceBlock_.workspace.rendered) {
    return;  // Headless blocks don't need fields initialized.
  }
  for (var i = 0; i < this.fieldRow.length; i++) {
    this.fieldRow[i].init();
  }
};

/**
 * Sever all links to this input.
 */
Blockly.Input.prototype.dispose = function() {
  for (var i = 0, field; field = this.fieldRow[i]; i++) {
    field.dispose();
  }
  if (this.connection) {
    this.connection.dispose();
  }
  this.sourceBlock_ = null;
};
