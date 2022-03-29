/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Angle input field.
 */
'use strict';

/**
 * Angle input field.
 * @class
 */
goog.module('Blockly.FieldAngle');

const Css = goog.require('Blockly.Css');
const WidgetDiv = goog.require('Blockly.WidgetDiv');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const dropDownDiv = goog.require('Blockly.dropDownDiv');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const math = goog.require('Blockly.utils.math');
const userAgent = goog.require('Blockly.utils.userAgent');
const {Field} = goog.require('Blockly.Field');
const {FieldTextInput} = goog.require('Blockly.FieldTextInput');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
/* eslint-disable-next-line no-unused-vars */
const {Sentinel} = goog.requireType('Blockly.utils.Sentinel');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Class for an editable angle field.
 * @extends {FieldTextInput}
 * @alias Blockly.FieldAngle
 */
class FieldAngle extends FieldTextInput {
  /**
   * @param {(string|number|!Sentinel)=} opt_value The initial value of
   *     the field. Should cast to a number. Defaults to 0.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {Function=} opt_validator A function that is called to validate
   *     changes to the field's value. Takes in a number & returns a
   *     validated number, or null to abort the change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   *     https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/angle#creation}
   *     for a list of properties this parameter supports.
   */
  constructor(opt_value, opt_validator, opt_config) {
    super(Field.SKIP_SETUP);

    /**
     * Should the angle increase as the angle picker is moved clockwise (true)
     * or counterclockwise (false)
     * @see FieldAngle.CLOCKWISE
     * @type {boolean}
     * @private
     */
    this.clockwise_ = FieldAngle.CLOCKWISE;

    /**
     * The offset of zero degrees (and all other angles).
     * @see FieldAngle.OFFSET
     * @type {number}
     * @private
     */
    this.offset_ = FieldAngle.OFFSET;

    /**
     * The maximum angle to allow before wrapping.
     * @see FieldAngle.WRAP
     * @type {number}
     * @private
     */
    this.wrap_ = FieldAngle.WRAP;

    /**
     * The amount to round angles to when using a mouse or keyboard nav input.
     * @see FieldAngle.ROUND
     * @type {number}
     * @private
     */
    this.round_ = FieldAngle.ROUND;

    /**
     * The angle picker's SVG element.
     * @type {?SVGElement}
     * @private
     */
    this.editor_ = null;

    /**
     * The angle picker's gauge path depending on the value.
     * @type {?SVGElement}
     */
    this.gauge_ = null;

    /**
     * The angle picker's line drawn representing the value's angle.
     * @type {?SVGElement}
     */
    this.line_ = null;

    /**
     * The degree symbol for this field.
     * @type {SVGTSpanElement}
     * @protected
     */
    this.symbol_ = null;

    /**
     * Wrapper click event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.clickWrapper_ = null;

    /**
     * Surface click event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.clickSurfaceWrapper_ = null;

    /**
     * Surface mouse move event data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.moveSurfaceWrapper_ = null;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable.
     * @type {boolean}
     */
    this.SERIALIZABLE = true;

    if (opt_value === Field.SKIP_SETUP) return;
    if (opt_config) this.configure_(opt_config);
    this.setValue(opt_value);
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * Configure the field based on the given map of options.
   * @param {!Object} config A map of options to configure the field based on.
   * @protected
   * @override
   */
  configure_(config) {
    super.configure_(config);

    switch (config['mode']) {
      case 'compass':
        this.clockwise_ = true;
        this.offset_ = 90;
        break;
      case 'protractor':
        // This is the default mode, so we could do nothing. But just to
        // future-proof, we'll set it anyway.
        this.clockwise_ = false;
        this.offset_ = 0;
        break;
    }

    // Allow individual settings to override the mode setting.
    const clockwise = config['clockwise'];
    if (typeof clockwise === 'boolean') {
      this.clockwise_ = clockwise;
    }

    // If these are passed as null then we should leave them on the default.
    let offset = config['offset'];
    if (offset !== null) {
      offset = Number(offset);
      if (!isNaN(offset)) {
        this.offset_ = offset;
      }
    }
    let wrap = config['wrap'];
    if (wrap !== null) {
      wrap = Number(wrap);
      if (!isNaN(wrap)) {
        this.wrap_ = wrap;
      }
    }
    let round = config['round'];
    if (round !== null) {
      round = Number(round);
      if (!isNaN(round)) {
        this.round_ = round;
      }
    }
  }

  /**
   * Create the block UI for this field.
   * @package
   */
  initView() {
    super.initView();
    // Add the degree symbol to the left of the number, even in RTL (issue
    // #2380)
    this.symbol_ = dom.createSvgElement(Svg.TSPAN, {}, null);
    this.symbol_.appendChild(document.createTextNode('\u00B0'));
    this.textElement_.appendChild(this.symbol_);
  }

  /**
   * Updates the graph when the field rerenders.
   * @protected
   * @override
   */
  render_() {
    super.render_();
    this.updateGraph_();
  }

  /**
   * Create and show the angle field's editor.
   * @param {Event=} opt_e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @protected
   */
  showEditor_(opt_e) {
    // Mobile browsers have issues with in-line textareas (focus & keyboards).
    const noFocus = userAgent.MOBILE || userAgent.ANDROID || userAgent.IPAD;
    super.showEditor_(opt_e, noFocus);

    this.dropdownCreate_();
    dropDownDiv.getContentDiv().appendChild(this.editor_);

    dropDownDiv.setColour(
        this.sourceBlock_.style.colourPrimary,
        this.sourceBlock_.style.colourTertiary);

    dropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));

