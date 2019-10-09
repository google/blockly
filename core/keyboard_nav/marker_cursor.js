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
 * @fileoverview The class representing a cursor used for marking a location.
 * Used primarily for keyboard navigation.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.MarkerCursor');

goog.require('Blockly.Cursor');
goog.require('Blockly.utils.object');


/**
 * Class for a marker.
 * This is used in keyboard navigation to save a location in the Blockly AST.
 * @constructor
 * @extends {Blockly.Cursor}
 */
Blockly.MarkerCursor = function() {
  Blockly.MarkerCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.MarkerCursor, Blockly.Cursor);

/**
 * This is a no-op since markers do not move.
 * @return {null} Always null.
 * @override
 */
Blockly.MarkerCursor.prototype.next = function() {
  return null;
};

/**
 * This is a no-op since markers do not move.
 * @return {null} Always null.
 * @override
 */
Blockly.MarkerCursor.prototype.in = function() {
  return null;
};

/**
 * This is a no-op since markers do not move.
 * @return {null} Always null.
 * @override
 */
Blockly.MarkerCursor.prototype.prev = function() {
  return null;
};

/**
 * This is a no-op since markers do not move.
 * @return {null} Always null.
 * @override
 */
Blockly.MarkerCursor.prototype.out = function() {
  return null;
};
