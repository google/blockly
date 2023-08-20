/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Angle input field.
 *
 * @class
 */
// Former goog.module ID: Blockly.FieldAngle

import {BlockSvg} from './block_svg.js';
import * as browserEvents from './browser_events.js';
import * as Css from './css.js';
import * as dropDownDiv from './dropdowndiv.js';
import * as eventUtils from './events/utils.js';
import {Field, UnattachedFieldError} from './field.js';
import * as fieldRegistry from './field_registry.js';
import {
  FieldInput,
  FieldInputConfig,
  FieldInputValidator,
} from './field_input.js';
import * as dom from './utils/dom.js';
import * as math from './utils/math.js';
import {Svg} from './utils/svg.js';
import * as userAgent from './utils/useragent.js';
import * as WidgetDiv from './widgetdiv.js';

/**
 * Class for an editable angle field.
 */
export class FieldAngle extends FieldInput<number> {
  /** Half the width of protractor image. */
  static readonly HALF = 100 / 2;

  /**
   * Radius of protractor circle.  Slightly smaller than protractor size since
   * otherwise SVG crops off half the border at the edges.
   */
  static readonly RADIUS: number = FieldAngle.HALF - 1;

  /**
   * Default property describing which direction makes an angle field's value
   * increase. Angle increases clockwise (true) or counterclockwise (false).
   */
  static readonly CLOCKWISE = false;

  /**
   * The default offset of 0 degrees (and all angles). Always offsets in the
   * counterclockwise direction, regardless of the field's clockwise property.
   * Usually either 0 (0 = right) or 90 (0 = up).
   */
  static readonly OFFSET = 0;

  /**
   * The default maximum angle to allow before wrapping.
   * Usually either 360 (for 0 to 359.9) or 180 (for -179.9 to 180).
   */
  static readonly WRAP = 360;

  /**
   * The default amount to round angles to when using a mouse or keyboard nav
   * input. Must be a positive integer to support keyboard navigation.
   */
  static readonly ROUND = 15;

  /**
   * Whether the angle should increase as the angle picker is moved clockwise
   * (true) or counterclockwise (false).
   */
  private clockwise = FieldAngle.CLOCKWISE;

  /**
   * The offset of zero degrees (and all other angles).
   */
  private offset = FieldAngle.OFFSET;

  /**
   * The maximum angle to allow before wrapping.
   */
  private wrap = FieldAngle.WRAP;

  /**
   * The amount to round angles to when using a mouse or keyboard nav input.
   */
  private round = FieldAngle.ROUND;

  /**
   * Array holding info needed to unbind events.
   * Used for disposing.
   * Ex: [[node, name, func], [node, name, func]].
   */
  private boundEvents: browserEvents.Data[] = [];

  /** Dynamic red line pointing at the value's angle. */
  private line: SVGLineElement | null = null;

  /** Dynamic pink area extending from 0 to the value's angle. */
  private gauge: SVGPathElement | null = null;

  /** The degree symbol for this field. */
  protected symbol_: SVGTSpanElement | null = null;

  /**
   * @param value The initial value of the field. Should cast to a number.
   *     Defaults to 0. Also accepts Field.SKIP_SETUP if you wish to skip setup
   *     (only used by subclasses that want to handle configuration and setting
   *     the field value after their own constructors have run).
   * @param validator A function that is called to validate changes to the
   *     field's value. Takes in a number & returns a validated number, or null
   *     to abort the change.
   * @param config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/angle#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
    value?: string | number | typeof Field.SKIP_SETUP,
    validator?: FieldAngleValidator,
    config?: FieldAngleConfig,
  ) {
    super(Field.SKIP_SETUP);

    if (value === Field.SKIP_SETUP) return;
    if (config) {
      this.configure_(config);
    }
    this.setValue(value);
    if (validator) {
      this.setValidator(validator);
    }
  }

  /**
   * Configure the field based on the given map of options.
   *
   * @param config A map of options to configure the field based on.
   */
  protected override configure_(config: FieldAngleConfig) {
    super.configure_(config);

    switch (config.mode) {
      case Mode.COMPASS:
        this.clockwise = true;
        this.offset = 90;
        break;
      case Mode.PROTRACTOR:
        // This is the default mode, so we could do nothing. But just to
        // future-proof, we'll set it anyway.
        this.clockwise = false;
        this.offset = 0;
        break;
    }

    // Allow individual settings to override the mode setting.
    if (config.clockwise) this.clockwise = config.clockwise;
    if (config.offset) this.offset = config.offset;
    if (config.wrap) this.wrap = config.wrap;
    if (config.round) this.round = config.round;
  }

