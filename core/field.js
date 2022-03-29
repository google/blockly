/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be FieldTextInput, FieldDropdown, etc.
 */
'use strict';

/**
 * Field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be FieldTextInput, FieldDropdown, etc.
 * @class
 */
goog.module('Blockly.Field');

const Tooltip = goog.require('Blockly.Tooltip');
const WidgetDiv = goog.require('Blockly.WidgetDiv');
const Xml = goog.require('Blockly.Xml');
const browserEvents = goog.require('Blockly.browserEvents');
const dom = goog.require('Blockly.utils.dom');
const dropDownDiv = goog.require('Blockly.dropDownDiv');
const eventUtils = goog.require('Blockly.Events.utils');
const parsing = goog.require('Blockly.utils.parsing');
const style = goog.require('Blockly.utils.style');
const userAgent = goog.require('Blockly.utils.userAgent');
const utilsXml = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IASTNodeLocationSvg} = goog.require('Blockly.IASTNodeLocationSvg');
/* eslint-disable-next-line no-unused-vars */
const {IASTNodeLocationWithBlock} = goog.require('Blockly.IASTNodeLocationWithBlock');
/* eslint-disable-next-line no-unused-vars */
const {IKeyboardAccessible} = goog.require('Blockly.IKeyboardAccessible');
/* eslint-disable-next-line no-unused-vars */
const {IRegistrable} = goog.require('Blockly.IRegistrable');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {MarkerManager} = goog.require('Blockly.MarkerManager');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Sentinel} = goog.require('Blockly.utils.Sentinel');
/* eslint-disable-next-line no-unused-vars */
const {ShortcutRegistry} = goog.requireType('Blockly.ShortcutRegistry');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');
/** @suppress {extraRequire} */
goog.require('Blockly.Gesture');


/**
 * Abstract class for an editable field.
 * @implements {IASTNodeLocationSvg}
 * @implements {IASTNodeLocationWithBlock}
 * @implements {IKeyboardAccessible}
 * @implements {IRegistrable}
 * @abstract
 * @alias Blockly.Field
 */
class Field {
  /**
   * @param {*} value The initial value of the field.
   *     Also accepts Field.SKIP_SETUP if you wish to skip setup (only used by
   *     subclasses that want to handle configuration and setting the field
   *     value after their own constructors have run).
   * @param {?Function=} opt_validator  A function that is called to validate
   *    changes to the field's value. Takes in a value & returns a validated
   *    value, or null to abort the change.
   * @param {Object=} opt_config A map of options used to configure the field.
   *    Refer to the individual field's documentation for a list of properties
   *    this parameter supports.
   */
  constructor(value, opt_validator, opt_config) {
    /**
     * Name of field.  Unique within each block.
     * Static labels are usually unnamed.
     * @type {string|undefined}
     */
    this.name = undefined;

    /**
     * A generic value possessed by the field.
     * Should generally be non-null, only null when the field is created.
     * @type {*}
     * @protected
     */
    this.value_ =
        /** @type {typeof Field} */ (new.target).prototype.DEFAULT_VALUE;

    /**
     * Validation function called when user edits an editable field.
     * @type {Function}
     * @protected
     */
    this.validator_ = null;

    /**
     * Used to cache the field's tooltip value if setTooltip is called when the
     * field is not yet initialized. Is *not* guaranteed to be accurate.
     * @type {?Tooltip.TipInfo}
     * @private
     */
    this.tooltip_ = null;

    /**
     * The size of the area rendered by the field.
     * @type {!Size}
     * @protected
     */
    this.size_ = new Size(0, 0);

    /**
     * Holds the cursors svg element when the cursor is attached to the field.
     * This is null if there is no cursor on the field.
     * @type {SVGElement}
     * @private
     */
    this.cursorSvg_ = null;

    /**
     * Holds the markers svg element when the marker is attached to the field.
     * This is null if there is no marker on the field.
     * @type {SVGElement}
     * @private
     */
    this.markerSvg_ = null;

    /**
     * The rendered field's SVG group element.
     * @type {SVGGElement}
     * @protected
     */
    this.fieldGroup_ = null;

    /**
     * The rendered field's SVG border element.
     * @type {SVGRectElement}
     * @protected
     */
    this.borderRect_ = null;

    /**
     * The rendered field's SVG text element.
     * @type {SVGTextElement}
     * @protected
     */
    this.textElement_ = null;

    /**
     * The rendered field's text content element.
     * @type {Text}
     * @protected
     */
    this.textContent_ = null;

    /**
     * Mouse down event listener data.
     * @type {?browserEvents.Data}
     * @private
     */
    this.mouseDownWrapper_ = null;

    /**
     * Constants associated with the source block's renderer.
     * @type {ConstantProvider}
     * @protected
     */
    this.constants_ = null;

    /**
     * Has this field been disposed of?
     * @type {boolean}
     * @package
     */
    this.disposed = false;

    /**
     * Maximum characters of text to display before adding an ellipsis.
     * @type {number}
     */
    this.maxDisplayLength = 50;

    /**
     * Block this field is attached to.  Starts as null, then set in init.
     * @type {Block}
     * @protected
     */
    this.sourceBlock_ = null;

    /**
     * Does this block need to be re-rendered?
     * @type {boolean}
     * @protected
     */
    this.isDirty_ = true;

    /**
     * Is the field visible, or hidden due to the block being collapsed?
     * @type {boolean}
     * @protected
     */
    this.visible_ = true;

    /**
     * Can the field value be changed using the editor on an editable block?
     * @type {boolean}
     * @protected
     */
    this.enabled_ = true;

    /**
     * The element the click handler is bound to.
     * @type {Element}
     * @protected
     */
    this.clickTarget_ = null;

    /**
     * The prefix field.
     * @type {?string}
     * @package
     */
    this.prefixField = null;

    /**
     * The suffix field.
     * @type {?string}
     * @package
     */
    this.suffixField = null;

    /**
     * Editable fields usually show some sort of UI indicating they are
     * editable. They will also be saved by the serializer.
     * @type {boolean}
     */
    this.EDITABLE = true;

    /**
     * Serializable fields are saved by the serializer, non-serializable fields
     * are not. Editable fields should also be serializable. This is not the
     * case by default so that SERIALIZABLE is backwards compatible.
     * @type {boolean}
     */
    this.SERIALIZABLE = false;

    /**
     * Mouse cursor style when over the hotspot that initiates the editor.
     * @type {string}
     */
    this.CURSOR = '';

    if (value === Field.SKIP_SETUP) return;
    if (opt_config) this.configure_(opt_config);
    this.setValue(value);
    if (opt_validator) this.setValidator(opt_validator);
  }

