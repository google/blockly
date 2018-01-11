'use strict';

goog.provide('Blockly.FieldRGBLed');

goog.require('Blockly.FieldLed');

Blockly.FieldRGBLed = function(state, opt_validator) {
  Blockly.FieldRGBLed.superClass_.constructor.call(this, '', opt_validator);
  // Set the initial state.
  this.setValue(state);

};
goog.inherits(Blockly.FieldRGBLed, Blockly.FieldLed);

Blockly.FieldRGBLed.prototype.colorSource_ = null;
Blockly.FieldRGBLed.prototype.currentColor_ = null;

Blockly.FieldRGBLed.prototype.init = function() {
	if (this.fieldGroup_) {
	  // Checkbox has already been initialized once.
	  return;
	}




	Blockly.FieldRGBLed.superClass_.init.call(this);


};

Blockly.FieldRGBLed.prototype.setSource = function(source) {
	this.colorSource_ = source;
};

Blockly.FieldRGBLed.prototype.getColor = function(){
	return this.currentColor_;
}


/**
 * Return 'TRUE' if the checkbox is checked, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldRGBLed.prototype.getValue = function() {
	if(this.state_ != false) return this.state_;
	return String(this.state_).toUpperCase();
  };


/**
 *
 * @param {string} strBool New state.
 */
Blockly.FieldRGBLed.prototype.setValue = function(strBool) {
	var newState = null;

	var newState = (strBool == 'TRUE');
	if(newState)
		newState = this.colorSource_.colour_;

	if (this.state_ !== newState) {
	  if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
		Blockly.Events.fire(new Blockly.Events.Change(
			this.sourceBlock_, 'field', this.name, this.state_, newState));
	  }
	  this.state_ = newState;
	  if (this.checkElement_) {
		if(newState){
			this.currentColor_ = this.colorSource_.colour_;
			this.checkElement_.style.fill = this.colorSource_.colour_;
		}
		else {
			this.currentColor_ = this.ledOffColor;
			this.checkElement_.style.fill = this.ledOffColor;
		}
	  }
	}
  };
