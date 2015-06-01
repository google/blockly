/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Flexible templating system for defining blocks.
 * @author spertus@google.com (Ellen Spertus)
 */
'use strict';
goog.require('goog.asserts');

/**
 * Name space for the Blocks singleton.
 * Blocks gets populated in the blocks files, possibly through calls to
 * Blocks.addTemplate().
 */
goog.provide('Blockly.Blocks');

/**
 * Unique ID counter for created blocks.
 * @private
 */
Blockly.Blocks.uidCounter_ = 0;

/**
 * Generate a unique ID.  This will be locally or globally unique, depending on
 * whether we are in single user or realtime collaborative mode.
 * @return {string}
 */
Blockly.Blocks.genUid = function() {
  var uid = (++Blockly.Blocks.uidCounter_).toString();
  if (Blockly.Realtime.isEnabled()) {
    return Blockly.Realtime.genUid(uid);
  } else {
    return uid;
  }
};

/**
 * Create a block template and add it as a field to Blockly.Blocks with the
 * name details.blockName.
 * @param {!Object} details Details about the block that should be created.
 *     The following fields are used:
 *     - blockName {string} The name of the block, which should be unique.
 *     - colour {number} The hue value of the colour to use for the block.
 *       (Blockly.HSV_SATURATION and Blockly.HSV_VALUE are used for saturation
 *       and value, respectively.)
 *     - output {?string|Array.<string>} Output type.  If undefined, there are
 *       assumed to be no outputs.  Otherwise, this is interpreted the same way
 *       as arguments to Blockly.Block.setCheck():
 *       - null: Any type can be produced.
 *       - String: Only the specified type (e.g., 'Number') can be produced.
 *       - Array.<string>: Any of the specified types can be produced.
 *     - message {string} A message suitable for passing as a first argument to
 *       Blockly.Block.interpolateMsg().  Specifically, it should consist of
 *       text to be displayed on the block, optionally interspersed with
 *       references to inputs (one-based indices into the args array) or fields,
 *       such as '%1' for the first element of args.  The creation of dummy
 *       inputs can be forced with a newline (\n).
 *     - args {Array.<Object>} One or more descriptions of value inputs.
 *       TODO: Add Fields and statement stacks.
 *       Each object in the array can have the following fields:
 *       - name {string} The name of the input.
 *       - type {?number} One of Blockly.INPUT_VALUE, Blockly.NEXT_STATEMENT, or
 *         ??.   If not provided, it is assumed to be Blockly.INPUT_VALUE.
 *       - check {?string|Array.<string>} Input type.  See description of the
 *         output field above.
 *       - align {?number} One of Blockly.ALIGN_LEFT, Blockly.ALIGN_CENTRE, or
 *         Blockly.ALIGN_RIGHT (the default value, if not explicitly provided).
 *     - inline {?boolean}: Whether inputs should be inline (true) or external
 *       (false).  If not explicitly specified, inputs will be inline if message
 *       references, and ends with, a single value input.
 *     - previousStatement {?boolean} Whether there should be a statement
 *       connector on the top of the block.  If not specified, the default
 *       value will be !output.
 *     - nextStatement {?boolean} Whether there should be a statement
 *       connector on the bottom of the block.  If not specified, the default
 *       value will be !output.
 *     - tooltip {?string|Function} Tooltip text or a function on this block
 *       that returns a tooltip string.
 *     - helpUrl {?string|Function} The help URL, or a function on this block
 *       that returns the help URL.
 *     - switchable {?boolean} Whether the block should be switchable between
 *       an expression and statement.  Specifically, if true, the block will
 *       begin as an expression (having an output).  There will be a context
 *       menu option 'Remove output'.  If selected, the output will disappear,
 *       and previous and next statement connectors will appear.  The context
 *       menu option 'Remove output' will be replaced by 'Add Output'.  If
 *       selected, the output will reappear and the statement connectors will
 *       disappear.
 *     - mutationToDomFunc {Function} TODO desc.
 *     - domToMutationFunc {Function} TODO desc.
 *     - customContextMenuFunc {Function} TODO desc.
 *     Additional fields will be ignored.
 */
Blockly.Blocks.addTemplate = function(details) {
  // Validate inputs.  TODO: Add more.
  goog.asserts.assert(details.blockName);
  goog.asserts.assert(Blockly.Blocks[details.blockName],
      'Blockly.Blocks already has a field named ', details.blockName);
  goog.asserts.assert(details.message);
  goog.asserts.assert(details.colour && typeof details.colour == 'number' &&
      details.colour >= 0 && details.colour < 360,
     'details.colour must be a number from 0 to 360 (exclusive)');
  if (details.output != 'undefined') {
    goog.asserts.assert(!details.previousStatement,
        'When details.output is defined, ' +
        'details.previousStatement must not be true.');
    goog.asserts.assert(!details.nextStatement,
        'When details.output is defined, ' +
        'details.nextStatement must not be true.');
  }

  var block = {};
  /**
   * Build up template.
   * @this Blockly.Block
   */
  block.init = function() {
    var thisBlock = this;
    // Set basic properties of block.
    this.setColour(details.colour);
    this.setHelpUrl(details.helpUrl);
    if (typeof details.tooltip == 'string') {
      this.setTooltip(details.tooltip);
    } else if (typeof details.tooltip == 'function') {
      this.setTooltip(function() {
        return details.tooltip(thisBlock);
      });
    }
    // Set output and previous/next connections.
    if (details.output != 'undefined') {
      this.setOutput(true, details.output);
    } else {
      this.setPreviousStatement(
          typeof details.previousStatement == 'undefined' ?
              true : details.previousStatement);
      this.setNextStatement(
          typeof details.nextStatement == 'undefined' ?
              true : details.nextStatement);
    }
    // Build up arguments in the format expected by interpolateMsg.
    var interpArgs = [];
    interpArgs.push(details.text);
    if (details.args) {
      details.args.forEach(function(arg) {
        goog.asserts.assert(arg.name);
        goog.asserts.assert(arg.check != 'undefined');
        if (arg.type == 'undefined' || arg.type == Blockly.INPUT_VALUE) {
          interpArgs.push([arg.name,
                           arg.check,
                           typeof arg.align == 'undefined' ?
                               Blockly.ALIGN_RIGHT : arg.align]);
        } else {
          // TODO: Write code for other input types.
          goog.asserts.fail('addTemplate() can only handle value inputs.');
        }
      });
    }
    // Neil, how would you recommend specifying the final dummy alignment?
    // Should it be a top-level field in details?
    interpArgs.push(Blockly.ALIGN_RIGHT);
    if (details.inline) {
      this.setInlineInputs(details.inline);
    }
    Blockly.Block.prototype.interpolateMsg.apply(this, interpArgs);
  };

  if (details.switchable) {
    /**
     * Create mutationToDom if needed.
     * @this Blockly.Block
     */
    block.mutationToDom = function() {
      var container = details.mutationToDomFunc ?
          details.mutatationToDomFunc() : document.createElement('mutation');
      container.setAttribute('is_statement', this['isStatement'] || false);
      return container;
    };
  } else {
    block.mutationToDom = details.mutationToDomFunc;
  }
  // TODO: Add domToMutation and customContextMenu.

  // Add new block to Blockly.Blocks.
  Blockly.Blocks[details.blockName] = block;
};