  /**
   * Process the configuration map passed to the field.
   * @param {!Object} config A map of options used to configure the field. See
   *    the individual field's documentation for a list of properties this
   *    parameter supports.
   * @protected
   */
  configure_(config) {
    let tooltip = config['tooltip'];
    if (typeof tooltip === 'string') {
      tooltip = parsing.replaceMessageReferences(config['tooltip']);
    }
    tooltip && this.setTooltip(tooltip);

    // TODO (#2884): Possibly add CSS class config option.
    // TODO (#2885): Possibly add cursor config option.
  }

  /**
   * Attach this field to a block.
   * @param {!Block} block The block containing this field.
   */
  setSourceBlock(block) {
    if (this.sourceBlock_) {
      throw Error('Field already bound to a block');
    }
    this.sourceBlock_ = block;
  }

  /**
   * Get the renderer constant provider.
   * @return {?ConstantProvider} The renderer constant
   *     provider.
   */
  getConstants() {
    if (!this.constants_ && this.sourceBlock_ && this.sourceBlock_.workspace &&
        this.sourceBlock_.workspace.rendered) {
      this.constants_ =
          /** @type {!WorkspaceSvg} */ (this.sourceBlock_.workspace)
              .getRenderer()
              .getConstants();
    }
    return this.constants_;
  }

  /**
   * Get the block this field is attached to.
   * @return {Block} The block containing this field.
   */
  getSourceBlock() {
    return this.sourceBlock_;
  }

  /**
   * Initialize everything to render this field. Override
   * methods initModel and initView rather than this method.
   * @package
   * @final
   */
  init() {
    if (this.fieldGroup_) {
      // Field has already been initialized once.
      return;
    }
    this.fieldGroup_ = dom.createSvgElement(Svg.G, {}, null);
    if (!this.isVisible()) {
      this.fieldGroup_.style.display = 'none';
    }
    const sourceBlockSvg = /** @type {!BlockSvg} **/ (this.sourceBlock_);
    sourceBlockSvg.getSvgRoot().appendChild(this.fieldGroup_);
    this.initView();
    this.updateEditable();
    this.setTooltip(this.tooltip_);
    this.bindEvents_();
    this.initModel();
  }

