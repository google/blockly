/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
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
 * @fileoverview Angle input field.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.FieldAngle');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.userAgent');
goog.require('Blockly.utils');


/**
 * Class for an editable angle field.
 * @param {string|number=} opt_value The initial value of the field. Should cast
 *    to a number. Defaults to 0.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a number & returns a
 *    validated number, or null to abort the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldAngle = function(opt_value, opt_validator) {
  opt_value = this.doClassValidation_(opt_value);
  if (opt_value === null) {
    opt_value = 0;
  }
  Blockly.FieldAngle.superClass_.constructor.call(
      this, opt_value, opt_validator);
};
goog.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);

/**
 * Construct a FieldAngle from a JSON arg object.
 * @param {!Object} options A JSON object with options (angle).
 * @return {!Blockly.FieldAngle} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldAngle.fromJson = function(options) {
  return new Blockly.FieldAngle(options['angle']);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldAngle.prototype.SERIALIZABLE = true;

/**
 * Round angles to the nearest 15 degrees when using mouse.
 * Set to 0 to disable rounding.
 */
Blockly.FieldAngle.ROUND = 15;

/**
 * Half the width of protractor image.
 */
Blockly.FieldAngle.HALF = 100 / 2;

/* The following two settings work together to set the behaviour of the angle
 * picker.  While many combinations are possible, two modes are typical:
 * Math mode.
 *   0 deg is right, 90 is up.  This is the style used by protractors.
 *   Blockly.FieldAngle.CLOCKWISE = false;
 *   Blockly.FieldAngle.OFFSET = 0;
 * Compass mode.
 *   0 deg is up, 90 is right.  This is the style used by maps.
 *   Blockly.FieldAngle.CLOCKWISE = true;
 *   Blockly.FieldAngle.OFFSET = 90;
 */

/**
 * Angle increases clockwise (true) or counterclockwise (false).
 */
Blockly.FieldAngle.CLOCKWISE = false;

/**
 * Offset the location of 0 degrees (and all angles) by a constant.
 * Usually either 0 (0 = right) or 90 (0 = up).
 */
Blockly.FieldAngle.OFFSET = 0;

/**
 * Maximum allowed angle before wrapping.
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 */
Blockly.FieldAngle.WRAP = 360;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldAngle.RADIUS = Blockly.FieldAngle.HALF - 1;

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldAngle.prototype.initView = function() {
  Blockly.FieldAngle.superClass_.initView.call(this);
  // Add the degree symbol to the left of the number, even in RTL (issue #2380)
  this.symbol_ = Blockly.utils.createSvgElement('tspan', {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));
};

/**
 * Updates the graph when the field rerenders.
 * @private
 */
Blockly.FieldAngle.prototype.render_ = function() {
  this.textElement_.textContent = this.getDisplayText_();
  this.textElement_.appendChild(this.symbol_);
  this.updateWidth();
  this.updateGraph_();
};

/**
 * Clean up this FieldAngle, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldAngle.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldAngle.superClass_.dispose_.call(thisField)();
    thisField.gauge_ = null;
    if (thisField.clickWrapper_) {
      Blockly.unbindEvent_(thisField.clickWrapper_);
    }
    if (thisField.moveWrapper1_) {
      Blockly.unbindEvent_(thisField.moveWrapper1_);
    }
    if (thisField.moveWrapper2_) {
      Blockly.unbindEvent_(thisField.moveWrapper2_);
    }
  };
};

/**
 * Show the inline free-text editor on top of the text.
 * @private
 */
Blockly.FieldAngle.prototype.showEditor_ = function() {
  var noFocus =
      Blockly.userAgent.MOBILE ||
      Blockly.userAgent.ANDROID ||
      Blockly.userAgent.IPAD;
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldAngle.superClass_.showEditor_.call(this, noFocus);

  // If there is an existing drop-down someone else owns, hide it immediately and clear it.
  Blockly.DropDownDiv.hideWithoutAnimation();
  Blockly.DropDownDiv.clearContent();
  var div = Blockly.DropDownDiv.getContentDiv();

  // Build the SVG DOM.
  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldAngle.HALF * 2) + 'px',
    'width': (Blockly.FieldAngle.HALF * 2) + 'px'
  }, div);
  var circle = Blockly.utils.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF, 'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.RADIUS,
    'class': 'blocklyAngleCircle'
  }, svg);
  this.gauge_ = Blockly.utils.createSvgElement('path',
      {'class': 'blocklyAngleGauge'}, svg);
  this.line_ = Blockly.utils.createSvgElement('line', {
    'x1': Blockly.FieldAngle.HALF,
    'y1': Blockly.FieldAngle.HALF,
    'class': 'blocklyAngleLine'
  }, svg);
  // Draw markers around the edge.
  for (var angle = 0; angle < 360; angle += 15) {
    Blockly.utils.createSvgElement('line', {
      'x1': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS,
      'y1': Blockly.FieldAngle.HALF,
      'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS -
          (angle % 45 == 0 ? 10 : 5),
      'y2': Blockly.FieldAngle.HALF,
      'class': 'blocklyAngleMarks',
      'transform': 'rotate(' + angle + ',' +
          Blockly.FieldAngle.HALF + ',' + Blockly.FieldAngle.HALF + ')'
    }, svg);
  }

  var border = this.sourceBlock_.getColourBorder();
  border = border.colourBorder == null ? border.colourLight : border.colourBorder;

  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), border);
  Blockly.DropDownDiv.showPositionedByField(this);
  // The angle picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behaviour.  For now, using bindEvent_ instead of
  // bindEventWithChecks_ allows it to work without a mousedown/touchstart.
  this.clickWrapper_ =
      Blockly.bindEvent_(svg, 'click', this, this.hide_.bind(this));
  this.moveWrapper1_ =
      Blockly.bindEvent_(circle, 'mousemove', this, this.onMouseMove);
  this.moveWrapper2_ =
      Blockly.bindEvent_(this.gauge_, 'mousemove', this, this.onMouseMove);
  this.updateGraph_();
};