    this.updateGraph_();
  }

  /**
   * Create the angle dropdown editor.
   * @private
   */
  dropdownCreate_() {
    const svg = dom.createSvgElement(
        Svg.SVG, {
          'xmlns': dom.SVG_NS,
          'xmlns:html': dom.HTML_NS,
          'xmlns:xlink': dom.XLINK_NS,
          'version': '1.1',
          'height': (FieldAngle.HALF * 2) + 'px',
          'width': (FieldAngle.HALF * 2) + 'px',
          'style': 'touch-action: none',
        },
        null);
    const circle = dom.createSvgElement(
        Svg.CIRCLE, {
          'cx': FieldAngle.HALF,
          'cy': FieldAngle.HALF,
          'r': FieldAngle.RADIUS,
          'class': 'blocklyAngleCircle',
        },
        svg);
    this.gauge_ =
        dom.createSvgElement(Svg.PATH, {'class': 'blocklyAngleGauge'}, svg);
    this.line_ = dom.createSvgElement(
        Svg.LINE, {
          'x1': FieldAngle.HALF,
          'y1': FieldAngle.HALF,
          'class': 'blocklyAngleLine',
        },
        svg);
    // Draw markers around the edge.
    for (let angle = 0; angle < 360; angle += 15) {
      dom.createSvgElement(
          Svg.LINE, {
            'x1': FieldAngle.HALF + FieldAngle.RADIUS,
            'y1': FieldAngle.HALF,
            'x2': FieldAngle.HALF + FieldAngle.RADIUS -
                (angle % 45 === 0 ? 10 : 5),
            'y2': FieldAngle.HALF,
            'class': 'blocklyAngleMarks',
            'transform': 'rotate(' + angle + ',' + FieldAngle.HALF + ',' +
                FieldAngle.HALF + ')',
          },
          svg);
    }

    // The angle picker is different from other fields in that it updates on
    // mousemove even if it's not in the middle of a drag.  In future we may
    // change this behaviour.
    this.clickWrapper_ =
        browserEvents.conditionalBind(svg, 'click', this, this.hide_);
    // On touch devices, the picker's value is only updated with a drag. Add
    // a click handler on the drag surface to update the value if the surface
    // is clicked.
    this.clickSurfaceWrapper_ = browserEvents.conditionalBind(
        circle, 'click', this, this.onMouseMove_, true, true);
    this.moveSurfaceWrapper_ = browserEvents.conditionalBind(
        circle, 'mousemove', this, this.onMouseMove_, true, true);
    this.editor_ = svg;
  }

  /**
   * Disposes of events and DOM-references belonging to the angle editor.
   * @private
   */
  dropdownDispose_() {
    if (this.clickWrapper_) {
      browserEvents.unbind(this.clickWrapper_);
      this.clickWrapper_ = null;
    }
    if (this.clickSurfaceWrapper_) {
      browserEvents.unbind(this.clickSurfaceWrapper_);
      this.clickSurfaceWrapper_ = null;
    }
    if (this.moveSurfaceWrapper_) {
      browserEvents.unbind(this.moveSurfaceWrapper_);
      this.moveSurfaceWrapper_ = null;
    }
    this.gauge_ = null;
    this.line_ = null;
  }

  /**
   * Hide the editor.
   * @private
   */
  hide_() {
    dropDownDiv.hideIfOwner(this);
    WidgetDiv.hide();
  }

  /**
   * Set the angle to match the mouse's position.
   * @param {!Event} e Mouse move event.
   * @protected
   */
  onMouseMove_(e) {
    // Calculate angle.
    const bBox = this.gauge_.ownerSVGElement.getBoundingClientRect();
    const dx = e.clientX - bBox.left - FieldAngle.HALF;
    const dy = e.clientY - bBox.top - FieldAngle.HALF;
    let angle = Math.atan(-dy / dx);
    if (isNaN(angle)) {
      // This shouldn't happen, but let's not let this error propagate further.
      return;
    }
    angle = math.toDegrees(angle);
    // 0: East, 90: North, 180: West, 270: South.
    if (dx < 0) {
      angle += 180;
    } else if (dy > 0) {
      angle += 360;
    }

    // Do offsetting.
    if (this.clockwise_) {
      angle = this.offset_ + 360 - angle;
    } else {
      angle = 360 - (this.offset_ - angle);
    }

    this.displayMouseOrKeyboardValue_(angle);
  }

  /**
   * Handles and displays values that are input via mouse or arrow key input.
   * These values need to be rounded and wrapped before being displayed so
   * that the text input's value is appropriate.
   * @param {number} angle New angle.
   * @private
   */
  displayMouseOrKeyboardValue_(angle) {
    if (this.round_) {
      angle = Math.round(angle / this.round_) * this.round_;
    }
    angle = this.wrapValue_(angle);
    if (angle !== this.value_) {
      this.setEditorValue_(angle);
    }
  }

  /**
   * Redraw the graph with the current angle.
   * @private
   */
  updateGraph_() {
    if (!this.gauge_) {
      return;
    }
    // Always display the input (i.e. getText) even if it is invalid.
    let angleDegrees = Number(this.getText()) + this.offset_;
    angleDegrees %= 360;
    let angleRadians = math.toRadians(angleDegrees);
    const path = ['M ', FieldAngle.HALF, ',', FieldAngle.HALF];
    let x2 = FieldAngle.HALF;
    let y2 = FieldAngle.HALF;
    if (!isNaN(angleRadians)) {
      const clockwiseFlag = Number(this.clockwise_);
      const angle1 = math.toRadians(this.offset_);
      const x1 = Math.cos(angle1) * FieldAngle.RADIUS;
      const y1 = Math.sin(angle1) * -FieldAngle.RADIUS;
      if (clockwiseFlag) {
        angleRadians = 2 * angle1 - angleRadians;
      }
      x2 += Math.cos(angleRadians) * FieldAngle.RADIUS;
      y2 -= Math.sin(angleRadians) * FieldAngle.RADIUS;
      // Don't ask how the flag calculations work.  They just do.
      let largeFlag =
          Math.abs(Math.floor((angleRadians - angle1) / Math.PI) % 2);
      if (clockwiseFlag) {
        largeFlag = 1 - largeFlag;
      }
      path.push(
          ' l ', x1, ',', y1, ' A ', FieldAngle.RADIUS, ',', FieldAngle.RADIUS,
          ' 0 ', largeFlag, ' ', clockwiseFlag, ' ', x2, ',', y2, ' z');
    }
    this.gauge_.setAttribute('d', path.join(''));
    this.line_.setAttribute('x2', x2);
    this.line_.setAttribute('y2', y2);
  }

  /**
   * Handle key down to the editor.
   * @param {!Event} e Keyboard event.
   * @protected
   * @override
   */
  onHtmlInputKeyDown_(e) {
    super.onHtmlInputKeyDown_(e);

    let multiplier;
    if (e.keyCode === KeyCodes.LEFT) {
      // decrement (increment in RTL)
      multiplier = this.sourceBlock_.RTL ? 1 : -1;
    } else if (e.keyCode === KeyCodes.RIGHT) {
      // increment (decrement in RTL)
      multiplier = this.sourceBlock_.RTL ? -1 : 1;
    } else if (e.keyCode === KeyCodes.DOWN) {
      // decrement
      multiplier = -1;
    } else if (e.keyCode === KeyCodes.UP) {
      // increment
      multiplier = 1;
    }
    if (multiplier) {
      const value = /** @type {number} */ (this.getValue());
      this.displayMouseOrKeyboardValue_(value + (multiplier * this.round_));
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * Ensure that the input value is a valid angle.
   * @param {*=} opt_newValue The input value.
   * @return {?number} A valid angle, or null if invalid.
   * @protected
   * @override
   */
  doClassValidation_(opt_newValue) {
    const value = Number(opt_newValue);
    if (isNaN(value) || !isFinite(value)) {
      return null;
    }
    return this.wrapValue_(value);
  }

  /**
   * Wraps the value so that it is in the range (-360 + wrap, wrap).
   * @param {number} value The value to wrap.
   * @return {number} The wrapped value.
   * @private
   */
  wrapValue_(value) {
    value %= 360;
    if (value < 0) {
      value += 360;
    }
    if (value > this.wrap_) {
      value -= 360;
    }
    return value;
  }

  /**
   * Construct a FieldAngle from a JSON arg object.
   * @param {!Object} options A JSON object with options (angle).
   * @return {!FieldAngle} The new field instance.
   * @package
   * @nocollapse
   * @override
   */
  static fromJson(options) {
    // `this` might be a subclass of FieldAngle if that class doesn't override
    // the static fromJson method.
    return new this(options['angle'], undefined, options);
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
FieldAngle.prototype.DEFAULT_VALUE = 0;

/**
 * The default amount to round angles to when using a mouse or keyboard nav
 * input. Must be a positive integer to support keyboard navigation.
 * @const {number}
 */
FieldAngle.ROUND = 15;

/**
 * Half the width of protractor image.
 * @const {number}
 */
FieldAngle.HALF = 100 / 2;

/**
 * Default property describing which direction makes an angle field's value
 * increase. Angle increases clockwise (true) or counterclockwise (false).
 * @const {boolean}
 */
FieldAngle.CLOCKWISE = false;

/**
 * The default offset of 0 degrees (and all angles). Always offsets in the
 * counterclockwise direction, regardless of the field's clockwise property.
 * Usually either 0 (0 = right) or 90 (0 = up).
 * @const {number}
 */
FieldAngle.OFFSET = 0;

/**
 * The default maximum angle to allow before wrapping.
 * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
 * @const {number}
 */
FieldAngle.WRAP = 360;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 * @const {number}
 */
FieldAngle.RADIUS = FieldAngle.HALF - 1;

/**
 * CSS for angle field.  See css.js for use.
 */
Css.register(`
.blocklyAngleCircle {
  stroke: #444;
  stroke-width: 1;
  fill: #ddd;
  fill-opacity: .8;
}

.blocklyAngleMarks {
  stroke: #444;
  stroke-width: 1;
}

.blocklyAngleGauge {
  fill: #f88;
  fill-opacity: .8;
  pointer-events: none;
}

.blocklyAngleLine {
  stroke: #f00;
  stroke-width: 2;
  stroke-linecap: round;
  pointer-events: none;
}
`);

fieldRegistry.register('field_angle', FieldAngle);

exports.FieldAngle = FieldAngle;