  /**
   * Create the block UI for this field.
   * @package
   */
  initView() {
    this.createBorderRect_();
    this.createTextElement_();
  }

  /**
   * Initializes the model of the field after it has been installed on a block.
   * No-op by default.
   * @package
   */
  initModel() {}

  /**
   * Create a field border rect element. Not to be overridden by subclasses.
   * Instead modify the result of the function inside initView, or create a
   * separate function to call.
   * @protected
   */
  createBorderRect_() {
    this.borderRect_ = dom.createSvgElement(
        Svg.RECT, {
          'rx': this.getConstants().FIELD_BORDER_RECT_RADIUS,
          'ry': this.getConstants().FIELD_BORDER_RECT_RADIUS,
          'x': 0,
          'y': 0,
          'height': this.size_.height,
          'width': this.size_.width,
          'class': 'blocklyFieldRect',
        },
        this.fieldGroup_);
  }

  /**
   * Create a field text element. Not to be overridden by subclasses. Instead
   * modify the result of the function inside initView, or create a separate
   * function to call.
   * @protected
   */
  createTextElement_() {
    this.textElement_ = dom.createSvgElement(
        Svg.TEXT, {
          'class': 'blocklyText',
        },
        this.fieldGroup_);
    if (this.getConstants().FIELD_TEXT_BASELINE_CENTER) {
      this.textElement_.setAttribute('dominant-baseline', 'central');
    }
    this.textContent_ = document.createTextNode('');
    this.textElement_.appendChild(this.textContent_);
  }

  /**
   * Bind events to the field. Can be overridden by subclasses if they need to
   * do custom input handling.
   * @protected
   */
  bindEvents_() {
    Tooltip.bindMouseEvents(this.getClickTarget_());
    this.mouseDownWrapper_ = browserEvents.conditionalBind(
        this.getClickTarget_(), 'mousedown', this, this.onMouseDown_);
  }

  /**
   * Sets the field's value based on the given XML element. Should only be
   * called by Blockly.Xml.
   * @param {!Element} fieldElement The element containing info about the
   *    field's state.
   * @package
   */
  fromXml(fieldElement) {
    this.setValue(fieldElement.textContent);
  }

  /**
   * Serializes this field's value to XML. Should only be called by Blockly.Xml.
   * @param {!Element} fieldElement The element to populate with info about the
   *    field's state.
   * @return {!Element} The element containing info about the field's state.
   * @package
   */
  toXml(fieldElement) {
    fieldElement.textContent = this.getValue();
    return fieldElement;
  }

  /**
   * Saves this fields value as something which can be serialized to JSON.
   * Should only be called by the serialization system.
   * @param {boolean=} _doFullSerialization If true, this signals to the field
   *     that if it normally just saves a reference to some state (eg variable
   *     fields) it should instead serialize the full state of the thing being
   *     referenced.
   * @return {*} JSON serializable state.
   * @package
   */
  saveState(_doFullSerialization) {
    const legacyState = this.saveLegacyState(Field);
    if (legacyState !== null) {
      return legacyState;
    }
    return this.getValue();
  }

  /**
   * Sets the field's state based on the given state value. Should only be
   * called by the serialization system.
   * @param {*} state The state we want to apply to the field.
   * @package
   */
  loadState(state) {
    if (this.loadLegacyState(Field, state)) {
      return;
    }
    this.setValue(state);
  }

  /**
   * Returns a stringified version of the XML state, if it should be used.
   * Otherwise this returns null, to signal the field should use its own
   * serialization.
   * @param {*} callingClass The class calling this method.
   *     Used to see if `this` has overridden any relevant hooks.
   * @return {?string} The stringified version of the XML state, or null.
   * @protected
   */
  saveLegacyState(callingClass) {
    if (callingClass.prototype.saveState === this.saveState &&
        callingClass.prototype.toXml !== this.toXml) {
      const elem = utilsXml.createElement('field');
      elem.setAttribute('name', this.name || '');
      const text = Xml.domToText(this.toXml(elem));
      return text.replace(
          ' xmlns="https://developers.google.com/blockly/xml"', '');
    }
    // Either they called this on purpose from their saveState, or they have
    // no implementations of either hook. Just do our thing.
    return null;
  }

