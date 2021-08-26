/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Dropdown input field.  Used for editable titles and variables.
 * In the interests of a consistent UI, the toolbox shares some functions and
 * properties with the context menu.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.module('Blockly.FieldDropdown');
goog.module.declareLegacyNamespace();

const Coordinate = goog.require('Blockly.utils.Coordinate');
const DropDownDiv = goog.require('Blockly.DropDownDiv');
const Field = goog.require('Blockly.Field');
const Menu = goog.require('Blockly.Menu');
const MenuItem = goog.require('Blockly.MenuItem');
const Svg = goog.require('Blockly.utils.Svg');
const aria = goog.require('Blockly.utils.aria');
const dom = goog.require('Blockly.utils.dom');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const object = goog.require('Blockly.utils.object');
const userAgent = goog.require('Blockly.utils.userAgent');
const utils = goog.require('Blockly.utils');
const utilsString = goog.require('Blockly.utils.string');


/**
 * Class for an editable dropdown field.
 * @param {(!Array<!Array>|!Function)} menuGenerator A non-empty array of
 *     options for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a language-neutral dropdown
 *    option & returns a validated language-neutral dropdown option, or null to
 *    abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link
 *    https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
 *    for a list of properties this parameter supports.
 * @extends {Field}
 * @constructor
 * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
 */
const FieldDropdown = function(menuGenerator, opt_validator, opt_config) {
  if (typeof menuGenerator != 'function') {
    validateOptions(menuGenerator);
  }

  /**
   * An array of options for a dropdown list,
   * or a function which generates these options.
   * @type {(!Array<!Array>|
   *    !function(this:FieldDropdown): !Array<!Array>)}
   * @protected
   */
  this.menuGenerator_ = menuGenerator;

  /**
   * A cache of the most recently generated options.
   * @type {Array<!Array<string>>}
   * @private
   */
  this.generatedOptions_ = null;

  /**
   * The prefix field label, of common words set after options are trimmed.
   * @type {?string}
   * @package
   */
  this.prefixField = null;

  /**
   * The suffix field label, of common words set after options are trimmed.
   * @type {?string}
   * @package
   */
  this.suffixField = null;

  this.trimOptions_();

  /**
   * The currently selected option. The field is initialized with the
   * first option selected.
   * @type {!Object}
   * @private
   */
  this.selectedOption_ = this.getOptions(false)[0];

  // Call parent's constructor.
  FieldDropdown.superClass_.constructor.call(
      this, this.selectedOption_[1], opt_validator, opt_config);

  /**
   * A reference to the currently selected menu item.
   * @type {?MenuItem}
   * @private
   */
  this.selectedMenuItem_ = null;

  /**
   * The dropdown menu.
   * @type {?Menu}
   * @protected
   */
  this.menu_ = null;

  /**
   * SVG image element if currently selected option is an image, or null.
   * @type {?SVGImageElement}
   * @private
   */
  this.imageElement_ = null;

  /**
   * Tspan based arrow element.
   * @type {?SVGTSpanElement}
   * @private
   */
  this.arrow_ = null;

  /**
   * SVG based arrow element.
   * @type {?SVGElement}
   * @private
   */
  this.svgArrow_ = null;
};
object.inherits(FieldDropdown, Field);

/**
 * Dropdown image properties.
 * @typedef {{
 *            src:string,
 *            alt:string,
 *            width:number,
 *            height:number
 *          }}
 */
FieldDropdown.ImageProperties;

/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @return {!FieldDropdown} The new field instance.
 * @package
 * @nocollapse
 */
FieldDropdown.fromJson = function(options) {
  // `this` might be a subclass of FieldDropdown if that class doesn't override
  // the static fromJson method.
  return new this(options['options'], undefined, options);
};

/**
 * Sets the field's value based on the given XML element. Should only be
 * called by Blockly.Xml.
 * @param {!Element} fieldElement The element containing info about the
 *    field's state.
 * @package
 */
FieldDropdown.prototype.fromXml = function(fieldElement) {
  if (this.isOptionListDynamic()) {
    this.getOptions(false);
  }
  this.setValue(fieldElement.textContent);
};

/**
 * Saves this field's value.
 * @return {*} The dropdown value held by this field.
 * @override
 * @package
 */
FieldDropdown.prototype.saveState = function() {
  return this.getValue();
};

/**
 * Sets the field's value based on the given state.
 * @param {*} state The state to apply to the dropdown field.
 * @override
 * @package
 */
