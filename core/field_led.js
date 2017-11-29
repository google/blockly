'use strict';

goog.provide('Blockly.FieldLed');

goog.require('Blockly.Field');

Blockly.FieldLed = function(state, opt_validator) {
  Blockly.FieldLed.superClass_.constructor.call(this, '', opt_validator);
  // Set the initial state.
  this.setValue(state);
};
goog.inherits(Blockly.FieldLed, Blockly.Field);

/**
 * Character for the checkmark.
 */
Blockly.FieldLed.CHECK_CHAR = 'x';

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldLed.prototype.CURSOR = 'default';

/**
 * Install this checkbox on a block.
 */
Blockly.FieldLed.prototype.init = function() {
  if (this.fieldGroup_) {
    // Checkbox has already been initialized once.
    return;
  }




  Blockly.FieldLed.superClass_.init.call(this);
  // The checkbox doesn't use the inherited text element.
  // Instead it uses a custom checkmark element that is either visible or not.
  //this.checkElement_ = Blockly.createSvgElement('text',{'class': 'blocklyText blocklyLed', 'x': -3, 'y': 14}, this.fieldGroup_);
  var textNode = document.createTextNode("x");

    this.checkElement_ = Blockly.utils.createSvgElement('rect',
        {'height': 16,
         'width': '14px',
         'rx':4,
         'ry':4,
         'style': 'fill: red',
         'fill-opacity': 1,
         'x':-5
}, this.fieldGroup_);

//  this.checkElement_.appendChild(textNode);
  this.checkElement_.style.display = this.state_ ? 'block' : 'none';
};

/**
 * Return 'TRUE' if the checkbox is checked, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldLed.prototype.getValue = function() {
  return String(this.state_).toUpperCase();
};

/**
 * Set the checkbox to be checked if strBool is 'TRUE', unchecks otherwise.
 * @param {string} strBool New state.
 */
Blockly.FieldLed.prototype.setValue = function(strBool) {
  var newState = (strBool == 'TRUE');
  if (this.state_ !== newState) {
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.Change(
          this.sourceBlock_, 'field', this.name, this.state_, newState));
    }
    this.state_ = newState;
    if (this.checkElement_) {
      this.checkElement_.style.display = newState ? 'block' : 'none';
    }
  }
};

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldLed.prototype.showEditor_ = function() {
  var newState = !this.state_;
  if (this.sourceBlock_ && this.validator_) {
    // Call any validation function, and allow it to override.
    var override = this.validator_(newState);
    if (override !== undefined) {
      newState = override;
    }
  }
  if (newState !== null) {
    this.setValue(String(newState).toUpperCase());
  }
};