/**
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview A div that floats on top of Blockly.  This singleton contains
 *     temporary HTML UI widgets that the user is currently interacting with.
 *     E.g. text input areas, colour pickers.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.WidgetDiv');

goog.require('Blockly.Css');
goog.require('goog.dom');


/**
 * The HTML container.  Set once by inject.js's Blockly.createDom_.
 * @type Element
 */
Blockly.WidgetDiv.DIV = null;

/**
 * The field currently using this container.
 * @private
 * @type Blockly.Field
 */
Blockly.WidgetDiv.field_ = null;

/**
 * Optional cleanup function set by whichever field uses the widget.
 * @private
 * @type Function
 */
Blockly.WidgetDiv.dispose_ = null;

/**
 * Initialize and display the widget div.  Close the old one if needed.
 * @param {!Blockly.Field} newField The field that will be using this container.
 * @param {Function} dispose Optional cleanup function to be run when the widget
 *   is closed.
 */
Blockly.WidgetDiv.show = function(newField, dispose) {
  Blockly.WidgetDiv.hide();
  Blockly.WidgetDiv.field_ = newField;
  Blockly.WidgetDiv.dispose_ = dispose;
  Blockly.WidgetDiv.DIV.style.display = 'block';
};

/**
 * Destroy the widget and hide the div.
 */
Blockly.WidgetDiv.hide = function() {
  if (Blockly.WidgetDiv.field_) {
    Blockly.WidgetDiv.DIV.style.display = 'none';
    Blockly.WidgetDiv.dispose_ && Blockly.WidgetDiv.dispose_();
    Blockly.WidgetDiv.field_ = null;
    Blockly.WidgetDiv.dispose_ = null;
    goog.dom.removeChildren(Blockly.WidgetDiv.DIV);
  }
};

/**
 * Destroy the widget and hide the div if it is being used by the specified
 *   field.
 * @param {!Blockly.Field} oldField The field that was using this container.
 */
Blockly.WidgetDiv.hideIfField = function(oldField) {
  if (Blockly.WidgetDiv.field_ == oldField) {
    Blockly.WidgetDiv.hide();
  }
};