  /**
   * Loads the given state using either the old XML hoooks, if they should be
   * used. Returns true to indicate loading has been handled, false otherwise.
   * @param {*} callingClass The class calling this method.
   *     Used to see if `this` has overridden any relevant hooks.
   * @param {*} state The state to apply to the field.
   * @return {boolean} Whether the state was applied or not.
   */
  loadLegacyState(callingClass, state) {
    if (callingClass.prototype.loadState === this.loadState &&
        callingClass.prototype.fromXml !== this.fromXml) {
      this.fromXml(Xml.textToDom(/** @type {string} */ (state)));
      return true;
    }
    // Either they called this on purpose from their loadState, or they have
    // no implementations of either hook. Just do our thing.
    return false;
  }

  /**
   * Dispose of all DOM objects and events belonging to this editable field.
   * @package
   */
  dispose() {
    dropDownDiv.hideIfOwner(this);
    WidgetDiv.hideIfOwner(this);
    Tooltip.unbindMouseEvents(this.getClickTarget_());

    if (this.mouseDownWrapper_) {
      browserEvents.unbind(this.mouseDownWrapper_);
    }

    dom.removeNode(this.fieldGroup_);

    this.disposed = true;
  }

  /**
   * Add or remove the UI indicating if this field is editable or not.
   */
  updateEditable() {
    const group = this.fieldGroup_;
    if (!this.EDITABLE || !group) {
      return;
    }
    if (this.enabled_ && this.sourceBlock_.isEditable()) {
      dom.addClass(group, 'blocklyEditableText');
      dom.removeClass(group, 'blocklyNonEditableText');
      group.style.cursor = this.CURSOR;
    } else {
      dom.addClass(group, 'blocklyNonEditableText');
      dom.removeClass(group, 'blocklyEditableText');
      group.style.cursor = '';
    }
  }

  /**
   * Set whether this field's value can be changed using the editor when the
   *     source block is editable.
   * @param {boolean} enabled True if enabled.
   */
  setEnabled(enabled) {
    this.enabled_ = enabled;
    this.updateEditable();
  }

  /**
   * Check whether this field's value can be changed using the editor when the
   *     source block is editable.
   * @return {boolean} Whether this field is enabled.
   */
  isEnabled() {
    return this.enabled_;
  }

  /**
   * Check whether this field defines the showEditor_ function.
   * @return {boolean} Whether this field is clickable.
   */
  isClickable() {
    return this.enabled_ && !!this.sourceBlock_ &&
        this.sourceBlock_.isEditable() &&
        this.showEditor_ !== Field.prototype.showEditor_;
  }

  /**
   * Check whether this field is currently editable.  Some fields are never
   * EDITABLE (e.g. text labels). Other fields may be EDITABLE but may exist on
   * non-editable blocks or be currently disabled.
   * @return {boolean} Whether this field is currently enabled, editable and on
   * an editable block.
   */
  isCurrentlyEditable() {
    return this.enabled_ && this.EDITABLE && !!this.sourceBlock_ &&
        this.sourceBlock_.isEditable();
  }

  /**
   * Check whether this field should be serialized by the XML renderer.
   * Handles the logic for backwards compatibility and incongruous states.
   * @return {boolean} Whether this field should be serialized or not.
   */
  isSerializable() {
    let isSerializable = false;
    if (this.name) {
      if (this.SERIALIZABLE) {
        isSerializable = true;
      } else if (this.EDITABLE) {
        console.warn(
            'Detected an editable field that was not serializable.' +
            ' Please define SERIALIZABLE property as true on all editable custom' +
            ' fields. Proceeding with serialization.');
        isSerializable = true;
      }
    }
    return isSerializable;
  }

  /**
   * Gets whether this editable field is visible or not.
   * @return {boolean} True if visible.
   */
  isVisible() {
    return this.visible_;
  }

