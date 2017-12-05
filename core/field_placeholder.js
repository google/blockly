'use strict';

goog.provide('Blockly.FieldPlaceholder');

goog.require('Blockly.FieldLed');

Blockly.FieldPlaceholder = function(width, height, opt_validator) {
  Blockly.FieldPlaceholder.superClass_.constructor.call(this, '', opt_validator);

	this.size_.width = width;
	this.size_.height = height;
};
goog.inherits(Blockly.FieldPlaceholder, Blockly.FieldLed);


Blockly.FieldPlaceholder.prototype.EDITABLE = false;


Blockly.FieldPlaceholder.prototype.updateWidth = function() {
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
        this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
  }
};
