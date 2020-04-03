/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Date input field.
 * @author pkendall64@gmail.com (Paul Kendall)
 */
'use strict';

goog.provide('Blockly.FieldDate');

goog.require('Blockly.Css');
goog.require('Blockly.Events');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.string');

goog.require('goog.date');
goog.require('goog.date.DateTime');
goog.require('goog.events');
goog.require('goog.i18n.DateTimeSymbols');
goog.require('goog.i18n.DateTimeSymbols_he');
goog.require('goog.ui.DatePicker');


/**
 * Class for a date input field.
 * @param {string=} opt_value The initial value of the field. Should be in
 *    'YYYY-MM-DD' format. Defaults to the current date.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a date string & returns a
 *    validated date string ('YYYY-MM-DD' format), or null to abort the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldDate = function(opt_value, opt_validator) {
  Blockly.FieldDate.superClass_.constructor.call(this,
      opt_value || new goog.date.Date().toIsoString(true), opt_validator);
};
Blockly.utils.object.inherits(Blockly.FieldDate, Blockly.Field);

/**
 * Construct a FieldDate from a JSON arg object.
 * @param {!Object} options A JSON object with options (date).
 * @return {!Blockly.FieldDate} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDate.fromJson = function(options) {
  return new Blockly.FieldDate(options['date']);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldDate.prototype.SERIALIZABLE = true;

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDate.prototype.CURSOR = 'text';

/**
 * Border colour for the dropdown div showing the date picker. Must be a CSS
 * string.
 * @type {string}
 * @private
 */
Blockly.FieldDate.prototype.DROPDOWN_BORDER_COLOUR = 'silver';

/**
 * Background colour for the dropdown div showing the date picker. Must be a
 * CSS string.
 * @type {string}
 * @private
 */
Blockly.FieldDate.prototype.DROPDOWN_BACKGROUND_COLOUR = 'white';

/**
 * Ensure that the input value is a valid date.
 * @param {*=} opt_newValue The input value.
 * @return {?string} A valid date, or null if invalid.
 * @protected
 */
Blockly.FieldDate.prototype.doClassValidation_ = function(opt_newValue) {
  if (!opt_newValue) {
    return null;
  }
  // Check if the new value is parsable or not.
  var date = goog.date.Date.fromIsoString(opt_newValue);
  if (!date || date.toIsoString(true) != opt_newValue) {
    return null;
  }
  return opt_newValue;
};

/**
 * Render the field. If the picker is shown make sure it has the current
 * date selected.
 * @protected
 */
Blockly.FieldDate.prototype.render_ = function() {
  Blockly.FieldDate.superClass_.render_.call(this);
  if (this.picker_) {
    this.picker_.setDate(goog.date.Date.fromIsoString(this.getValue()));
    this.updateEditor_();
  }
};

/**
 * Updates the field's colours to match those of the block.
 * @package
 */
Blockly.FieldDate.prototype.applyColour = function() {
  this.todayColour_ = this.sourceBlock_.style.colourPrimary;
  this.selectedColour_ = this.sourceBlock_.style.colourSecondary;
  this.updateEditor_();
};

/**
 * Updates the picker to show the current date and currently selected date.
 * @private
 */
Blockly.FieldDate.prototype.updateEditor_ = function() {
  if (!this.picker_) {
    // Nothing to update.
    return;
  }

  // Updating today should come before updating selected, so that if the
  // current day is selected, it will appear so.
  if (this.oldTodayElement_) {
    this.oldTodayElement_.style.backgroundColor = null;
    this.oldTodayElement_.style.color = null;
  }
  var today = this.picker_.getElementByClass('goog-date-picker-today');
  this.oldTodayElement_ = today;
  if (today) {
    today.style.backgroundColor = this.todayColour_;
    today.style.color = 'white';
  }

  if (this.oldSelectedElement_ && this.oldSelectedElement_ != today) {
    this.oldSelectedElement_.style.backgroundColor = null;
    this.oldSelectedElement_.style.color = null;
  }
  var selected = this.picker_.getElementByClass('goog-date-picker-selected');
  this.oldSelectedElement_ = selected;
  if (selected) {
    selected.style.backgroundColor = this.selectedColour_;
    selected.style.color = this.todayColour_;
  }
};

/**
 * Create and show the date field's editor.
 * @private
 */
Blockly.FieldDate.prototype.showEditor_ = function() {
  this.picker_ = this.dropdownCreate_();
  this.picker_.render(Blockly.DropDownDiv.getContentDiv());
  Blockly.utils.dom.addClass(this.picker_.getElement(), 'blocklyDatePicker');
  Blockly.DropDownDiv.setColour(
      this.DROPDOWN_BACKGROUND_COLOUR, this.DROPDOWN_BORDER_COLOUR);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

  this.updateEditor_();
};

/**
 * Create the date dropdown editor.
 * @return {!goog.ui.DatePicker} The newly created date picker.
 * @private
 */
