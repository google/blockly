'use strict';

goog.provide('Blockly.FieldLed');

goog.require('Blockly.Field');

Blockly.FieldLed = function(state, opt_validator) {
  Blockly.FieldLed.superClass_.constructor.call(this, '', opt_validator);
  // Set the initial state.
  this.setValue(state);

};
goog.inherits(Blockly.FieldLed, Blockly.Field);


Blockly.FieldLed.sizeWidth = 25;
Blockly.FieldLed.sizeHeight = 25;


/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldLed.prototype.CURSOR = 'pointer';

/**
 * Install this checkbox on a block.
 */
Blockly.FieldLed.prototype.init = function() {
  if (this.fieldGroup_) {
    // Checkbox has already been initialized once.
    return;
  }

  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }

  this.ledOnColor = '#ff0000';
  this.ledOffColor = '#888888';
  this.size_.height = Blockly.FieldLed.sizeHeight;
  this.size_.width = Blockly.FieldLed.sizeWidth;

this.customXSpacing = 4;
this.customYSpacing = 4;
//  Blockly.FieldLed.superClass_.init.call(this);


	this.checkElement_ = Blockly.utils.createSvgElement('rect',{
		'height': Blockly.FieldLed.sizeHeight,
		'width': Blockly.FieldLed.sizeWidth,
		'rx':0,
		'ry':0,
		'style': 'fill: '  + this.ledOffColor,
		'fill-opacity': 1,
		'x':0,
		'y':0
	}, this.fieldGroup_);


	this.updateEditable();

	this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
	this.mouseDownWrapper_ =
		Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this,
		this.onMouseDown_);
	// Force a render.
	this.render_();

};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.FieldLed.prototype.render_ = function() {
this.updateWidth();
  };

Blockly.FieldLed.prototype.updateWidth = function() {

	this.size_.width = Blockly.FieldLed.sizeWidth;
  };

  Blockly.FieldLed.prototype.getSize = function() {
	return {width: Blockly.FieldLed.sizeWidth, height: Blockly.FieldLed.sizeHeight};

  }


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
      this.checkElement_.style.fill = newState ? (this.ledOnColor) :  (this.ledOffColor);
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
