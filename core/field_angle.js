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
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.math');
goog.require('Blockly.utils.userAgent');


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
  var field = new Blockly.FieldAngle(options['angle']);

  var clockwise = null;
  var offset = null;
  var wrap = null;
  var round = null;

  var mode = options['mode'];
  switch (mode) {
    case 'compass':
      clockwise = true;
      offset = 90;
      break;
    case 'protractor':
      // This is the default mode, so we could do nothing. But just to
      // future-proof we'll set it anyway.
      clockwise = false;
      offset = 0;
      break;
  }

  // Allow individual settings to override the mode setting.
  if (typeof options['clockwise'] == 'boolean') {
    clockwise = options['clockwise'];
  }
  if (typeof options['offset'] == 'number') {
    offset = options['offset'];
  }
  if (typeof options['wrap'] == 'number') {
    wrap = options['wrap'];
  }
  if (typeof options['round'] == 'number') {
    round = options['round'];
  }

  field.setClockwise((clockwise));
  field.setOffset(offset);
  field.setWrap(wrap);
  field.setRound(round);

  return field;
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldAngle.prototype.SERIALIZABLE = true;

/**
 * Half the width of protractor image.
 * @type {number}
 * @const
 */
Blockly.FieldAngle.HALF = 100 / 2;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 * @type {number}
 * @const
 */
Blockly.FieldAngle.RADIUS = Blockly.FieldAngle.HALF - 1;

/* See <DOCS LINK HERE> for more information about these properties. */

/**
 * Angle increases clockwise (true) or counterclockwise (false).
 * @type {boolean}
 * @const
 */
Blockly.FieldAngle.CLOCKWISE = false;

/**
 * Offset the location of 0 degrees (and all angles) by a constant number of
 * degrees in the clockwise direction (independent of the CLOCKWISE property).
 * Usually either 0 (0 = right) or 90 (0 = up).
 * @type {number}
 * @const
 */
Blockly.FieldAngle.OFFSET = 0;

/**
 * The wrap/range of the angle field. The range is equal to (-360 + WRAP, WRAP).
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 * @type {number}
 * @const
 */
Blockly.FieldAngle.WRAP = 360;

/**
 * Round angles input through the graphical editor (mouse) to the nearest
 * multiple of this number.
 * Set to 0 to disable rounding.
 * @type {number}
 * @const
 */
Blockly.FieldAngle.ROUND = 15;

/**
 * The clockwise property used by this field. If null, use the global property.
 * @type {?boolean}
 * @private
 */
Blockly.FieldAngle.prototype.clockwise_ = null;

/**
 * The offset property used by this field. If null, use the global property.
 * @type {?number}
 * @private
 */
Blockly.FieldAngle.prototype.offset_ = null;

/**
 * The wrap property used by this field. If null, use the global property.
 * @type {?number}
 * @private
 */
Blockly.FieldAngle.prototype.wrap_ = null;

/**
 * The round property used by this field. If null, use the global property.
 * @type {?number}
 * @private
 */
Blockly.FieldAngle.prototype.round_ = null;

/**
 * Create the block UI for this field.
 * @package
 */
Blockly.FieldAngle.prototype.initView = function() {
  Blockly.FieldAngle.superClass_.initView.call(this);
  // Add the degree symbol to the left of the number, even in RTL (issue #2380)
  this.symbol_ = Blockly.utils.dom.createSvgElement('tspan', {}, null);
  this.symbol_.appendChild(document.createTextNode('\u00B0'));
  this.textElement_.appendChild(this.symbol_);
};

/**
 * Updates the graph when the field rerenders.
 * @private
 */
Blockly.FieldAngle.prototype.render_ = function() {
  Blockly.FieldAngle.superClass_.render_.call(this);
  this.updateGraph_();
};

/**
 * Create and show the angle field's editor.
 * @private
 */
Blockly.FieldAngle.prototype.showEditor_ = function() {
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  var noFocus =
      Blockly.utils.userAgent.MOBILE ||
      Blockly.utils.userAgent.ANDROID ||
      Blockly.utils.userAgent.IPAD;
  Blockly.FieldAngle.superClass_.showEditor_.call(this, noFocus);

  var editor = this.dropdownCreate_();
  Blockly.DropDownDiv.getContentDiv().appendChild(editor);

  var border = this.sourceBlock_.getColourBorder();
  border = border.colourBorder || border.colourLight;
  Blockly.DropDownDiv.setColour(this.sourceBlock_.getColour(), border);

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

  this.updateGraph_();
};