  /**
   * Create the block UI for this field.
   */
  override initView() {
    super.initView();
    // Add the degree symbol to the left of the number,
    // even in RTL (issue #2380).
    this.symbol_ = dom.createSvgElement(Svg.TSPAN, {});
    this.symbol_.appendChild(document.createTextNode('°'));
    this.getTextElement().appendChild(this.symbol_);
  }

  /** Updates the angle when the field rerenders. */
  protected override render_() {
    super.render_();
    this.updateGraph();
  }

  /**
   * Create and show the angle field's editor.
   *
   * @param e Optional mouse event that triggered the field to open,
   *     or undefined if triggered programmatically.
   */
  protected override showEditor_(e?: Event) {
    // Mobile browsers have issues with in-line textareas (focus & keyboards).
    const noFocus = userAgent.MOBILE || userAgent.ANDROID || userAgent.IPAD;
    super.showEditor_(e, noFocus);

    const editor = this.dropdownCreate();
    dropDownDiv.getContentDiv().appendChild(editor);

    if (this.sourceBlock_ instanceof BlockSvg) {
      dropDownDiv.setColour(
        this.sourceBlock_.style.colourPrimary,
        this.sourceBlock_.style.colourTertiary,
      );
    }

    dropDownDiv.showPositionedByField(this, this.dropdownDispose.bind(this));

    this.updateGraph();
  }

  /**
   * Creates the angle dropdown editor.
   *
   * @returns The newly created slider.
   */
  private dropdownCreate(): SVGSVGElement {
    const svg = dom.createSvgElement(Svg.SVG, {
      'xmlns': dom.SVG_NS,
      'xmlns:html': dom.HTML_NS,
      'xmlns:xlink': dom.XLINK_NS,
      'version': '1.1',
      'height': FieldAngle.HALF * 2 + 'px',
      'width': FieldAngle.HALF * 2 + 'px',
      'style': 'touch-action: none',
    });
    const circle = dom.createSvgElement(
      Svg.CIRCLE,
      {
        'cx': FieldAngle.HALF,
        'cy': FieldAngle.HALF,
        'r': FieldAngle.RADIUS,
        'class': 'blocklyAngleCircle',
      },
      svg,
    );
    this.gauge = dom.createSvgElement(
      Svg.PATH,
      {'class': 'blocklyAngleGauge'},
      svg,
    );
    this.line = dom.createSvgElement(
      Svg.LINE,
      {
        'x1': FieldAngle.HALF,
        'y1': FieldAngle.HALF,
        'class': 'blocklyAngleLine',
      },
      svg,
    );
    // Draw markers around the edge.
    for (let angle = 0; angle < 360; angle += 15) {
      dom.createSvgElement(
        Svg.LINE,
        {
          'x1': FieldAngle.HALF + FieldAngle.RADIUS,
          'y1': FieldAngle.HALF,
          'x2':
            FieldAngle.HALF + FieldAngle.RADIUS - (angle % 45 === 0 ? 10 : 5),
          'y2': FieldAngle.HALF,
          'class': 'blocklyAngleMarks',
          'transform':
            'rotate(' +
            angle +
            ',' +
            FieldAngle.HALF +
            ',' +
            FieldAngle.HALF +
            ')',
        },
        svg,
      );
    }

    // The angle picker is different from other fields in that it updates on
    // mousemove even if it's not in the middle of a drag.  In future we may
    // change this behaviour.
    this.boundEvents.push(
      browserEvents.conditionalBind(svg, 'click', this, this.hide),
    );
    // On touch devices, the picker's value is only updated with a drag. Add
    // a click handler on the drag surface to update the value if the surface
    // is clicked.
    this.boundEvents.push(
      browserEvents.conditionalBind(
        circle,
        'pointerdown',
        this,
        this.onMouseMove_,
        true,
      ),
    );
    this.boundEvents.push(
      browserEvents.conditionalBind(
        circle,
        'pointermove',
        this,
        this.onMouseMove_,
        true,
      ),
    );
    return svg;
  }

