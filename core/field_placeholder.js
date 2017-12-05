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


Blockly.Field.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);
  if (!this.visible_) {
    this.fieldGroup_.style.display = 'none';
  }
  this.borderRect_ = Blockly.utils.createSvgElement('rect',
      {'rx': 0,
       'ry': 0,
       'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
       'y': 0,
       'height': 16,
       'fill-opacity': 0}, this.fieldGroup_);
  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
      {'class': 'blocklyText', 'y': this.size_.height - 12.5},
      this.fieldGroup_);

  this.updateEditable();
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(this.fieldGroup_, 'mousedown', this,
      this.onMouseDown_);
  // Force a render.
  this.render_();
};


Blockly.FieldPlaceholder.prototype.updateWidth = function() {
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
        this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
  }
};
