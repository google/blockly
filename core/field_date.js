/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Date input field.
 * @author pkendall64@gmail.com (Paul Kendall)
 */
'use strict';

goog.provide('Blockly.FieldDate');

goog.require('Blockly.Field');
goog.require('goog.date');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_he');
goog.require('goog.style');
goog.require('goog.ui.DatePicker');


/**
 * Class for a date input field.
 * @param {string} date The initial date.
 * @param {Function=} opt_validator A function that is executed when a new
 *     date is selected.  Its sole argument is the new date value.  Its
 *     return value becomes the selected date, unless it is undefined, in
 *     which case the new date stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDate = function(date, opt_validator) {
  if (!date) {
    date = new goog.date.Date().toIsoString(true);
  }
  Blockly.FieldDate.superClass_.constructor.call(this, date, opt_validator);
  this.setValue(date);
};
goog.inherits(Blockly.FieldDate, Blockly.Field);

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDate.prototype.CURSOR = 'text';

/**
 * Close the colour picker if this input is being deleted.
 */
Blockly.FieldDate.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  Blockly.FieldDate.superClass_.dispose.call(this);
};

/**
 * Return the current date.
 * @return {string} Current date.
 */
Blockly.FieldDate.prototype.getValue = function() {
  return this.date_;
};

/**
 * Set the date.
 * @param {string} date The new date.
 */
Blockly.FieldDate.prototype.setValue = function(date) {
  if (this.sourceBlock_) {
    var validated = this.callValidator(date);
    // If the new date is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null) {
      date = validated;
    }
  }
  this.date_ = date;
  Blockly.Field.prototype.setText.call(this, date);
};

/**
 * Create a date picker under the date field.
 * @private
 */
Blockly.FieldDate.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL,
      Blockly.FieldDate.widgetDispose_);
  // Create the date picker using Closure.
  Blockly.FieldDate.loadLanguage_();
  var picker = new goog.ui.DatePicker();
  picker.setAllowNone(false);
  picker.setShowWeekNum(false);

  // Position the picker to line up with the field.
  // Record windowSize and scrollOffset before adding the picker.
  var windowSize = goog.dom.getViewportSize();
  var scrollOffset = goog.style.getViewportPageOffset(document);
  var xy = this.getAbsoluteXY_();
  var borderBBox = this.getScaledBBox_();
  var div = Blockly.WidgetDiv.DIV;
  picker.render(div);
  picker.setDate(goog.date.fromIsoString(this.getValue()));
  // Record pickerSize after adding the date picker.
  var pickerSize = goog.style.getSize(picker.getElement());

  // Flip the picker vertically if off the bottom.
  if (xy.y + pickerSize.height + borderBBox.height >=
      windowSize.height + scrollOffset.y) {
    xy.y -= pickerSize.height - 1;
  } else {
    xy.y += borderBBox.height - 1;
  }
  if (this.sourceBlock_.RTL) {
    xy.x += borderBBox.width;
    xy.x -= pickerSize.width;
    // Don't go offscreen left.
    if (xy.x < scrollOffset.x) {
      xy.x = scrollOffset.x;
    }
  } else {
    // Don't go offscreen right.
    if (xy.x > windowSize.width + scrollOffset.x - pickerSize.width) {
      xy.x = windowSize.width + scrollOffset.x - pickerSize.width;
    }
  }
  Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset,
                             this.sourceBlock_.RTL);

  // Configure event handler.
  var thisField = this;
  Blockly.FieldDate.changeEventKey_ = goog.events.listen(picker,
      goog.ui.DatePicker.Events.CHANGE,
      function(event) {
        var date = event.date ? event.date.toIsoString(true) : '';
        Blockly.WidgetDiv.hide();
        if (thisField.sourceBlock_) {
          // Call any validation function, and allow it to override.
          date = thisField.callValidator(date);
        }
        thisField.setValue(date);
      });
};

/**
 * Hide the date picker.
 * @private
 */
Blockly.FieldDate.widgetDispose_ = function() {
  if (Blockly.FieldDate.changeEventKey_) {
    goog.events.unlistenByKey(Blockly.FieldDate.changeEventKey_);
  }
  Blockly.Events.setGroup(false);
};