  /** Disposes of events and DOM-references belonging to the angle editor. */
  private dropdownDispose() {
    for (const event of this.boundEvents) {
      browserEvents.unbind(event);
    }
    this.boundEvents.length = 0;
    this.gauge = null;
    this.line = null;
  }

  /** Hide the editor. */
  private hide() {
    dropDownDiv.hideIfOwner(this);
    WidgetDiv.hide();
  }

  /**
   * Set the angle to match the mouse's position.
   *
   * @param e Mouse move event.
   */
  protected onMouseMove_(e: PointerEvent) {
    // Calculate angle.
    const bBox = this.gauge!.ownerSVGElement!.getBoundingClientRect();
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
    if (this.clockwise) {
      angle = this.offset + 360 - angle;
    } else {
      angle = 360 - (this.offset - angle);
    }

    this.displayMouseOrKeyboardValue(angle);
  }

  /**
   * Handles and displays values that are input via mouse or arrow key input.
   * These values need to be rounded and wrapped before being displayed so
   * that the text input's value is appropriate.
   *
   * @param angle New angle.
   */
  private displayMouseOrKeyboardValue(angle: number) {
    if (this.round) {
      angle = Math.round(angle / this.round) * this.round;
    }
    angle = this.wrapValue(angle);
    if (angle !== this.value_) {
      // Intermediate value changes from user input are not confirmed until the
      // user closes the editor, and may be numerous. Inhibit reporting these as
      // normal block change events, and instead report them as special
      // intermediate changes that do not get recorded in undo history.
      const oldValue = this.value_;
      this.setEditorValue_(angle, false);
      if (
        this.sourceBlock_ &&
        eventUtils.isEnabled() &&
        this.value_ !== oldValue
      ) {
        eventUtils.fire(
          new (eventUtils.get(eventUtils.BLOCK_FIELD_INTERMEDIATE_CHANGE))(
            this.sourceBlock_,
            this.name || null,
            oldValue,
            this.value_,
          ),
        );
      }
    }
  }

  /** Redraw the graph with the current angle. */
  private updateGraph() {
    if (!this.gauge || !this.line) {
      return;
    }
    // Always display the input (i.e. getText) even if it is invalid.
    let angleDegrees = Number(this.getText()) + this.offset;
    angleDegrees %= 360;
    let angleRadians = math.toRadians(angleDegrees);
    const path = ['M ', FieldAngle.HALF, ',', FieldAngle.HALF];
    let x2 = FieldAngle.HALF;
    let y2 = FieldAngle.HALF;
    if (!isNaN(angleRadians)) {
      const clockwiseFlag = Number(this.clockwise);
      const angle1 = math.toRadians(this.offset);
      const x1 = Math.cos(angle1) * FieldAngle.RADIUS;
      const y1 = Math.sin(angle1) * -FieldAngle.RADIUS;
      if (clockwiseFlag) {
        angleRadians = 2 * angle1 - angleRadians;
      }
      x2 += Math.cos(angleRadians) * FieldAngle.RADIUS;
      y2 -= Math.sin(angleRadians) * FieldAngle.RADIUS;
      // Don't ask how the flag calculations work.  They just do.
      let largeFlag = Math.abs(
        Math.floor((angleRadians - angle1) / Math.PI) % 2,
      );
      if (clockwiseFlag) {
        largeFlag = 1 - largeFlag;
      }
      path.push(
        ' l ',
        x1,
        ',',
        y1,
        ' A ',
        FieldAngle.RADIUS,
        ',',
        FieldAngle.RADIUS,
        ' 0 ',
        largeFlag,
        ' ',
        clockwiseFlag,
        ' ',
        x2,
        ',',
        y2,
        ' z',
      );
    }
    this.gauge.setAttribute('d', path.join(''));
    this.line.setAttribute('x2', `${x2}`);
    this.line.setAttribute('y2', `${y2}`);
  }

