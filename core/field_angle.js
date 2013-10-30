/**
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
 * http://blockly.googlecode.com/
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

goog.require('Blockly.FieldTextInput');


/**
 * Class for an editable angle field.
 * @param {string} text The initial content of the field.
 * @param {Function} opt_changeHandler An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns the accepted text or null to abort
 *     the change.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldAngle = function(text, opt_changeHandler) {
  var changeHandler;
  if (opt_changeHandler) {
    // Wrap the user's change handler together with the angle validator.
    var thisObj = this;
    changeHandler = function(value) {
      value = Blockly.FieldAngle.angleValidator.call(thisObj, value);
      if (value !== null) {
        opt_changeHandler.call(thisObj, value);
      }
      return value;
    };
  } else {
    changeHandler = Blockly.FieldAngle.angleValidator;
  }

  // Add degree symbol: "360°" (LTR) or "°360" (RTL)
  this.symbol_ = Blockly.createSvgElement('tspan', {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));

  Blockly.FieldAngle.superClass_.constructor.call(this,
      text, changeHandler);
};
goog.inherits(Blockly.FieldAngle, Blockly.FieldTextInput);

/**
 * Half the width of protractor image.
 */
Blockly.FieldAngle.HALF = 100 / 2;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldAngle.RADIUS = Blockly.FieldAngle.HALF - 1;

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
  Blockly.FieldAngle.superClass_.showEditor_.call(this);
  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    // Mobile interface uses window.prompt.
    return;
  }
  // Build the SVG DOM.
  var svg = Blockly.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'height': (Blockly.FieldAngle.HALF * 2) + 'px',
    'width': (Blockly.FieldAngle.HALF * 2) + 'px'
  }, div);
  var circle = Blockly.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF, 'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.RADIUS,
    'class': 'blocklyAngleCircle'
  }, svg);
  this.gauge_ =
      Blockly.createSvgElement('path', {'class': 'blocklyAngleGuage'}, svg);
  // Draw markers around the edge.
  for (var a = 0; a < 360; a += 15) {
    Blockly.createSvgElement('line', {
      'x1': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS,
      'y1': Blockly.FieldAngle.HALF,
      'x2': Blockly.FieldAngle.HALF + Blockly.FieldAngle.RADIUS -
          (a % 45 == 0 ? 10 : 5),
      'y2': Blockly.FieldAngle.HALF,
      'class': 'blocklyAngleMarks',
      'transform': 'rotate(' + a + ', ' +
          Blockly.FieldAngle.HALF + ', ' + Blockly.FieldAngle.HALF + ')'
    }, svg);
  }
  svg.style.marginLeft = '-35px';
  this.clickWrapper_ =
      Blockly.bindEvent_(svg, 'click', this, Blockly.WidgetDiv.hide);
  this.moveWrapper1_ =
      Blockly.bindEvent_(circle, 'mousemove', this, this.onMouseMove);
  this.moveWrapper2_ =
      Blockly.bindEvent_(this.gauge_, 'mousemove', this, this.onMouseMove);
  this.updateGraph();
};

/**
 * Set the angle to match the mouse's position.
 * @param {!Event} e Mouse move event.
 */
Blockly.FieldAngle.prototype.onMouseMove = function(e) {
  var bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
  var dx = e.clientX - bBox.left - Blockly.FieldAngle.HALF;
  var dy = e.clientY - bBox.top - Blockly.FieldAngle.HALF;
  var angle = Math.atan(-dy / dx);
  if (isNaN(angle)) {
    // This shouldn't happen, but let's not let this error propogate further.
    return;
  }
  angle = angle / Math.PI * 180;
  // 0: East, 90: North, 180: West, 270: South.
  if (dx < 0) {
    angle += 180;
  } else if (dy > 0) {
    angle += 360;
  }
  angle = String(Math.round(angle));
  Blockly.FieldTextInput.htmlInput_.value = angle;
  this.setText(angle);
};

/**
 * Insert a degree symbol.
 * @param {?string} text New text.
 */
Blockly.FieldAngle.prototype.setText = function(text) {
  Blockly.FieldAngle.superClass_.setText.call(this, text);
  this.updateGraph();
  // Insert degree symbol.
  if (Blockly.RTL) {
    this.textElement_.insertBefore(this.symbol_, this.textElement_.firstChild);
  } else {
    this.textElement_.appendChild(this.symbol_);
  }
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldAngle.prototype.updateGraph = function() {
  if (this.gauge_) {
    var angleRadians = Number(this.getText()) / 180 * Math.PI;
    if (isNaN(angleRadians)) {
      this.gauge_.setAttribute('d',
          'M ' + Blockly.FieldAngle.HALF + ', ' + Blockly.FieldAngle.HALF);
    } else {
      var x = Blockly.FieldAngle.HALF + Math.cos(angleRadians) *
          Blockly.FieldAngle.RADIUS;
      var y = Blockly.FieldAngle.HALF + Math.sin(angleRadians) *
          -Blockly.FieldAngle.RADIUS;
      var largeFlag = (angleRadians > Math.PI) ? 1 : 0;
      this.gauge_.setAttribute('d',
          'M ' + Blockly.FieldAngle.HALF + ', ' + Blockly.FieldAngle.HALF +
          ' h ' + Blockly.FieldAngle.RADIUS +
          ' A ' + Blockly.FieldAngle.RADIUS + ',' + Blockly.FieldAngle.RADIUS +
          ' 0 ' + largeFlag + ' 0 ' + x + ',' + y + ' z');
    }
  }
};

/**
 * Ensure that only an angle may be entered.
 * @param {string} text The user's text.
 * @return {?string} A string representing a valid angle, or null if invalid.
 */
Blockly.FieldAngle.angleValidator = function(text) {
  var n = Blockly.FieldTextInput.numberValidator(text);
  if (n !== null) {
    n = n % 360;
    if (n < 0) {
      n += 360;
    }
    n = String(n);
   }
  return n;
};