/**
 * Hide the editor and unbind event listeners.
 * @private
 */
Blockly.FieldAngle.prototype.hide_ = function() {
  Blockly.unbindEvent_(this.moveWrapper1_);
  Blockly.unbindEvent_(this.moveWrapper2_);
  Blockly.unbindEvent_(this.clickWrapper_);
  Blockly.DropDownDiv.hideIfOwner(this);
  Blockly.WidgetDiv.hide();
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldAngle.prototype.onMouseMove = function(e) {
  // Calculate angle.
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldAngle.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldAngle.HALF;
  var angle = Math.atan(-dy / dx);
  if (isNaN(angle)) {
    // This shouldn't happen, but let's not let this error propagate further.
    return;
  }
  angle = Blockly.utils.toDegrees(angle);
  // 0: East, 90: North, 180: West, 270: South.
  if (dx < 0) {
    angle += 180;
  } else if (dy > 0) {
    angle += 360;
  }

  // Do offsetting.
  if (Blockly.FieldAngle.CLOCKWISE) {
    angle = Blockly.FieldAngle.OFFSET + 360 - angle;
  } else {
    angle = 360 - (Blockly.FieldAngle.OFFSET - angle);
  }
  if (angle > 360) {
    angle -= 360;
  }

  // Do rounding.
  if (Blockly.FieldAngle.ROUND) {
    angle = Math.round(angle / Blockly.FieldAngle.ROUND) *
        Blockly.FieldAngle.ROUND;
  }

  // Do wrapping.
  if (angle > Blockly.FieldAngle.WRAP) {
    angle -= 360;
  }

  // Update value.
  var angleString = String(angle);
  if (angleString != this.text_) {
    Blockly.FieldTextInput.htmlInput_.value = angle;
    this.setValue(angle);
    // Always render the input angle.
    this.text_ = angleString;
    this.forceRerender();
  }
};

/**
 * Redraw the graph with the current angle.
 * @private
 */
Blockly.FieldAngle.prototype.updateGraph_ = function() {
  if (!this.gauge_) {
    return;
  }
  // Always display the input (i.e. getText) even if it is invalid.
  var angleDegrees = Number(this.getText()) + Blockly.FieldAngle.OFFSET;
  angleDegrees = angleDegrees % 360;
  var angleRadians = Blockly.utils.toRadians(angleDegrees);
  var path = ['M ', Blockly.FieldAngle.HALF, ',', Blockly.FieldAngle.HALF];
  var x2 = Blockly.FieldAngle.HALF;
  var y2 = Blockly.FieldAngle.HALF;
  if (!isNaN(angleRadians)) {
    var angle1 = Blockly.utils.toRadians(Blockly.FieldAngle.OFFSET);
    var x1 = Math.cos(angle1) * Blockly.FieldAngle.RADIUS;
    var y1 = Math.sin(angle1) * -Blockly.FieldAngle.RADIUS;
    if (Blockly.FieldAngle.CLOCKWISE) {
      angleRadians = 2 * angle1 - angleRadians;
    }
    x2 += Math.cos(angleRadians) * Blockly.FieldAngle.RADIUS;
    y2 -= Math.sin(angleRadians) * Blockly.FieldAngle.RADIUS;
    // Don't ask how the flag calculations work.  They just do.
    var largeFlag = Math.abs(Math.floor((angleRadians - angle1) / Math.PI) % 2);
    if (Blockly.FieldAngle.CLOCKWISE) {
      largeFlag = 1 - largeFlag;
    }
    var sweepFlag = Number(Blockly.FieldAngle.CLOCKWISE);
    path.push(' l ', x1, ',', y1,
        ' A ', Blockly.FieldAngle.RADIUS, ',', Blockly.FieldAngle.RADIUS,
        ' 0 ', largeFlag, ' ', sweepFlag, ' ', x2, ',', y2, ' z');
  }
  this.gauge_.setAttribute('d', path.join(''));
  this.line_.setAttribute('x2', x2);
  this.line_.setAttribute('y2', y2);
};

/**
 * Ensure that the input value is a valid angle.
 * @param {string|number=} newValue The input value.
 * @return {?number} A valid angle, or null if invalid.
 * @protected
 */
Blockly.FieldAngle.prototype.doClassValidation_ = function(newValue) {
  if (isNaN(newValue)) {
    return null;
  }
  var n = parseFloat(newValue || 0);
  n = n % 360;
  if (n < 0) {
    n += 360;
  }
  if (n > Blockly.FieldAngle.WRAP) {
    n -= 360;
  }
  return n;
};

Blockly.Field.register('field_angle', Blockly.FieldAngle);
