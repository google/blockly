'use strict';

goog.provide('Blockly.MutatorMinus');

goog.require('Blockly.Mutator');
goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');

Blockly.MutatorMinus = function(quarkNames) {
    Blockly.MutatorMinus.superClass_.constructor.call(this, null);
};
goog.inherits(Blockly.MutatorMinus, Blockly.Mutator);

/**
 * Draw the mutator icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.MutatorMinus.prototype.drawIcon_ = function(group) {
  // Square with rounded corners.
  Blockly.utils.createSvgElement('rect',
      {'class': 'blocklyIconShape',
       'height': '16', 'width': '16',
       'fill-opacity': '0',
       'stroke-opacity': '0'},
       group);
  // Gear teeth.
  Blockly.utils.createSvgElement('path',
      {'class': 'blocklyIconSymbol',
       'd': 'M18 11h-12c-1.104 0-2 .896-2 2s.896 2 2 2h12c1.104 0 2-.896 2-2s-.896-2-2-2z',
       'transform': 'scale(0.67)'},
       group);
};

/**
 * Clicking on the icon toggles if the mutator bubble is visible.
 * Disable if block is uneditable.
 * @param {!Event} e Mouse click event.
 * @private
 * @override
 */
Blockly.MutatorMinus.prototype.iconClick_ = function(e) {
  if (this.block_.isEditable() && Blockly.dragMode_ != 2) {
    this.block_.updateShape_(-1);
  }
};

Blockly.MutatorMinus.prototype.clicked_ = false;