/**
 * Create the angle dropdown editor.
 * @return {!Element} The newly created angle picker.
 * @private
 */
Blockly.FieldAngle.prototype.dropdownCreate_ = function() {
  var svg = Blockly.utils.dom.createSvgElement('svg', {
    'xmlns': Blockly.utils.dom.SVG_NS,
    'xmlns:html': Blockly.utils.dom.HTML_NS,
    'xmlns:xlink': Blockly.utils.dom.XLINK_NS,
    'version': '1.1',
    'height': (Blockly.FieldAngle.HALF * 2) + 'px',
    'width': (Blockly.FieldAngle.HALF * 2) + 'px'
  }, null);
  var circle = Blockly.utils.dom.createSvgElement('circle', {
    'cx': Blockly.FieldAngle.HALF,
    'cy': Blockly.FieldAngle.HALF,
    'r': Blockly.FieldAngle.RADIUS,
    'class': 'blocklyAngleCircle'
  }, svg);
  this.gauge_ = Blockly.utils.dom.createSvgElement('path', {
    'class': 'blocklyAngleGauge'
  }, svg);
  this.line_ = Blockly.utils.dom.createSvgElement('line', {
    'x1': Blockly.FieldAngle.HALF,
    'y1': Blockly.FieldAngle.HALF,
    'class': 'blocklyAngleLine'
  }, svg);
  // Draw markers around the edge.
  for (var angle = 0; angle < 360; angle += 15) {
    Blockly.utils.dom.createSvgElement('line', {
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

  // The angle picker is different from other fields in that it updates on
  // mousemove even if it's not in the middle of a drag.  In future we may
  // change this behaviour.  For now, using bindEvent_ instead of
  // bindEventWithChecks_ allows it to work without a mousedown/touchstart.
  this.clickWrapper_ =
      Blockly.bindEvent_(svg, 'click', this, this.hide_);
  this.moveWrapper1_ =
      Blockly.bindEvent_(circle, 'mousemove', this, this.onMouseMove);
  this.moveWrapper2_ =
      Blockly.bindEvent_(this.gauge_, 'mousemove', this, this.onMouseMove);

  return svg;
};

/**
 * Dispose of events belonging to the angle editor.
 * @private
 */
Blockly.FieldAngle.prototype.dropdownDispose_ = function() {
  Blockly.unbindEvent_(this.clickWrapper_);
  Blockly.unbindEvent_(this.moveWrapper1_);
  Blockly.unbindEvent_(this.moveWrapper2_);
};

/**
 * Hide the editor.
 * @private
 */
Blockly.FieldAngle.prototype.hide_ = function() {
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
  angle = Blockly.utils.math.toDegrees(angle);
  // 0: East, 90: North, 180: West, 270: South.
  if (dx < 0) {
    angle += 180;
  } else if (dy > 0) {
    angle += 360;
  }

  // Do offsetting.
  var offset = this.getOffset();
  if (this.getClockwise()) {
    angle = offset + 360 - angle;
  } else {
    angle = 360 - (offset - angle);
  }
  if (angle > 360) {
    angle -= 360;
  }

  // Do rounding.
  var round = this.getRound();
  if (round) {
    angle = Math.round(angle / round) * round;
  }

  // Do wrapping.
  if (angle > this.getWrap()) {
    angle -= 360;
  }

  // Update value.
  var angleString = String(angle);
  if (angleString != this.text_) {
    this.htmlInput_.value = angle;
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
  var clockwise = this.getClockwise();
  var offset = this.getOffset();

  // Always display the input (i.e. getText) even if it is invalid.
  var angleDegrees = Number(this.getText()) + offset;
  angleDegrees %= 360;
  var angleRadians = Blockly.utils.math.toRadians(angleDegrees);
  var path = ['M ', Blockly.FieldAngle.HALF, ',', Blockly.FieldAngle.HALF];
  var x2 = Blockly.FieldAngle.HALF;
  var y2 = Blockly.FieldAngle.HALF;
  if (!isNaN(angleRadians)) {
    var angle1 = Blockly.utils.math.toRadians(offset);
    var x1 = Math.cos(angle1) * Blockly.FieldAngle.RADIUS;
    var y1 = Math.sin(angle1) * -Blockly.FieldAngle.RADIUS;
    if (clockwise) {
      angleRadians = 2 * angle1 - angleRadians;
    }
    x2 += Math.cos(angleRadians) * Blockly.FieldAngle.RADIUS;
    y2 -= Math.sin(angleRadians) * Blockly.FieldAngle.RADIUS;
    // Don't ask how the flag calculations work.  They just do.
    var largeFlag = Math.abs(Math.floor((angleRadians - angle1) / Math.PI) % 2);
    if (clockwise) {
      largeFlag = 1 - largeFlag;
    }
    var sweepFlag = Number(clockwise);
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
 * @override
 */
Blockly.FieldAngle.prototype.doClassValidation_ = function(newValue) {
  if (isNaN(newValue)) {
    return null;
  }
  var n = parseFloat(newValue || 0);
  n %= 360;
  if (n < 0) {
    n += 360;
  }
  if (n > this.getWrap()) {
    n -= 360;
  }
  return n;
};

/**
 * Set which direction should make the graphical angle editor increase.
 * @param {boolean=} clockwise Whether the graphical angle editor should
 *    increase as it is moved clockwise (true) or counterclockwise (false)
 *    or the global setting (null).
 */
Blockly.FieldAngle.prototype.setClockwise = function(clockwise) {
  // TODO: Handle undefined.
  this.clockwise_ = clockwise;
  // TODO: Do render update?
};

/**
 * Set the offset of zero degrees. Usually 0 (right) or 90 (up).
 * @param {number=} offset The amount to offset the location of 0 degrees
 *    by. Always offsets in the clockwise direction independent of the
 *    Clockwise property. Pass null to use the
 *    global setting.
 */
Blockly.FieldAngle.prototype.setOffset = function(offset) {
  this.offset_ = offset;
  // TODO: Do render update?
};

/**
 * Set the wrap/range of the angle field. The range is equal to (-360 +
 * WRAP, WRAP).
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 * @param {number=} wrap The wrap value of the angle field. Pass null to use
 *    the global setting.
 */
Blockly.FieldAngle.prototype.setWrap = function(wrap) {
  this.wrap_ = wrap;
  // TODO: Do render update? May also need to call setValue to reevaluate value?
};

/**
 * Set the rounding of the angle field's graphical editor.
 * @param {number=} round The value (when input through the graphical
 *    editor) will be rounded to the nearest multiple of this number. Pass 0
 *    to disable rounding. Pass null to use the global setting.
 */
Blockly.FieldAngle.prototype.setRound = function(round) {
  this.round_ = round;
  // TODO: Do render update?
};

/**
 * Get the direction the angle field's value increases in.
 * @return {boolean} Clockwise (true) or counterclockwise (false).
 */
Blockly.FieldAngle.prototype.getClockwise = function() {
  if (this.clockwise_ == null) {
    return Blockly.FieldAngle.CLOCKWISE;
  }
  return this.clockwise_;
};

/**
 * Get the amount 0 degrees is offset by.
 * @return {number} The amount of offset.
 */
Blockly.FieldAngle.prototype.getOffset = function() {
  if (this.offset_ == null) {
    return Blockly.FieldAngle.OFFSET;
  }
  return this.offset_;
};

/**
 * Get the wrap value of the angle field.
 * @return {number} The number the angle field gets wrapped at.
 */
Blockly.FieldAngle.prototype.getWrap = function() {
  if (this.wrap_ == null) {
    return Blockly.FieldAngle.WRAP;
  }
  return this.wrap_;
};

/**
 * Get the number values input via the graphical editor are rounded to.
 * @return {number} The round value.
 */
Blockly.FieldAngle.prototype.getRound = function() {
  if (this.round_ == null) {
    return Blockly.FieldAngle.ROUND;
  }
  return this.round_;
};

Blockly.Field.register('field_angle', Blockly.FieldAngle);