Blockly.FieldDate.prototype.dropdownCreate_ = function() {
  // Create the date picker using Closure.
  Blockly.FieldDate.loadLanguage_();
  var picker = new goog.ui.DatePicker();
  picker.setAllowNone(false);
  picker.setShowWeekNum(false);
  picker.setUseNarrowWeekdayNames(true);
  picker.setUseSimpleNavigationMenu(true);
  picker.setDate(goog.date.DateTime.fromIsoString(this.getValue()));

  this.changeEventKey_ = goog.events.listen(
      picker,
      goog.ui.DatePicker.Events.CHANGE,
      this.onDateSelected_,
      null,
      this);
  this.activeMonthEventKey_ = goog.events.listen(
      picker,
      goog.ui.DatePicker.Events.CHANGE_ACTIVE_MONTH,
      this.updateEditor_,
      null,
      this);

  return picker;
};

/**
 * Dispose of references to DOM elements and events belonging
 * to the date editor.
 * @private
 */
Blockly.FieldDate.prototype.dropdownDispose_ = function() {
  goog.events.unlistenByKey(this.changeEventKey_);
  goog.events.unlistenByKey(this.activeMonthEventKey_);
};

/**
 * Handle a CHANGE event in the date picker.
 * @param {!Event} event The CHANGE event.
 * @private
 */
Blockly.FieldDate.prototype.onDateSelected_ = function(event) {
  var date = event.date ? event.date.toIsoString(true) : '';
  this.setValue(date);
  Blockly.DropDownDiv.hideIfOwner(this);
};

/**
 * Load the best language pack by scanning the Blockly.Msg object for a
 * language that matches the available languages in Closure.
 * @private
 */
Blockly.FieldDate.loadLanguage_ = function() {
  for (var prop in goog.i18n) {
    if (Blockly.utils.string.startsWith(prop, 'DateTimeSymbols_')) {
      var lang = prop.substr(16).toLowerCase().replace('_', '.');
      // E.g. 'DateTimeSymbols_pt_BR' -> 'pt.br'
      if (goog.getObjectByName(lang, Blockly.Msg)) {
        goog.i18n.DateTimeSymbols = goog.i18n[prop];
        break;
      }
    }
  }
};

/**
 * CSS for date picker.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyDatePicker,',
  '.blocklyDatePicker th,',
  '.blocklyDatePicker td {',
    'font: 13px Arial, sans-serif;',
    'color: #3c4043;',
  '}',

  '.blocklyDatePicker th,',
  '.blocklyDatePicker td {',
    'text-align: center;',
    'vertical-align: middle;',
  '}',

  '.blocklyDatePicker .goog-date-picker-wday,',
  '.blocklyDatePicker .goog-date-picker-date {',
    'padding: 6px 6px;',
  '}',

  '.blocklyDatePicker button {',
    'cursor: pointer;',
    'padding: 6px 6px;',
    'margin: 1px 0;',
    'border: 0;',
    'color: #3c4043;',
    'font-weight: bold;',
    'background: transparent;',
  '}',

  '.blocklyDatePicker .goog-date-picker-previousMonth,',
  '.blocklyDatePicker .goog-date-picker-nextMonth {',
    'height: 24px;',
    'width: 24px;',
  '}',

  '.blocklyDatePicker .goog-date-picker-monthyear {',
    'font-weight: bold;',
  '}',

  '.blocklyDatePicker .goog-date-picker-wday, ',
  '.blocklyDatePicker .goog-date-picker-other-month {',
    'color: #70757a;',
    'border-radius: 12px;',
  '}',

  '.blocklyDatePicker button,',
  '.blocklyDatePicker .goog-date-picker-date {',
    'cursor: pointer;',
    'background-color: rgb(218, 220, 224, 0);',
    'border-radius: 12px;',
    'transition: background-color,opacity 100ms linear;',
  '}',

  '.blocklyDatePicker button:hover,',
  '.blocklyDatePicker .goog-date-picker-date:hover {',
    'background-color: rgb(218, 220, 224, .5);',
  '}'
  /* eslint-enable indent */
]);

Blockly.fieldRegistry.register('field_date', Blockly.FieldDate);


/**
 * Back up original getMsg function.
 * @type {!Function}
 */
goog.getMsgOrig = goog.getMsg;

/**
 * Gets a localized message.
 * Overrides the default Closure function to check for a Blockly.Msg first.
 * Used infrequently, only known case is TODAY button in date picker.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object.<string, string>=} opt_values Maps place holder name to value.
 * @return {string} Message with placeholders filled.
 * @suppress {duplicate}
 */
goog.getMsg = function(str, opt_values) {
  var key = goog.getMsg.blocklyMsgMap[str];
  if (key) {
    str = Blockly.Msg[key];
  }
  return goog.getMsgOrig(str, opt_values);
};

/**
 * Mapping of Closure messages to Blockly.Msg names.
 */
goog.getMsg.blocklyMsgMap = {
  'Today': 'TODAY'
};
