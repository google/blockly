/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Checkbox field.  Checked or not checked.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldBoolean');

goog.require('Blockly.Field');
goog.require('Blockly.utils');


/**
 * Class for a checkbox field.
 * @param {string} state The initial state of the field ('TRUE' or 'FALSE').
 * @param {Function=} opt_validator A function that is executed when a new
 *     option is selected.  Its sole argument is the new checkbox state.  If
 *     it returns a value, this becomes the new checkbox state, unless the
 *     value is null, in which case the change is aborted.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldBoolean = function(state, opt_validator) {
  var text = this.state_ ? Blockly.Msg['LOGIC_BOOLEAN_TRUE'] : Blockly.Msg['LOGIC_BOOLEAN_FALSE'];
  Blockly.FieldBoolean.superClass_.constructor.call(this, text, opt_validator);
  // Set the initial state.
  this.setValue(state);
};
goog.inherits(Blockly.FieldBoolean, Blockly.Field);

/**
 * Construct a FieldBoolean from a JSON arg object.
 * @param {!Object} options A JSON object with options (checked).
 * @returns {!Blockly.FieldBoolean} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldBoolean.fromJson = function(options) {
  return new Blockly.FieldBoolean(options['checked'] ? 'TRUE' : 'FALSE');
};

/**
 * Mouse cursor style when over the hotspot that initiates editability.
 */
Blockly.FieldBoolean.prototype.CURSOR = 'default';

Blockly.FieldBoolean.prototype.MIN_WIDTH = 40;

Blockly.FieldBoolean.prototype.ADDED_PADDING  = 10;

/**
 * Install this checkbox on a block.
 */
Blockly.FieldBoolean.prototype.init = function() {
  if (this.fieldGroup_) {
    // Field has already been initialized once.
    return;
  }
  // Build the DOM.
  this.fieldGroup_ = Blockly.utils.createSvgElement('g', {}, null);

  //Only initialize the path, don't actually draw until the text is inserted and its width can be calculated.
  this.borderPath_ = Blockly.utils.createSvgElement('path',
      {
        'd': 'm 0,0',
        'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
        'y': 0,
        //SHAPE: Last param added from blockly_changes
      }, this.fieldGroup_, this.sourceBlock_.workspace);
  
  /** @type {!Element} */
  this.textElement_ = Blockly.utils.createSvgElement('text',
      {'class': 'blocklyText', 'y': this.size_.height - 7.5},
      this.fieldGroup_);

  Blockly.Field.prototype.updateEditable.call(this);
  this.sourceBlock_.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseDownWrapper_ =
      Blockly.bindEventWithChecks_(
          this.fieldGroup_, 'mousedown', this, this.onMouseDown_);
          
  this.fieldGroup_.style.cursor = this.CURSOR;
  Blockly.utils.addClass(this.fieldGroup_, 'blocklyEditableText');
  Blockly.utils.removeClass(this.fieldGroup_, 'blocklyNonEditableText');

  // this.resizeField_();
};

/**
 * Return 'TRUE' if the checkbox is checked, 'FALSE' otherwise.
 * @return {string} Current state.
 */
Blockly.FieldBoolean.prototype.getValue = function() {
  return String(this.state_).toUpperCase();
};

/**
 * Returns the height and width of the field.
 * @return {!goog.math.Size} Height and width.
 */
Blockly.FieldBoolean.prototype.getSize = function() {
  if (!this.size_.width) {
    this.render_();
  }
  return this.size_;
};


/**
 * Updates thw width of the field. This calls getCachedWidth which won't cache
 * the approximated width on IE/Edge when `getComputedTextLength` fails. Once
 * it eventually does succeed, the result will be cached.
 */