FieldDropdown.prototype.loadState = function(state) {
  if (this.isOptionListDynamic()) {
    this.getOptions(false);
  }
  this.setValue(state);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
FieldDropdown.prototype.SERIALIZABLE = true;

/**
 * Horizontal distance that a checkmark overhangs the dropdown.
 */
FieldDropdown.CHECKMARK_OVERHANG = 25;

/**
 * Maximum height of the dropdown menu, as a percentage of the viewport height.
 */
FieldDropdown.MAX_MENU_HEIGHT_VH = 0.45;

/**
 * The y offset from the top of the field to the top of the image, if an image
 * is selected.
 * @type {number}
 * @const
 */
const IMAGE_Y_OFFSET = 5;

/**
 * The total vertical padding above and below an image.
 * @type {number}
 * @const
 */
const IMAGE_Y_PADDING = IMAGE_Y_OFFSET * 2;

/**
 * Android can't (in 2014) display "▾", so use "▼" instead.
 */
FieldDropdown.ARROW_CHAR = userAgent.ANDROID ? '\u25BC' : '\u25BE';

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
FieldDropdown.prototype.CURSOR = 'default';

/**
 * Create the block UI for this dropdown.
 * @package
 */
FieldDropdown.prototype.initView = function() {
  if (this.shouldAddBorderRect_()) {
    this.createBorderRect_();
  } else {
    this.clickTarget_ = this.sourceBlock_.getSvgRoot();
  }
  this.createTextElement_();

  this.imageElement_ = dom.createSvgElement(Svg.IMAGE, {}, this.fieldGroup_);

  if (this.getConstants().FIELD_DROPDOWN_SVG_ARROW) {
    this.createSVGArrow_();
  } else {
    this.createTextArrow_();
  }

  if (this.borderRect_) {
    dom.addClass(this.borderRect_, 'blocklyDropdownRect');
  }
};

/**
 * Whether or not the dropdown should add a border rect.
 * @return {boolean} True if the dropdown field should add a border rect.
 * @protected
 */
FieldDropdown.prototype.shouldAddBorderRect_ = function() {
  return !this.getConstants().FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW ||
      (this.getConstants().FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW &&
       !this.sourceBlock_.isShadow());
};

/**
 * Create a tspan based arrow.
 * @protected
 */
FieldDropdown.prototype.createTextArrow_ = function() {
  this.arrow_ = dom.createSvgElement(Svg.TSPAN, {}, this.textElement_);
  this.arrow_.appendChild(document.createTextNode(
      this.sourceBlock_.RTL ? FieldDropdown.ARROW_CHAR + ' ' :
                              ' ' + FieldDropdown.ARROW_CHAR));
  if (this.sourceBlock_.RTL) {
    this.textElement_.insertBefore(this.arrow_, this.textContent_);
  } else {
    this.textElement_.appendChild(this.arrow_);
  }
};

/**
 * Create an SVG based arrow.
 * @protected
 */
FieldDropdown.prototype.createSVGArrow_ = function() {
  this.svgArrow_ = dom.createSvgElement(
      Svg.IMAGE, {
        'height': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px',
        'width': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px'
      },
      this.fieldGroup_);
  this.svgArrow_.setAttributeNS(
      dom.XLINK_NS, 'xlink:href',
      this.getConstants().FIELD_DROPDOWN_SVG_ARROW_DATAURI);
};

/**
 * Create a dropdown menu under the text.
 * @param {Event=} opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programmatically.
 * @protected
 */
FieldDropdown.prototype.showEditor_ = function(opt_e) {
  this.dropdownCreate_();
  if (opt_e && typeof opt_e.clientX === 'number') {
    this.menu_.openingCoords = new Coordinate(opt_e.clientX, opt_e.clientY);
  } else {
    this.menu_.openingCoords = null;
  }
  // Element gets created in render.
  this.menu_.render(DropDownDiv.getContentDiv());
  const menuElement = /** @type {!Element} */ (this.menu_.getElement());
  dom.addClass(menuElement, 'blocklyDropdownMenu');

  if (this.getConstants().FIELD_DROPDOWN_COLOURED_DIV) {
    const primaryColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().getColour() :
        this.sourceBlock_.getColour();
    const borderColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().style.colourTertiary :
        this.sourceBlock_.style.colourTertiary;
    DropDownDiv.setColour(primaryColour, borderColour);
  }

  DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));

  // Focusing needs to be handled after the menu is rendered and positioned.
  // Otherwise it will cause a page scroll to get the misplaced menu in
  // view. See issue #1329.
  this.menu_.focus();

  if (this.selectedMenuItem_) {
    this.menu_.setHighlighted(this.selectedMenuItem_);
  }

  this.applyColour();
};

/**
 * Create the dropdown editor.
 * @private
 */