  /**
   * Sets whether this editable field is visible or not. Should only be called
   * by input.setVisible.
   * @param {boolean} visible True if visible.
   * @package
   */
  setVisible(visible) {
    if (this.visible_ === visible) {
      return;
    }
    this.visible_ = visible;
    const root = this.getSvgRoot();
    if (root) {
      root.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Sets a new validation function for editable fields, or clears a previously
   * set validator.
   *
   * The validator function takes in the new field value, and returns
   * validated value. The validated value could be the input value, a modified
   * version of the input value, or null to abort the change.
   *
   * If the function does not return anything (or returns undefined) the new
   * value is accepted as valid. This is to allow for fields using the
   * validated function as a field-level change event notification.
   *
   * @param {Function} handler The validator function
   *     or null to clear a previous validator.
   */
  setValidator(handler) {
    this.validator_ = handler;
  }

  /**
   * Gets the validation function for editable fields, or null if not set.
   * @return {?Function} Validation function, or null.
   */
  getValidator() {
    return this.validator_;
  }

  /**
   * Gets the group element for this editable field.
   * Used for measuring the size and for positioning.
   * @return {!SVGGElement} The group element.
   */
  getSvgRoot() {
    return /** @type {!SVGGElement} */ (this.fieldGroup_);
  }

  /**
   * Updates the field to match the colour/style of the block. Should only be
   * called by BlockSvg.applyColour().
   * @package
   */
  applyColour() {
    // Non-abstract sub-classes may wish to implement this. See FieldDropdown.
  }

  /**
   * Used by getSize() to move/resize any DOM elements, and get the new size.
   *
   * All rendering that has an effect on the size/shape of the block should be
   * done here, and should be triggered by getSize().
   * @protected
   */
  render_() {
    if (this.textContent_) {
      this.textContent_.nodeValue = this.getDisplayText_();
    }
    this.updateSize_();
  }

  /**
   * Calls showEditor_ when the field is clicked if the field is clickable.
   * Do not override.
   * @param {Event=} opt_e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @package
   * @final
   */
  showEditor(opt_e) {
    if (this.isClickable()) {
      this.showEditor_(opt_e);
    }
  }

  /**
   * A developer hook to create an editor for the field. This is no-op by
   * default, and must be overriden to create an editor.
   * @param {Event=} _e Optional mouse event that triggered the field to
   *     open, or undefined if triggered programmatically.
   * @return {void}
   * @protected
   */
  showEditor_(_e) {
    // NOP
  }

  /**
   * Updates the size of the field based on the text.
   * @param {number=} opt_margin margin to use when positioning the text
   *     element.
   * @protected
   */
  updateSize_(opt_margin) {
    const constants = this.getConstants();
    const xOffset = opt_margin !== undefined ?
        opt_margin :
        (this.borderRect_ ? this.getConstants().FIELD_BORDER_RECT_X_PADDING :
                            0);
    let totalWidth = xOffset * 2;
    let totalHeight = constants.FIELD_TEXT_HEIGHT;

    let contentWidth = 0;
    if (this.textElement_) {
      contentWidth = dom.getFastTextWidth(
          this.textElement_, constants.FIELD_TEXT_FONTSIZE,
          constants.FIELD_TEXT_FONTWEIGHT, constants.FIELD_TEXT_FONTFAMILY);
      totalWidth += contentWidth;
    }
    if (this.borderRect_) {
      totalHeight = Math.max(totalHeight, constants.FIELD_BORDER_RECT_HEIGHT);
    }

    this.size_.height = totalHeight;
    this.size_.width = totalWidth;

    this.positionTextElement_(xOffset, contentWidth);
    this.positionBorderRect_();
  }

  /**
   * Position a field's text element after a size change.  This handles both LTR
   * and RTL positioning.
   * @param {number} xOffset x offset to use when positioning the text element.
   * @param {number} contentWidth The content width.
   * @protected
   */
  positionTextElement_(xOffset, contentWidth) {
    if (!this.textElement_) {
      return;
    }
    const constants = this.getConstants();
    const halfHeight = this.size_.height / 2;

    this.textElement_.setAttribute(
        'x',
        this.sourceBlock_.RTL ? this.size_.width - contentWidth - xOffset :
                                xOffset);
    this.textElement_.setAttribute(
        'y',
        constants.FIELD_TEXT_BASELINE_CENTER ?
            halfHeight :
            halfHeight - constants.FIELD_TEXT_HEIGHT / 2 +
                constants.FIELD_TEXT_BASELINE);
  }

  /**
   * Position a field's border rect after a size change.
   * @protected
   */
  positionBorderRect_() {
    if (!this.borderRect_) {
      return;
    }
    this.borderRect_.setAttribute('width', this.size_.width);
    this.borderRect_.setAttribute('height', this.size_.height);
    this.borderRect_.setAttribute(
        'rx', this.getConstants().FIELD_BORDER_RECT_RADIUS);
    this.borderRect_.setAttribute(
        'ry', this.getConstants().FIELD_BORDER_RECT_RADIUS);
  }

  /**
   * Returns the height and width of the field.
   *
   * This should *in general* be the only place render_ gets called from.
   * @return {!Size} Height and width.
   */
  getSize() {
    if (!this.isVisible()) {
      return new Size(0, 0);
    }

    if (this.isDirty_) {
      this.render_();
      this.isDirty_ = false;
    } else if (this.visible_ && this.size_.width === 0) {
      // If the field is not visible the width will be 0 as well, one of the
      // problems with the old system.
      console.warn(
          'Deprecated use of setting size_.width to 0 to rerender a' +
          ' field. Set field.isDirty_ to true instead.');
      this.render_();
    }
    return this.size_;
  }

  /**
   * Returns the bounding box of the rendered field, accounting for workspace
   * scaling.
   * @return {!Rect} An object with top, bottom, left, and right in
   *     pixels relative to the top left corner of the page (window
   * coordinates).
   * @package
   */
  getScaledBBox() {
    let scaledWidth;
    let scaledHeight;
    let xy;
    if (!this.borderRect_) {
      // Browsers are inconsistent in what they return for a bounding box.
      // - Webkit / Blink: fill-box / object bounding box
      // - Gecko / Triden / EdgeHTML: stroke-box
      const bBox = this.sourceBlock_.getHeightWidth();
      const scale =
          /** @type {!WorkspaceSvg} */ (this.sourceBlock_.workspace).scale;
      xy = this.getAbsoluteXY_();
      scaledWidth = bBox.width * scale;
      scaledHeight = bBox.height * scale;

      if (userAgent.GECKO) {
        xy.x += 1.5 * scale;
        xy.y += 1.5 * scale;
        scaledWidth += 1 * scale;
        scaledHeight += 1 * scale;
      } else {
        if (!userAgent.EDGE && !userAgent.IE) {
          xy.x -= 0.5 * scale;
          xy.y -= 0.5 * scale;
        }
        scaledWidth += 1 * scale;
        scaledHeight += 1 * scale;
      }
    } else {
      const bBox = this.borderRect_.getBoundingClientRect();
      xy = style.getPageOffset(this.borderRect_);
      scaledWidth = bBox.width;
      scaledHeight = bBox.height;
    }
    return new Rect(xy.y, xy.y + scaledHeight, xy.x, xy.x + scaledWidth);
  }

  /**
   * Get the text from this field to display on the block. May differ from
   * ``getText`` due to ellipsis, and other formatting.
   * @return {string} Text to display.
   * @protected
   */
  getDisplayText_() {
    let text = this.getText();
    if (!text) {
      // Prevent the field from disappearing if empty.
      return Field.NBSP;
    }
    if (text.length > this.maxDisplayLength) {
      // Truncate displayed string and add an ellipsis ('...').
      text = text.substring(0, this.maxDisplayLength - 2) + '\u2026';
    }
    // Replace whitespace with non-breaking spaces so the text doesn't collapse.
    text = text.replace(/\s/g, Field.NBSP);
    if (this.sourceBlock_ && this.sourceBlock_.RTL) {
      // The SVG is LTR, force text to be RTL.
      text += '\u200F';
    }
    return text;
  }

  /**
   * Get the text from this field.
   * Override getText_ to provide a different behavior than simply casting the
   * value to a string.
   * @return {string} Current text.
   * @final
   */
  getText() {
    // this.getText_ was intended so that devs don't have to remember to call
    // super when overriding how the text of the field is generated. (#2910)
    const text = this.getText_();
    if (text !== null) return String(text);
    return String(this.getValue());
  }

  /**
   * A developer hook to override the returned text of this field.
   * Override if the text representation of the value of this field
   * is not just a string cast of its value.
   * Return null to resort to a string cast.
   * @return {?string} Current text or null.
   * @protected
   */
  getText_() {
    return null;
  }

  /**
   * Force a rerender of the block that this field is installed on, which will
   * rerender this field and adjust for any sizing changes.
   * Other fields on the same block will not rerender, because their sizes have
   * already been recorded.
   * @package
   */
  markDirty() {
    this.isDirty_ = true;
    this.constants_ = null;
  }

  /**
   * Force a rerender of the block that this field is installed on, which will
   * rerender this field and adjust for any sizing changes.
   * Other fields on the same block will not rerender, because their sizes have
   * already been recorded.
   * @package
   */
  forceRerender() {
    this.isDirty_ = true;
    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
      this.sourceBlock_.render();
      this.sourceBlock_.bumpNeighbours();
      this.updateMarkers_();
    }
  }

  /**
   * Used to change the value of the field. Handles validation and events.
   * Subclasses should override doClassValidation_ and doValueUpdate_ rather
   * than this method.
   * @param {*} newValue New value.
   * @final
   */
  setValue(newValue) {
    const doLogging = false;
    if (newValue === null) {
      doLogging && console.log('null, return');
      // Not a valid value to check.
      return;
    }

    let validatedValue = this.doClassValidation_(newValue);
    // Class validators might accidentally forget to return, we'll ignore that.
    newValue = this.processValidation_(newValue, validatedValue);
    if (newValue instanceof Error) {
      doLogging && console.log('invalid class validation, return');
      return;
    }

    const localValidator = this.getValidator();
    if (localValidator) {
      validatedValue = localValidator.call(this, newValue);
      // Local validators might accidentally forget to return, we'll ignore
      // that.
      newValue = this.processValidation_(newValue, validatedValue);
      if (newValue instanceof Error) {
        doLogging && console.log('invalid local validation, return');
        return;
      }
    }
    const source = this.sourceBlock_;
    if (source && source.disposed) {
      doLogging && console.log('source disposed, return');
      return;
    }
    const oldValue = this.getValue();
    if (oldValue === newValue) {
      doLogging && console.log('same, doValueUpdate_, return');
      this.doValueUpdate_(newValue);
      return;
    }

    this.doValueUpdate_(newValue);
    if (source && eventUtils.isEnabled()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
          source, 'field', this.name || null, oldValue, newValue));
    }
    if (this.isDirty_) {
      this.forceRerender();
    }
    doLogging && console.log(this.value_);
  }

  /**
   * Process the result of validation.
   * @param {*} newValue New value.
   * @param {*} validatedValue Validated value.
   * @return {*} New value, or an Error object.
   * @private
   */
  processValidation_(newValue, validatedValue) {
    if (validatedValue === null) {
      this.doValueInvalid_(newValue);
      if (this.isDirty_) {
        this.forceRerender();
      }
      return Error();
    }
    if (validatedValue !== undefined) {
      newValue = validatedValue;
    }
    return newValue;
  }

  /**
   * Get the current value of the field.
   * @return {*} Current value.
   */
  getValue() {
    return this.value_;
  }

  /**
   * Used to validate a value. Returns input by default. Can be overridden by
   * subclasses, see FieldDropdown.
   * @param {*=} opt_newValue The value to be validated.
   * @return {*} The validated value, same as input by default.
   * @protected
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    return opt_newValue;
  }

  /**
   * Used to update the value of a field. Can be overridden by subclasses to do
   * custom storage of values/updating of external things.
   * @param {*} newValue The value to be saved.
   * @protected
   */
  doValueUpdate_(newValue) {
    this.value_ = newValue;
    this.isDirty_ = true;
  }

  /**
   * Used to notify the field an invalid value was input. Can be overridden by
   * subclasses, see FieldTextInput.
   * No-op by default.
   * @param {*} _invalidValue The input value that was determined to be invalid.
   * @protected
   */
  doValueInvalid_(_invalidValue) {
    // NOP
  }

  /**
   * Handle a mouse down event on a field.
   * @param {!Event} e Mouse down event.
   * @protected
   */
  onMouseDown_(e) {
    if (!this.sourceBlock_ || !this.sourceBlock_.workspace) {
      return;
    }
    const gesture =
        /** @type {!WorkspaceSvg} */ (this.sourceBlock_.workspace)
            .getGesture(e);
    if (gesture) {
      gesture.setStartField(this);
    }
  }

  /**
   * Sets the tooltip for this field.
   * @param {?Tooltip.TipInfo} newTip The
   *     text for the tooltip, a function that returns the text for the tooltip,
   * a parent object whose tooltip will be used, or null to display the tooltip
   *     of the parent block. To not display a tooltip pass the empty string.
   */
  setTooltip(newTip) {
    if (!newTip && newTip !== '') {  // If null or undefined.
      newTip = this.sourceBlock_;
    }
    const clickTarget = this.getClickTarget_();
    if (clickTarget) {
      clickTarget.tooltip = newTip;
    } else {
      // Field has not been initialized yet.
      this.tooltip_ = newTip;
    }
  }

  /**
   * Returns the tooltip text for this field.
   * @return {string} The tooltip text for this field.
   */
  getTooltip() {
    const clickTarget = this.getClickTarget_();
    if (clickTarget) {
      return Tooltip.getTooltipOfObject(clickTarget);
    }
    // Field has not been initialized yet. Return stashed this.tooltip_ value.
    return Tooltip.getTooltipOfObject({tooltip: this.tooltip_});
  }

  /**
   * The element to bind the click handler to. If not set explicitly, defaults
   * to the SVG root of the field. When this element is
   * clicked on an editable field, the editor will open.
   * @return {!Element} Element to bind click handler to.
   * @protected
   */
  getClickTarget_() {
    return this.clickTarget_ || this.getSvgRoot();
  }

  /**
   * Return the absolute coordinates of the top-left corner of this field.
   * The origin (0,0) is the top-left corner of the page body.
   * @return {!Coordinate} Object with .x and .y properties.
   * @protected
   */
  getAbsoluteXY_() {
    return style.getPageOffset(
        /** @type {!SVGRectElement} */ (this.getClickTarget_()));
  }

  /**
   * Whether this field references any Blockly variables.  If true it may need
   * to be handled differently during serialization and deserialization.
   * Subclasses may override this.
   * @return {boolean} True if this field has any variable references.
   * @package
   */
  referencesVariables() {
    return false;
  }

  /**
   * Refresh the variable name referenced by this field if this field references
   * variables.
   * @package
   */
  refreshVariableName() {
    // NOP
  }

  /**
   * Search through the list of inputs and their fields in order to find the
   * parent input of a field.
   * @return {Input} The input that the field belongs to.
   * @package
   */
  getParentInput() {
    let parentInput = null;
    const block = this.sourceBlock_;
    const inputs = block.inputList;

    for (let idx = 0; idx < block.inputList.length; idx++) {
      const input = inputs[idx];
      const fieldRows = input.fieldRow;
      for (let j = 0; j < fieldRows.length; j++) {
        if (fieldRows[j] === this) {
          parentInput = input;
          break;
        }
      }
    }
    return parentInput;
  }

  /**
   * Returns whether or not we should flip the field in RTL.
   * @return {boolean} True if we should flip in RTL.
   */
  getFlipRtl() {
    return false;
  }

  /**
   * Returns whether or not the field is tab navigable.
   * @return {boolean} True if the field is tab navigable.
   */
  isTabNavigable() {
    return false;
  }

  /**
   * Handles the given keyboard shortcut.
   * @param {!ShortcutRegistry.KeyboardShortcut} _shortcut The shortcut to be
   *     handled.
   * @return {boolean} True if the shortcut has been handled, false otherwise.
   * @public
   */
  onShortcut(_shortcut) {
    return false;
  }

  /**
   * Add the cursor SVG to this fields SVG group.
   * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
   *     field group.
   * @package
   */
  setCursorSvg(cursorSvg) {
    if (!cursorSvg) {
      this.cursorSvg_ = null;
      return;
    }

    this.fieldGroup_.appendChild(cursorSvg);
    this.cursorSvg_ = cursorSvg;
  }

  /**
   * Add the marker SVG to this fields SVG group.
   * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
   *     field group.
   * @package
   */
  setMarkerSvg(markerSvg) {
    if (!markerSvg) {
      this.markerSvg_ = null;
      return;
    }

    this.fieldGroup_.appendChild(markerSvg);
    this.markerSvg_ = markerSvg;
  }

  /**
   * Redraw any attached marker or cursor svgs if needed.
   * @protected
   */
  updateMarkers_() {
    const workspace =
        /** @type {!WorkspaceSvg} */ (this.sourceBlock_.workspace);
    if (workspace.keyboardAccessibilityMode && this.cursorSvg_) {
      workspace.getCursor().draw();
    }
    if (workspace.keyboardAccessibilityMode && this.markerSvg_) {
      // TODO(#4592): Update all markers on the field.
      workspace.getMarker(MarkerManager.LOCAL_MARKER).draw();
    }
  }
}

/**
 * The default value for this field.
 * @type {*}
 * @protected
 */
Field.prototype.DEFAULT_VALUE = null;

/**
 * Non-breaking space.
 * @const
 */
Field.NBSP = '\u00A0';

/**
 * A value used to signal when a field's constructor should *not* set the
 * field's value or run configure_, and should allow a subclass to do that
 * instead.
 * @const
 */
Field.SKIP_SETUP = new Sentinel();

exports.Field = Field;