/**
 * Load the best language pack by scanning the Blockly.Msg object for a
 * language that matches the available languages in Closure.
 * @private
 */
Blockly.FieldDate.loadLanguage_ = function() {
  var reg = /^DateTimeSymbols_(.+)$/;
  for (var prop in goog.i18n) {
    var m = prop.match(reg);
    if (m) {
      var lang = m[1].toLowerCase().replace('_', '.');  // E.g. 'pt.br'
      if (goog.getObjectByName(lang, Blockly.Msg)) {
        goog.i18n.DateTimeSymbols = goog.i18n[prop];
      }
    }
  }
};

/**
 * CSS for date picker.  See css.js for use.
 */
Blockly.FieldDate.CSS = [
  /* Copied from: goog/css/datepicker.css */
  /**
   * Copyright 2009 The Closure Library Authors. All Rights Reserved.
   *
   * Use of this source code is governed by the Apache License, Version 2.0.
   * See the COPYING file for details.
   */

  /**
   * Standard styling for a goog.ui.DatePicker.
   *
   * @author arv@google.com (Erik Arvidsson)
   */

  '.blocklyWidgetDiv .goog-date-picker,',
  '.blocklyWidgetDiv .goog-date-picker th,',
  '.blocklyWidgetDiv .goog-date-picker td {',
  '  font: 13px Arial, sans-serif;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker {',
  '  -moz-user-focus: normal;',
  '  -moz-user-select: none;',
  '  position: relative;',
  '  border: 1px solid #000;',
  '  float: left;',
  '  padding: 2px;',
  '  color: #000;',
  '  background: #c3d9ff;',
  '  cursor: default;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker th {',
  '  text-align: center;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker td {',
  '  text-align: center;',
  '  vertical-align: middle;',
  '  padding: 1px 3px;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-menu {',
  '  position: absolute;',
  '  background: threedface;',
  '  border: 1px solid gray;',
  '  -moz-user-focus: normal;',
  '  z-index: 1;',
  '  outline: none;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-menu ul {',
  '  list-style: none;',
  '  margin: 0px;',
  '  padding: 0px;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-menu ul li {',
  '  cursor: default;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-menu-selected {',
  '  background: #ccf;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker th {',
  '  font-size: .9em;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker td div {',
  '  float: left;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker button {',
  '  padding: 0px;',
  '  margin: 1px 0;',
  '  border: 0;',
  '  color: #20c;',
  '  font-weight: bold;',
  '  background: transparent;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-date {',
  '  background: #fff;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-week,',
  '.blocklyWidgetDiv .goog-date-picker-wday {',
  '  padding: 1px 3px;',
  '  border: 0;',
  '  border-color: #a2bbdd;',
  '  border-style: solid;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-week {',
  '  border-right-width: 1px;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-wday {',
  '  border-bottom-width: 1px;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-head td {',
  '  text-align: center;',
  '}',

  /** Use td.className instead of !important */
  '.blocklyWidgetDiv td.goog-date-picker-today-cont {',
  '  text-align: center;',
  '}',

  /** Use td.className instead of !important */
  '.blocklyWidgetDiv td.goog-date-picker-none-cont {',
  '  text-align: center;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-month {',
  '  min-width: 11ex;',
  '  white-space: nowrap;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-year {',
  '  min-width: 6ex;',
  '  white-space: nowrap;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-monthyear {',
  '  white-space: nowrap;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker table {',
  '  border-collapse: collapse;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-other-month {',
  '  color: #888;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-wkend-start,',
  '.blocklyWidgetDiv .goog-date-picker-wkend-end {',
  '  background: #eee;',
  '}',

  /** Use td.className instead of !important */
  '.blocklyWidgetDiv td.goog-date-picker-selected {',
  '  background: #c3d9ff;',
  '}',

  '.blocklyWidgetDiv .goog-date-picker-today {',
  '  background: #9ab;',
  '  font-weight: bold !important;',
  '  border-color: #246 #9bd #9bd #246;',
  '  color: #fff;',
  '}'
];