FieldDropdown.prototype.dropdownCreate_ = function() {
  const menu = new Menu();
  menu.setRole(aria.Role.LISTBOX);
  this.menu_ = menu;

  const options = this.getOptions(false);
  this.selectedMenuItem_ = null;
  for (let i = 0; i < options.length; i++) {
    let content = options[i][0];  // Human-readable text or image.
    const value = options[i][1];  // Language-neutral value.
    if (typeof content == 'object') {
      // An image, not text.
      const image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    const menuItem = new MenuItem(content, value);
    menuItem.setRole(aria.Role.OPTION);
    menuItem.setRightToLeft(this.sourceBlock_.RTL);
    menuItem.setCheckable(true);
    menu.addChild(menuItem);
    menuItem.setChecked(value == this.value_);
    if (value == this.value_) {
      this.selectedMenuItem_ = menuItem;
    }
    menuItem.onAction(this.handleMenuActionEvent_, this);
  }
};

/**
 * Disposes of events and DOM-references belonging to the dropdown editor.
 * @private
 */
FieldDropdown.prototype.dropdownDispose_ = function() {
  if (this.menu_) {
    this.menu_.dispose();
  }
  this.menu_ = null;
  this.selectedMenuItem_ = null;
  this.applyColour();
};

/**
 * Handle an action in the dropdown menu.
 * @param {!MenuItem} menuItem The MenuItem selected within menu.
 * @private
 */
FieldDropdown.prototype.handleMenuActionEvent_ = function(menuItem) {
  DropDownDiv.hideIfOwner(this, true);
  this.onItemSelected_(/** @type {!Menu} */ (this.menu_), menuItem);
};

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!Menu} menu The Menu component clicked.
 * @param {!MenuItem} menuItem The MenuItem selected within menu.
 * @protected
 */