Blockly.FieldBoolean.prototype.updateWidth = function() {
  var textWidth = Blockly.Field.getCachedWidth(this.textElement_);

  var tempWidth = textWidth + this.ADDED_PADDING;

  if (tempWidth < this.MIN_WIDTH) {
    tempWidth = this.MIN_WIDTH;
  }

  this.textElement_.setAttribute("x", (tempWidth - textWidth) / 2);

  if (this.borderPath_) {
    var padding = tempWidth / 2;
    var diagonalLength = ((this.size_.height - 5) / 2);
    var newPath = "m 0,0 H " + (textWidth / 2) + 
                  " l " + diagonalLength + "," + diagonalLength + " v 5 " + 
                  " l " + (-diagonalLength) + "," + diagonalLength +
                  " H " + (-textWidth/2) + 
                  " l " + (-diagonalLength) + "," + (-diagonalLength) + " v -5 " +
                  " l " + diagonalLength + "," + (-diagonalLength) + " z";
    this.borderPath_.setAttribute("d", newPath);
    this.borderPath_.setAttribute("transform", "translate(" + padding + ",0)");
  }
  
  // if (this.borderRect_) {
  //   this.borderRect_.setAttribute('width',
  //       width + Blockly.BlockSvg.SEP_SPACE_X);
  // }
  this.size_.width = textWidth + this.ADDED_PADDING;
};

/**
 * Set the checkbox to be checked if newBool is 'TRUE' or true,
 * unchecks otherwise.
 * @param {string|boolean} newBool New state.
 */
Blockly.FieldBoolean.prototype.setValue = function(newBool) {
  var newState = (typeof newBool == 'string') ?
      (newBool.toUpperCase() == 'TRUE') : !!newBool;
  if (this.state_ !== newState) {
    
    if (this.sourceBlock_ && Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockChange(
          this.sourceBlock_, 'field', this.name, this.state_, newState));
    }

    this.state_ = newState;

    var newText = this.state_ ? Blockly.Msg['LOGIC_BOOLEAN_TRUE'] : Blockly.Msg['LOGIC_BOOLEAN_FALSE'];
    Blockly.Field.prototype.setText.call(this, newText);
    // this.resizeField_();
  }
};

// Blockly.FieldBoolean.prototype.resizeField_ = function() {
//   // if (!this.borderPath_ || !this.textElement_) {
//   //   var thisField = this;
    
//   //   setTimeout(function() {
//   //     thisField.resizeField_();
//   //   }, 50);

//   //   return;
//   // }

//   var tempWidth = 0;
//   var textWidth = 0;

//   try {
//     textWidth = this.textElement_.getComputedTextLength();
//   } catch (e) {
//     // In other cases where we fail to geth the computed text. Instead, use an
//     // approximation and do not cache the result. At some later point in time
//     // when the block is inserted into the visible DOM, this method will be
//     // called again and, at that point in time, will not throw an exception.
//     textWidth = this.text_.length * 8;
//   }

//   tempWidth = textWidth + this.ADDED_PADDING;

//   if (tempWidth < this.MIN_WIDTH) {
//     tempWidth = this.MIN_WIDTH;
//   }

//   this.size_ = new goog.math.Size(tempWidth, this.size_.height);

//   if (this.borderPath_) {
//     var padding = tempWidth / 2;
//     var diagonalLength = ((this.size_.height - 5) / 2);
//     var newPath = "m 0,0 H " + (textWidth / 2) + 
//                   " l " + diagonalLength + "," + diagonalLength + " v 5 " + 
//                   " l " + (-diagonalLength) + "," + diagonalLength +
//                   " H " + (-textWidth/2) + 
//                   " l " + (-diagonalLength) + "," + (-diagonalLength) + " v -5 " +
//                   " l " + diagonalLength + "," + (-diagonalLength) + " z";
//     this.borderPath_.setAttribute("d", newPath);
//     this.borderPath_.setAttribute("transform", "translate(" + padding + ",0)");
//   }

//   if (this.textElement_) {
//     //The -4 accounts for the rx property of the surrounding rect (used for rounding of the box). Check Blockly.Field.
//     var newX = ((tempWidth - textWidth) / 2);
//     this.textElement_.setAttribute("x", newX);
//   }

//   if (this.sourceBlock_) {
//     this.sourceBlock_.rendered && this.sourceBlock_.render();
//   }
// };

/**
 * Toggle the state of the checkbox.
 * @private
 */
Blockly.FieldBoolean.prototype.showEditor_ = function() {
  var newState = !this.state_;
  if (this.sourceBlock_) {
    // Call any validation function, and allow it to override.
    newState = this.callValidator(newState);
  }
  if (newState !== null) {
    this.setValue(String(newState).toUpperCase());
  }
};

Blockly.Field.register('field_boolean', Blockly.FieldBoolean);
