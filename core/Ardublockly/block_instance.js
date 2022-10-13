/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
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
 * @fileoverview The class representing one block.
 * @author Carlosperate
 */
'use strict';

goog.require('Blockly.Block');
goog.require('Blockly.blocks');
goog.require('Blockly.Comment');
goog.require('Blockly.Connection');
goog.require('Blockly.Input');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');


/**
 * Return all instances referenced by this block.
 * @param {string=} opt_instanceType Optional type of the instances to collect,
 *     if not defined it collects all instances.
 * @return {!Array.<string>} List of instance names.
 */
Blockly.Block.prototype.getInstances = function(opt_instanceType) {
  var vars = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldInstance) {
        var validInstance = opt_instanceType ?
            field.getInstanceTypeValue(opt_instanceType) :
            field.getValue();
        if (validInstance) {
          vars.push(validInstance);
        }
      }
    }
  }
  return vars;
};

/**
 * Notification that a instance is renaming.
 * If the name and type matches one of this block's instances, rename it.
 * @param {string} oldName Previous name of the instance.
 * @param {string} newName Renamed instance.
 * @param {string} instanceType Type of the instances to rename.
 */
Blockly.Block.prototype.renameInstance = function(
    oldName, newName, instanceType) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldInstance) {
        var validInstance = field.getInstanceTypeValue(instanceType);
        if (validInstance && Blockly.Names.equals(oldName, validInstance)) {
          field.setValue(newName);
        }
      }
    }
  }
};