FieldDropdown.prototype.onItemSelected_ = function(menu, menuItem) {
  this.setValue(menuItem.getValue());
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
FieldDropdown.prototype.trimOptions_ = function() {
  const options = this.menuGenerator_;
  if (!Array.isArray(options)) {
    return;
  }
  let hasImages = false;

  // Localize label text and image alt text.
  for (let i = 0; i < options.length; i++) {
    const label = options[i][0];
    if (typeof label == 'string') {
      options[i][0] = utils.replaceMessageReferences(label);
    } else {
      if (label.alt != null) {
        options[i][0].alt = utils.replaceMessageReferences(label.alt);
      }
      hasImages = true;
    }
  }
  if (hasImages || options.length < 2) {
    return;  // Do nothing if too few items or at least one label is an image.
  }
  const strings = [];
  for (let i = 0; i < options.length; i++) {
    strings.push(options[i][0]);
  }
  const shortest = utilsString.shortestStringLength(strings);
  const prefixLength = utilsString.commonWordPrefix(strings, shortest);
  const suffixLength = utilsString.commonWordSuffix(strings, shortest);
  if (!prefixLength && !suffixLength) {
    return;
  }
  if (shortest <= prefixLength + suffixLength) {
    // One or more strings will entirely vanish if we proceed.  Abort.
    return;
  }
  if (prefixLength) {
    this.prefixField = strings[0].substring(0, prefixLength - 1);
  }
  if (suffixLength) {
    this.suffixField = strings[0].substr(1 - suffixLength);
  }

  this.menuGenerator_ =
      FieldDropdown.applyTrim_(options, prefixLength, suffixLength);
};

/**
 * Use the calculated prefix and suffix lengths to trim all of the options in
 * the given array.
 * @param {!Array<!Array>} options Array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @param {number} prefixLength The length of the common prefix.
 * @param {number} suffixLength The length of the common suffix
 * @return {!Array<!Array>} A new array with all of the option text trimmed.
 */
FieldDropdown.applyTrim_ = function(options, prefixLength, suffixLength) {
  const newOptions = [];
  // Remove the prefix and suffix from the options.
  for (let i = 0; i < options.length; i++) {
    let text = options[i][0];
    const value = options[i][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[i] = [text, value];
  }
  return newOptions;
};

/**
 * @return {boolean} True if the option list is generated by a function.
 *     Otherwise false.
 */
FieldDropdown.prototype.isOptionListDynamic = function() {
  return typeof this.menuGenerator_ == 'function';
};

/**
 * Return a list of the options for this dropdown.
 * @param {boolean=} opt_useCache For dynamic options, whether or not to use the
 *     cached options or to re-generate them.
 * @return {!Array<!Array>} A non-empty array of option tuples:
 *     (human-readable text or image, language-neutral name).
 * @throws {TypeError} If generated options are incorrectly structured.
 */
FieldDropdown.prototype.getOptions = function(opt_useCache) {
  if (this.isOptionListDynamic()) {
    if (!this.generatedOptions_ || !opt_useCache) {
      this.generatedOptions_ = this.menuGenerator_.call(this);
      validateOptions(this.generatedOptions_);
    }
    return this.generatedOptions_;
  }
  return /** @type {!Array<!Array<string>>} */ (this.menuGenerator_);
};

/**
 * Ensure that the input value is a valid language-neutral option.
 * @param {*=} opt_newValue The input value.
 * @return {?string} A valid language-neutral option, or null if invalid.
 * @protected
 */
FieldDropdown.prototype.doClassValidation_ = function(opt_newValue) {
  let isValueValid = false;
  const options = this.getOptions(true);
  for (let i = 0, option; (option = options[i]); i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (option[1] == opt_newValue) {
      isValueValid = true;
      break;
    }
  }
  if (!isValueValid) {
    if (this.sourceBlock_) {
      console.warn(
          'Cannot set the dropdown\'s value to an unavailable option.' +
          ' Block type: ' + this.sourceBlock_.type +
          ', Field name: ' + this.name + ', Value: ' + opt_newValue);
    }
    return null;
  }
  return /** @type {string} */ (opt_newValue);
};

/**
 * Update the value of this dropdown field.
 * @param {*} newValue The value to be saved. The default validator guarantees
 * that this is one of the valid dropdown options.
 * @protected
 */
FieldDropdown.prototype.doValueUpdate_ = function(newValue) {
  FieldDropdown.superClass_.doValueUpdate_.call(this, newValue);
  const options = this.getOptions(true);
  for (let i = 0, option; (option = options[i]); i++) {
    if (option[1] == this.value_) {
      this.selectedOption_ = option;
    }
  }
};

/**
 * Updates the dropdown arrow to match the colour/style of the block.
 * @package
 */
FieldDropdown.prototype.applyColour = function() {
  if (this.borderRect_) {
    this.borderRect_.setAttribute(
        'stroke', this.sourceBlock_.style.colourTertiary);
    if (this.menu_) {
      this.borderRect_.setAttribute(
          'fill', this.sourceBlock_.style.colourTertiary);
    } else {
      this.borderRect_.setAttribute('fill', 'transparent');
    }
  }
  // Update arrow's colour.
  if (this.sourceBlock_ && this.arrow_) {
    if (this.sourceBlock_.isShadow()) {
      this.arrow_.style.fill = this.sourceBlock_.style.colourSecondary;
    } else {
      this.arrow_.style.fill = this.sourceBlock_.style.colourPrimary;
    }
  }
};

/**
 * Draws the border with the correct width.
 * @protected
 */
FieldDropdown.prototype.render_ = function() {
  // Hide both elements.
  this.textContent_.nodeValue = '';
  this.imageElement_.style.display = 'none';

  // Show correct element.
  const option = this.selectedOption_ && this.selectedOption_[0];
  if (option && typeof option == 'object') {
    this.renderSelectedImage_(
        /** @type {!FieldDropdown.ImageProperties} */ (option));
  } else {
    this.renderSelectedText_();
  }

  this.positionBorderRect_();
};

/**
 * Renders the selected option, which must be an image.
 * @param {!FieldDropdown.ImageProperties} imageJson Selected
 *   option that must be an image.
 * @private
 */
FieldDropdown.prototype.renderSelectedImage_ = function(imageJson) {
  this.imageElement_.style.display = '';
  this.imageElement_.setAttributeNS(dom.XLINK_NS, 'xlink:href', imageJson.src);
  this.imageElement_.setAttribute('height', imageJson.height);
  this.imageElement_.setAttribute('width', imageJson.width);

  const imageHeight = Number(imageJson.height);
  const imageWidth = Number(imageJson.width);

  // Height and width include the border rect.
  const hasBorder = !!this.borderRect_;
  const height = Math.max(
      hasBorder ? this.getConstants().FIELD_DROPDOWN_BORDER_RECT_HEIGHT : 0,
      imageHeight + IMAGE_Y_PADDING);
  const xPadding =
      hasBorder ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0;
  let arrowWidth = 0;
  if (this.svgArrow_) {
    arrowWidth = this.positionSVGArrow_(
        imageWidth + xPadding,
        height / 2 - this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE / 2);
  } else {
    arrowWidth = dom.getFastTextWidth(
        /** @type {!SVGTSpanElement} */ (this.arrow_),
        this.getConstants().FIELD_TEXT_FONTSIZE,
        this.getConstants().FIELD_TEXT_FONTWEIGHT,
        this.getConstants().FIELD_TEXT_FONTFAMILY);
  }
  this.size_.width = imageWidth + arrowWidth + xPadding * 2;
  this.size_.height = height;

  let arrowX = 0;
  if (this.sourceBlock_.RTL) {
    const imageX = xPadding + arrowWidth;
    this.imageElement_.setAttribute('x', imageX);
  } else {
    arrowX = imageWidth + arrowWidth;
    this.textElement_.setAttribute('text-anchor', 'end');
    this.imageElement_.setAttribute('x', xPadding);
  }
  this.imageElement_.setAttribute('y', height / 2 - imageHeight / 2);

  this.positionTextElement_(arrowX + xPadding, imageWidth + arrowWidth);
};

/**
 * Renders the selected option, which must be text.
 * @private
 */
FieldDropdown.prototype.renderSelectedText_ = function() {
  // Retrieves the selected option to display through getText_.
  this.textContent_.nodeValue = this.getDisplayText_();
  dom.addClass(
      /** @type {!Element} */ (this.textElement_), 'blocklyDropdownText');
  this.textElement_.setAttribute('text-anchor', 'start');

  // Height and width include the border rect.
  const hasBorder = !!this.borderRect_;
  const height = Math.max(
      hasBorder ? this.getConstants().FIELD_DROPDOWN_BORDER_RECT_HEIGHT : 0,
      this.getConstants().FIELD_TEXT_HEIGHT);
  const textWidth = dom.getFastTextWidth(
      this.textElement_, this.getConstants().FIELD_TEXT_FONTSIZE,
      this.getConstants().FIELD_TEXT_FONTWEIGHT,
      this.getConstants().FIELD_TEXT_FONTFAMILY);
  const xPadding =
      hasBorder ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0;
  let arrowWidth = 0;
  if (this.svgArrow_) {
    arrowWidth = this.positionSVGArrow_(
        textWidth + xPadding,
        height / 2 - this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE / 2);
  }
  this.size_.width = textWidth + arrowWidth + xPadding * 2;
  this.size_.height = height;

  this.positionTextElement_(xPadding, textWidth);
};

/**
 * Position a drop-down arrow at the appropriate location at render-time.
 * @param {number} x X position the arrow is being rendered at, in px.
 * @param {number} y Y position the arrow is being rendered at, in px.
 * @return {number} Amount of space the arrow is taking up, in px.
 * @private
 */
FieldDropdown.prototype.positionSVGArrow_ = function(x, y) {
  if (!this.svgArrow_) {
    return 0;
  }
  const hasBorder = !!this.borderRect_;
  const xPadding =
      hasBorder ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0;
  const textPadding = this.getConstants().FIELD_DROPDOWN_SVG_ARROW_PADDING;
  const svgArrowSize = this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE;
  const arrowX = this.sourceBlock_.RTL ? xPadding : x + textPadding;
  this.svgArrow_.setAttribute(
      'transform', 'translate(' + arrowX + ',' + y + ')');
  return svgArrowSize + textPadding;
};

/**
 * Use the `getText_` developer hook to override the field's text
 * representation.  Get the selected option text. If the selected option is an
 * image we return the image alt text.
 * @return {?string} Selected option text.
 * @protected
 * @override
 */
FieldDropdown.prototype.getText_ = function() {
  if (!this.selectedOption_) {
    return null;
  }
  const option = this.selectedOption_[0];
  if (typeof option == 'object') {
    return option['alt'];
  }
  return option;
};

/**
 * Validates the data structure to be processed as an options list.
 * @param {?} options The proposed dropdown options.
 * @throws {TypeError} If proposed options are incorrectly structured.
 */
const validateOptions = function(options) {
  if (!Array.isArray(options)) {
    throw TypeError('FieldDropdown options must be an array.');
  }
  if (!options.length) {
    throw TypeError('FieldDropdown options must not be an empty array.');
  }
  let foundError = false;
  for (let i = 0; i < options.length; ++i) {
    const tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must be an ' +
              'array. Found: ',
          tuple);
    } else if (typeof tuple[1] != 'string') {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option id must be ' +
              'a string. Found ' + tuple[1] + ' in: ',
          tuple);
    } else if (
        tuple[0] && (typeof tuple[0] != 'string') &&
        (typeof tuple[0].src != 'string')) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must have a ' +
              'string label or image description. Found' + tuple[0] + ' in: ',
          tuple);
    }
  }
  if (foundError) {
    throw TypeError('Found invalid FieldDropdown options.');
  }
};

fieldRegistry.register('field_dropdown', FieldDropdown);

exports = FieldDropdown;
