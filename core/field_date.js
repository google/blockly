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
goog.require('goog.ui.DatePicker');
goog.require('goog.style');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_he');


/**
 * Class for a date input field.
 * @param {string} date The initial date.
 * @param {Function} opt_changeHandler A function that is executed when a new
 *     date is selected.  Its sole argument is the new date value.  Its
 *     return value becomes the selected date, unless it is undefined, in
 *     which case the new date stands, or it is null, in which case the change
 *     is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDate = function(date, opt_changeHandler) {
  if (!date) {
    date = new goog.date.Date().toIsoString(true);
  }
  Blockly.FieldDate.superClass_.constructor.call(this, date);
  this.setValue(date);
  this.setChangeHandler(opt_changeHandler);
};
goog.inherits(Blockly.FieldDate, Blockly.Field);

/**
 * Clone this FieldDate.
 * @return {!Blockly.FieldDate} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldDate.prototype.clone = function() {
  return new Blockly.FieldDate(this.getValue(), this.changeHandler_);
};

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
  if (this.sourceBlock_ && this.changeHandler_) {
    var validated = this.changeHandler_(date);
    // If the new date is invalid, validation returns null.
    // In this case we still want to display the illegal result.
    if (validated !== null && validated !== undefined) {
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
  var borderBBox = this.borderRect_.getBBox();
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
        if (thisField.sourceBlock_ && thisField.changeHandler_) {
          // Call any change handler, and allow it to override.
          var override = thisField.changeHandler_(date);
          if (override !== undefined) {
            date = override;
          }
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
