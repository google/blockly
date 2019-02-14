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

goog.provide('Blockly.FieldJointAngle');

goog.require('Blockly.FieldTextInput');
goog.require('Blockly.utils');

goog.require('goog.userAgent');


/**
 * Class for an editable angle field.
 * @param {(string|number)=} opt_value The initial content of the field. The
 *     value should cast to a number, and if it does not, '0' will be used.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldJointAngle = function(opt_value, opt_validator) {
  // Add degree symbol: '180°' (LTR) or '°180' (RTL)
  this.symbol_ = Blockly.utils.createSvgElement('tspan', {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));

  opt_value = (opt_value && !isNaN(opt_value)) ? String(opt_value) : '0';
  Blockly.FieldJointAngle.superClass_.constructor.call(
      this, opt_value, opt_validator);
};
goog.inherits(Blockly.FieldJointAngle, Blockly.FieldTextInput);

/**
 * Construct a FieldJointAngle from a JSON arg object.
 * @param {!Object} options A JSON object with options (angle).
 * @returns {!Blockly.FieldJointAngle} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldJointAngle.fromJson = function(options) {
  return new Blockly.FieldJointAngle(options['angle']);
};

/**
 * Round angles to the nearest 15 degrees when using mouse.
 * Set to 0 to disable rounding.
 */
Blockly.FieldJointAngle.ROUND = 15;

/**
 * Half the width of protractor image.
 */
Blockly.FieldJointAngle.HALF = 100 / 2;

/* The following two settings work together to set the behaviour of the angle
 * picker.  While many combinations are possible, two modes are typical:
 * Math mode.
 *   0 deg is right, 90 is up.  This is the style used by protractors.
 *   Blockly.FieldJointAngle.CLOCKWISE = false;
 *   Blockly.FieldJointAngle.OFFSET = 0;
 * Compass mode.
 *   0 deg is up, 90 is right.  This is the style used by maps.
 *   Blockly.FieldJointAngle.CLOCKWISE = true;
 *   Blockly.FieldJointAngle.OFFSET = 90;
 */

/**
 * Angle increases clockwise (true) or counterclockwise (false).
 */
Blockly.FieldJointAngle.CLOCKWISE = true;

/**
 * Offset the location of 0 degrees (and all angles) by a constant.
 * Usually either 0 (0 = right) or 90 (0 = up).
 */
Blockly.FieldJointAngle.OFFSET = 90;

/**
 * Maximum allowed angle before wrapping.
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 */
Blockly.FieldJointAngle.WRAP = 180;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldJointAngle.RADIUS = Blockly.FieldJointAngle.HALF - 1;

/**
 * Adds degree symbol and recalculates width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.FieldJointAngle.prototype.render_ = function() {
  if (!this.visible_) {
    this.size_.width = 0;
    return;
  }

  // Update textElement.
  this.textElement_.textContent = this.getDisplayText_();

  // Insert degree symbol.
  if (this.sourceBlock_.RTL) {
    this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild);
  } else {
    this.textElement_.appendChild(this.symbol_);
  }
  this.updateWidth();
};

/**
 * Clean up this FieldJointAngle, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldJointAngle.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldJointAngle.superClass_.dispose_.call(thisField)();
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
Blockly.FieldJointAngle.prototype.showEditor_ = function() {
  var noFocus =
      goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldJointAngle.superClass_.showEditor_.call(this, noFocus);
  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    // Mobile interface uses Blockly.prompt.
    return;
  }
  // Build the SVG DOM.
  var svg = Blockly.utils.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldJointAngle.HALF+1) + 'px',
    'width': (Blockly.FieldJointAngle.HALF * 2) + 'px'
  }, div);

  var circle = Blockly.utils.createSvgElement('path', {
    'd': 'M ' + Blockly.FieldJointAngle.HALF + ',' + Blockly.FieldJointAngle.HALF + 
    ' l ' + (Blockly.FieldJointAngle.HALF) + ',0' + 
    ' A ' + (Blockly.FieldJointAngle.HALF) + ',' + (Blockly.FieldJointAngle.HALF) + 
    ' 0 0 0 0,' + Blockly.FieldJointAngle.HALF + ' z',
    'class': 'blocklyAngleCircle'
  }, svg);
  this.gauge_ = Blockly.utils.createSvgElement('path', {
      'class': 'blocklyAngleGauge', 
      'transform': 'rotate(270,50,50)'
    }, svg);
  this.line_ = Blockly.utils.createSvgElement('line', {
    'x1': Blockly.FieldJointAngle.HALF,
    'y1': Blockly.FieldJointAngle.HALF,
    'class': 'blocklyAngleLine',
    'transform': 'rotate(270,50,50)'
  }, svg);
  // Draw markers around the edge.
  for (var angle = 195; angle < 360; angle += 15) {
    Blockly.utils.createSvgElement('line', {
      'x1': Blockly.FieldJointAngle.HALF + Blockly.FieldJointAngle.RADIUS,
      'y1': Blockly.FieldJointAngle.HALF,
      'x2': Blockly.FieldJointAngle.HALF + Blockly.FieldJointAngle.RADIUS -
          (angle % 45 == 0 ? 10 : 5),
      'y2': Blockly.FieldJointAngle.HALF,
      'class': 'blocklyAngleMarks',
      'transform': 'rotate(' + angle + ',' +
          Blockly.FieldJointAngle.HALF + ',' + Blockly.FieldJointAngle.HALF + ')'
    }, svg);
  }
  Blockly.utils.createSvgElement('line', {
    'x1': 0,
    'y1': Blockly.FieldJointAngle.HALF,
    'x2': Blockly.FieldJointAngle.RADIUS*2,
    'y2': Blockly.FieldJointAngle.HALF,
    'class': 'blocklyAngleMarks',
    'transform': 'rotate(0,' + Blockly.FieldJointAngle.HALF + ',' + Blockly.FieldJointAngle.HALF + ')'
  }, svg);
  svg.style.marginLeft = (15 - Blockly.FieldJointAngle.RADIUS) + 'px';

  // The angle picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behavior.  For now, using bindEvent_ instead of
  // bindEventWithChecks_ allows it to work without a mousedown/touchstart.
  this.clickWrapper_ =
      Blockly.bindEvent_(svg, 'click', this, Blockly.WidgetDiv.hide);
  this.moveWrapper1_ =
      Blockly.bindEvent_(circle, 'mousemove', this, this.onMouseMove);
  this.moveWrapper2_ =
      Blockly.bindEvent_(this.gauge_, 'mousemove', this, this.onMouseMove);
  this.updateGraph_();
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldJointAngle.prototype.onMouseMove = function(e) {
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldJointAngle.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldJointAngle.HALF;
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
  if (Blockly.FieldJointAngle.CLOCKWISE) {
    angle = Blockly.FieldJointAngle.OFFSET + 360 - angle;
  } else {
    angle -= Blockly.FieldJointAngle.OFFSET;
  }
  if (Blockly.FieldJointAngle.ROUND) {
    angle = Math.round(angle / Blockly.FieldJointAngle.ROUND) *
        Blockly.FieldJointAngle.ROUND;
  }
  angle = this.callValidator(angle);
  Blockly.FieldTextInput.htmlInput_.value = angle;
  this.setValue(angle);
  this.validate_();
  this.resizeEditor_();
};

/**
 * Insert a degree symbol.
 * @param {?string} text New text.
 */