  /**
   * Handle key down to the editor.
   *
   * @param e Keyboard event.
   */
  protected override onHtmlInputKeyDown_(e: KeyboardEvent) {
    super.onHtmlInputKeyDown_(e);
    const block = this.getSourceBlock();
    if (!block) {
      throw new UnattachedFieldError();
    }

    let multiplier = 0;
    switch (e.key) {
      case 'ArrowLeft':
        // decrement (increment in RTL)
        multiplier = block.RTL ? 1 : -1;
        break;
      case 'ArrowRight':
        // increment (decrement in RTL)
        multiplier = block.RTL ? -1 : 1;
        break;
      case 'ArrowDown':
        // decrement
        multiplier = -1;
        break;
      case 'ArrowUp':
        // increment
        multiplier = 1;
        break;
    }
    if (multiplier) {
      const value = this.getValue() as number;
      this.displayMouseOrKeyboardValue(value + multiplier * this.round);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  /**
   * Ensure that the input value is a valid angle.
   *
   * @param newValue The input value.
   * @returns A valid angle, or null if invalid.
   */
  protected override doClassValidation_(newValue?: any): number | null {
    const value = Number(newValue);
    if (isNaN(value) || !isFinite(value)) {
      return null;
    }
    return this.wrapValue(value);
  }

  /**
   * Wraps the value so that it is in the range (-360 + wrap, wrap).
   *
   * @param value The value to wrap.
   * @returns The wrapped value.
   */
  private wrapValue(value: number): number {
    value %= 360;
    if (value < 0) {
      value += 360;
    }
    if (value > this.wrap) {
      value -= 360;
    }
    return value;
  }

  /**
   * Construct a FieldAngle from a JSON arg object.
   *
   * @param options A JSON object with options (angle).
   * @returns The new field instance.
   * @nocollapse
   * @internal
   */
  static fromJson(options: FieldAngleFromJsonConfig): FieldAngle {
    // `this` might be a subclass of FieldAngle if that class doesn't override
    // the static fromJson method.
    return new this(options.angle, undefined, options);
  }
}

fieldRegistry.register('field_angle', FieldAngle);

FieldAngle.prototype.DEFAULT_VALUE = 0;

/**
 * CSS for angle field.
 */
Css.register(`
.blocklyAngleCircle {
  stroke: #444;
  stroke-width: 1;
  fill: #ddd;
  fill-opacity: 0.8;
}

.blocklyAngleMarks {
  stroke: #444;
  stroke-width: 1;
}

.blocklyAngleGauge {
  fill: #f88;
  fill-opacity: 0.8;
  pointer-events: none;
}

.blocklyAngleLine {
  stroke: #f00;
  stroke-width: 2;
  stroke-linecap: round;
  pointer-events: none;
}
`);

/**
 * The two main modes of the angle field.
 * Compass specifies:
 *   - clockwise: true
 *   - offset: 90
 *   - wrap: 0
 *   - round: 15
 *
 * Protractor specifies:
 *   - clockwise: false
 *   - offset: 0
 *   - wrap: 0
 *   - round: 15
 */
export enum Mode {
  COMPASS = 'compass',
  PROTRACTOR = 'protractor',
}

/**
 * Extra configuration options for the angle field.
 */
export interface FieldAngleConfig extends FieldInputConfig {
  mode?: Mode;
  clockwise?: boolean;
  offset?: number;
  wrap?: number;
  round?: number;
}

/**
 * fromJson configuration options for the angle field.
 */
export interface FieldAngleFromJsonConfig extends FieldAngleConfig {
  angle?: number;
}

/**
 * A function that is called to validate changes to the field's value before
 * they are set.
 *
 * @see {@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/validators#return_values}
 * @param newValue The value to be validated.
 * @returns One of three instructions for setting the new value: `T`, `null`,
 * or `undefined`.
 *
 * - `T` to set this function's returned value instead of `newValue`.
 *
 * - `null` to invoke `doValueInvalid_` and not set a value.
 *
 * - `undefined` to set `newValue` as is.
 */
export type FieldAngleValidator = FieldInputValidator<number>;
