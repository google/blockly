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
 * @fileoverview A field for a plus button used in mutation.
 */
'use strict';

goog.provide('plusMinus.FieldPlus');

goog.require('Blockly.FieldImage');

/**
 * Class for a plus button used in mutation.
 * @param opt_args Arguements to pass to the 'plus' function when the button
 *    is clicked.
 * @constructor
 */
plusMinus.FieldPlus = function(opt_args) {
  this.args_ = opt_args;
  return plusMinus.FieldPlus.superClass_.constructor.call(
    this, 'assets/media/plus.png', 15, 15, '+');
};
Blockly.utils.object.inherits(plusMinus.FieldPlus, Blockly.FieldImage);

plusMinus.FieldPlus.fromJson = function(options) {
  return new plusMinus.FieldPlus(options['args']);
};

plusMinus.FieldPlus.prototype.showEditor_ = function() {
  // TODO: This is a dupe of the mutator code, anyway to unify?
  var block = this.getSourceBlock();

  Blockly.Events.setGroup(true);

  var oldMutationDom = block.mutationToDom();
  var oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);

  block.plus(this.args_);

  var newMutationDom = block.mutationToDom();
  var newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);

  if (oldMutation != newMutation) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
      block, 'mutation', null, oldMutation, newMutation));
    // Ensure that any bump is part of this mutation's event group.
    var group = Blockly.Events.getGroup();
    setTimeout(function() {
      Blockly.Events.setGroup(group);
      block.bumpNeighbours();
      Blockly.Events.setGroup(false);
    }, Blockly.BUMP_DELAY);
  }
};

Blockly.fieldRegistry.register('field_plus', plusMinus.FieldPlus);