Blockly.FieldJointAngle.prototype.setText = function(text) {
  Blockly.FieldJointAngle.superClass_.setText.call(this, text);
  if (!this.textElement_) {
    // Not rendered yet.
    return;
  }
  this.updateGraph_();
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

/**
 * Redraw the graph with the current angle.
 * @private
 */
Blockly.FieldJointAngle.prototype.updateGraph_ = function() {
  if (!this.gauge_) {
    return;
  }
  var angleDegrees = Number(this.getText()) + (2 * Blockly.FieldJointAngle.OFFSET);
  var angleRadians = Blockly.utils.toRadians(angleDegrees);
  var path = ['M ', Blockly.FieldJointAngle.HALF, ',', Blockly.FieldJointAngle.HALF];
  var x2 = Blockly.FieldJointAngle.HALF;
  var y2 = Blockly.FieldJointAngle.HALF;
  if (!isNaN(angleRadians)) {
    var angle1 = Blockly.utils.toRadians(Blockly.FieldJointAngle.OFFSET);
    var x1 = Math.cos(angle1) * Blockly.FieldJointAngle.RADIUS;
    var y1 = Math.sin(angle1) * -Blockly.FieldJointAngle.RADIUS;
    if (Blockly.FieldJointAngle.CLOCKWISE) {
      angleRadians = 2 * angle1 - angleRadians;
    }
    x2 += Math.cos(angleRadians) * Blockly.FieldJointAngle.RADIUS;
    y2 -= Math.sin(angleRadians) * Blockly.FieldJointAngle.RADIUS;
    // Don't ask how the flag calculations work.  They just do.
    var largeFlag = Math.abs(Math.floor((angleRadians - angle1) / Math.PI) % 2);
    if (Blockly.FieldJointAngle.CLOCKWISE) {
      largeFlag = 1 - largeFlag;
    }
    var sweepFlag = Number(Blockly.FieldJointAngle.CLOCKWISE);
    path.push(' l ', x1, ',', y1,
        ' A ', Blockly.FieldJointAngle.RADIUS, ',', Blockly.FieldJointAngle.RADIUS,
        ' 0 ', largeFlag, ' ', sweepFlag, ' ', x2, ',', y2, ' z');
  }
  this.gauge_.setAttribute('d', path.join(''));
  this.line_.setAttribute('x2', x2);
  this.line_.setAttribute('y2', y2);
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldJointAngle.prototype.classValidator = function(text) {
  if (text === null) {
    return null;
  }
  var n = parseFloat(text || 0);
  if (isNaN(n)) {
    return null;
  }
  n = n % 360;
  if (n < 0) {
    n += 360;
  }
  if (n > Blockly.FieldJointAngle.WRAP) {
    n -= 360;
  }
  return String(n);
};

Blockly.Field.register('field_joint_angle', Blockly.FieldJointAngle);
