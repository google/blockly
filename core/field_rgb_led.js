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
  
  
	  this.checkElement_ = Blockly.utils.createSvgElement('rect',
		  {'height': 16,
		   'width': 16,
		   'rx':0,
		   'ry':0,
		   'style': 'fill: #f00',
		   'fill-opacity': 1,
		   'x':-5
  }, this.fieldGroup_);

  this.checkElement_.style.display = 'none';
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
		this.checkElement_.style.display = newState == false ? 'none' : 'block';
		if(newState){
			this.currentColor_ = this.colorSource_.colour_;
			this.checkElement_.style.fill = this.colorSource_.colour_;
		}
	  }
	}
  };