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

goog.provide('Blockly.FieldDropdown');

goog.require('Blockly.DropDownDiv');
goog.require('Blockly.Field');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.Menu');
goog.require('Blockly.MenuItem');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.string');
goog.require('Blockly.utils.Svg');
goog.require('Blockly.utils.userAgent');


/**
 * Class for an editable dropdown field.
 * @param {(!Array<!Array>|!Function)} menuGenerator A non-empty array of
 *     options for a dropdown list, or a function which generates these options.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value. Takes in a language-neutral dropdown
 *    option & returns a validated language-neutral dropdown option, or null to
 *    abort the change.
 * @param {Object=} opt_config A map of options used to configure the field.
 *    See the [field creation documentation]{@link https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/dropdown#creation}
 *    for a list of properties this parameter supports.
 * @extends {Blockly.Field}
 * @constructor
 * @throws {TypeError} If `menuGenerator` options are incorrectly structured.
 */
Blockly.FieldDropdown = function(menuGenerator, opt_validator, opt_config) {
  if (typeof menuGenerator != 'function') {
    Blockly.FieldDropdown.validateOptions_(menuGenerator);
  }

  /**
   * An array of options for a dropdown list,
   * or a function which generates these options.
   * @type {(!Array<!Array>|
   *    !function(this:Blockly.FieldDropdown): !Array<!Array>)}
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
  Blockly.FieldDropdown.superClass_.constructor.call(
      this, this.selectedOption_[1], opt_validator, opt_config);

  /**
   * A reference to the currently selected menu item.
   * @type {?Blockly.MenuItem}
   * @private
   */
  this.selectedMenuItem_ = null;

  /**
   * The dropdown menu.
   * @type {?Blockly.Menu}
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
Blockly.utils.object.inherits(Blockly.FieldDropdown, Blockly.Field);

/**
 * Dropdown image properties.
 * @typedef {{
  *            src:string,
  *            alt:string,
  *            width:number,
  *            height:number
  *          }}
  */
Blockly.FieldDropdown.ImageProperties;

/**
 * Construct a FieldDropdown from a JSON arg object.
 * @param {!Object} options A JSON object with options (options).
 * @return {!Blockly.FieldDropdown} The new field instance.
 * @package
 * @nocollapse
 */
Blockly.FieldDropdown.fromJson = function(options) {
  return new Blockly.FieldDropdown(options['options'], undefined, options);
};

/**
 * Sets the field's value based on the given XML element. Should only be
 * called by Blockly.Xml.
 * @param {!Element} fieldElement The element containing info about the
 *    field's state.
 * @package
 */
Blockly.FieldDropdown.prototype.fromXml = function(fieldElement) {
  if (this.isOptionListDynamic()) {
    this.getOptions(false);
  }
  this.setValue(fieldElement.textContent);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 */
Blockly.FieldDropdown.prototype.SERIALIZABLE = true;

/**
 * Horizontal distance that a checkmark overhangs the dropdown.
 */
Blockly.FieldDropdown.CHECKMARK_OVERHANG = 25;

/**
 * Maximum height of the dropdown menu, as a percentage of the viewport height.
 */
Blockly.FieldDropdown.MAX_MENU_HEIGHT_VH = 0.45;

/**
 * The y offset from the top of the field to the top of the image, if an image
 * is selected.
 * @type {number}
 * @const
 * @private
 */
Blockly.FieldDropdown.IMAGE_Y_OFFSET = 5;

/**
 * The total vertical padding above and below an image.
 * @type {number}
 * @const
 * @private
 */
Blockly.FieldDropdown.IMAGE_Y_PADDING =
    Blockly.FieldDropdown.IMAGE_Y_OFFSET * 2;

/**
 * Android can't (in 2014) display "▾", so use "▼" instead.
 */
Blockly.FieldDropdown.ARROW_CHAR =
    Blockly.utils.userAgent.ANDROID ? '\u25BC' : '\u25BE';

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldDropdown.prototype.CURSOR = 'default';

/**
 * Create the block UI for this dropdown.
 * @package
 */
Blockly.FieldDropdown.prototype.initView = function() {
  if (this.shouldAddBorderRect_()) {
    this.createBorderRect_();
  } else {
    this.clickTarget_ = this.sourceBlock_.getSvgRoot();
  }
  this.createTextElement_();

  this.imageElement_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE, {}, this.fieldGroup_);

  if (this.getConstants().FIELD_DROPDOWN_SVG_ARROW) {
    this.createSVGArrow_();
  } else {
    this.createTextArrow_();
  }

  if (this.borderRect_) {
    Blockly.utils.dom.addClass(this.borderRect_, 'blocklyDropdownRect');
  }
};

/**
 * Whether or not the dropdown should add a border rect.
 * @return {boolean} True if the dropdown field should add a border rect.
 * @protected
 */
Blockly.FieldDropdown.prototype.shouldAddBorderRect_ = function() {
  return !this.getConstants().FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW ||
      (this.getConstants().FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW &&
          !this.sourceBlock_.isShadow());
};

/**
 * Create a tspan based arrow.
 * @protected
 */
Blockly.FieldDropdown.prototype.createTextArrow_ = function() {
  this.arrow_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TSPAN, {}, this.textElement_);
  this.arrow_.appendChild(document.createTextNode(
      this.sourceBlock_.RTL ?
      Blockly.FieldDropdown.ARROW_CHAR + ' ' :
      ' ' + Blockly.FieldDropdown.ARROW_CHAR));
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
Blockly.FieldDropdown.prototype.createSVGArrow_ = function() {
  this.svgArrow_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.IMAGE, {
        'height': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px',
        'width': this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE + 'px'
      }, this.fieldGroup_);
  this.svgArrow_.setAttributeNS(Blockly.utils.dom.XLINK_NS, 'xlink:href',
      this.getConstants().FIELD_DROPDOWN_SVG_ARROW_DATAURI);
};

/**
 * Create a dropdown menu under the text.
 * @param {Event=} opt_e Optional mouse event that triggered the field to open,
 *     or undefined if triggered programmatically.
 * @protected
 */
Blockly.FieldDropdown.prototype.showEditor_ = function(opt_e) {
  this.dropdownCreate_();
  if (opt_e && typeof opt_e.clientX === 'number') {
    this.menu_.openingCoords =
        new Blockly.utils.Coordinate(opt_e.clientX, opt_e.clientY);
  } else {
    this.menu_.openingCoords = null;
  }
  // Element gets created in render.
  this.menu_.render(Blockly.DropDownDiv.getContentDiv());
  var menuElement = /** @type {!Element} */ (this.menu_.getElement());
  Blockly.utils.dom.addClass(menuElement, 'blocklyDropdownMenu');

  if (this.getConstants().FIELD_DROPDOWN_COLOURED_DIV) {
    var primaryColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().getColour() :
        this.sourceBlock_.getColour();
    var borderColour = (this.sourceBlock_.isShadow()) ?
        this.sourceBlock_.getParent().style.colourTertiary :
        this.sourceBlock_.style.colourTertiary;
    Blockly.DropDownDiv.setColour(primaryColour, borderColour);
  }

  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));

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
Blockly.FieldDropdown.prototype.dropdownCreate_ = function() {
  var menu = new Blockly.Menu();
  menu.setRole(Blockly.utils.aria.Role.LISTBOX);
  this.menu_ = menu;

  var options = this.getOptions(false);
  this.selectedMenuItem_ = null;
  for (var i = 0; i < options.length; i++) {
    var content = options[i][0];  // Human-readable text or image.
    var value = options[i][1];    // Language-neutral value.
    if (typeof content == 'object') {
      // An image, not text.
      var image = new Image(content['width'], content['height']);
      image.src = content['src'];
      image.alt = content['alt'] || '';
      content = image;
    }
    var menuItem = new Blockly.MenuItem(content, value);
    menuItem.setRole(Blockly.utils.aria.Role.OPTION);
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
Blockly.FieldDropdown.prototype.dropdownDispose_ = function() {
  if (this.menu_) {
    this.menu_.dispose();
  }
  this.menu_ = null;
  this.selectedMenuItem_ = null;
  this.applyColour();
};

/**
 * Handle an action in the dropdown menu.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 * @private
 */
Blockly.FieldDropdown.prototype.handleMenuActionEvent_ = function(menuItem) {
  Blockly.DropDownDiv.hideIfOwner(this, true);
  this.onItemSelected_(/** @type {!Blockly.Menu} */ (this.menu_), menuItem);
};

/**
 * Handle the selection of an item in the dropdown menu.
 * @param {!Blockly.Menu} menu The Menu component clicked.
 * @param {!Blockly.MenuItem} menuItem The MenuItem selected within menu.
 * @protected
 */
Blockly.FieldDropdown.prototype.onItemSelected_ = function(menu, menuItem) {
  this.setValue(menuItem.getValue());
};

/**
 * Factor out common words in statically defined options.
 * Create prefix and/or suffix labels.
 * @private
 */
Blockly.FieldDropdown.prototype.trimOptions_ = function() {
  var options = this.menuGenerator_;
  if (!Array.isArray(options)) {
    return;
  }
  var hasImages = false;

  // Localize label text and image alt text.
  for (var i = 0; i < options.length; i++) {
    var label = options[i][0];
    if (typeof label == 'string') {
      options[i][0] = Blockly.utils.replaceMessageReferences(label);
    } else {
      if (label.alt != null) {
        options[i][0].alt = Blockly.utils.replaceMessageReferences(label.alt);
      }
      hasImages = true;
    }
  }
  if (hasImages || options.length < 2) {
    return;  // Do nothing if too few items or at least one label is an image.
  }
  var strings = [];
  for (var i = 0; i < options.length; i++) {
    strings.push(options[i][0]);
  }
  var shortest = Blockly.utils.string.shortestStringLength(strings);
  var prefixLength = Blockly.utils.string.commonWordPrefix(strings, shortest);
  var suffixLength = Blockly.utils.string.commonWordSuffix(strings, shortest);
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

  this.menuGenerator_ = Blockly.FieldDropdown.applyTrim_(options, prefixLength,
      suffixLength);
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
Blockly.FieldDropdown.applyTrim_ = function(options,
    prefixLength, suffixLength) {
  var newOptions = [];
  // Remove the prefix and suffix from the options.
  for (var i = 0; i < options.length; i++) {
    var text = options[i][0];
    var value = options[i][1];
    text = text.substring(prefixLength, text.length - suffixLength);
    newOptions[i] = [text, value];
  }
  return newOptions;
};

/**
 * @return {boolean} True if the option list is generated by a function.
 *     Otherwise false.
 */
Blockly.FieldDropdown.prototype.isOptionListDynamic = function() {
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
Blockly.FieldDropdown.prototype.getOptions = function(opt_useCache) {
  if (this.isOptionListDynamic()) {
    if (!this.generatedOptions_ || !opt_useCache) {
      this.generatedOptions_ = this.menuGenerator_.call(this);
      Blockly.FieldDropdown.validateOptions_(this.generatedOptions_);
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
Blockly.FieldDropdown.prototype.doClassValidation_ = function(opt_newValue) {
  var isValueValid = false;
  var options = this.getOptions(true);
  for (var i = 0, option; (option = options[i]); i++) {
    // Options are tuples of human-readable text and language-neutral values.
    if (option[1] == opt_newValue) {
      isValueValid = true;
      break;
    }
  }
  if (!isValueValid) {
    if (this.sourceBlock_) {
      console.warn('Cannot set the dropdown\'s value to an unavailable option.' +
        ' Block type: ' + this.sourceBlock_.type + ', Field name: ' + this.name +
        ', Value: ' + opt_newValue);
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
Blockly.FieldDropdown.prototype.doValueUpdate_ = function(newValue) {
  Blockly.FieldDropdown.superClass_.doValueUpdate_.call(this, newValue);
  var options = this.getOptions(true);
  for (var i = 0, option; (option = options[i]); i++) {
    if (option[1] == this.value_) {
      this.selectedOption_ = option;
    }
  }
};

/**
 * Updates the dropdown arrow to match the colour/style of the block.
 * @package
 */
Blockly.FieldDropdown.prototype.applyColour = function() {
  if (this.borderRect_) {
    this.borderRect_.setAttribute('stroke',
        this.sourceBlock_.style.colourTertiary);
    if (this.menu_) {
      this.borderRect_.setAttribute('fill',
          this.sourceBlock_.style.colourTertiary);
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
Blockly.FieldDropdown.prototype.render_ = function() {
  // Hide both elements.
  this.textContent_.nodeValue = '';
  this.imageElement_.style.display = 'none';

  // Show correct element.
  var option = this.selectedOption_ && this.selectedOption_[0];
  if (option && typeof option == 'object') {
    this.renderSelectedImage_(
        /** @type {!Blockly.FieldDropdown.ImageProperties} */ (option));
  } else {
    this.renderSelectedText_();
  }

  this.positionBorderRect_();
};

/**
 * Renders the selected option, which must be an image.
 * @param {!Blockly.FieldDropdown.ImageProperties} imageJson Selected
 *   option that must be an image.
 * @private
 */
Blockly.FieldDropdown.prototype.renderSelectedImage_ = function(imageJson) {
  this.imageElement_.style.display = '';
  this.imageElement_.setAttributeNS(
      Blockly.utils.dom.XLINK_NS, 'xlink:href', imageJson.src);
  this.imageElement_.setAttribute('height', imageJson.height);
  this.imageElement_.setAttribute('width', imageJson.width);

  var imageHeight = Number(imageJson.height);
  var imageWidth = Number(imageJson.width);

  // Height and width include the border rect.
  var hasBorder = !!this.borderRect_;
  var height = Math.max(
      hasBorder ? this.getConstants().FIELD_DROPDOWN_BORDER_RECT_HEIGHT : 0,
      imageHeight + Blockly.FieldDropdown.IMAGE_Y_PADDING);
  var xPadding = hasBorder ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0;
  var arrowWidth = 0;
  if (this.svgArrow_) {
    arrowWidth = this.positionSVGArrow_(imageWidth + xPadding, height / 2 -
      this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE / 2);
  } else {
    arrowWidth = Blockly.utils.dom.getFastTextWidth(
        /** @type {!SVGTSpanElement} */ (this.arrow_),
        this.getConstants().FIELD_TEXT_FONTSIZE,
        this.getConstants().FIELD_TEXT_FONTWEIGHT,
        this.getConstants().FIELD_TEXT_FONTFAMILY);
  }
  this.size_.width = imageWidth + arrowWidth + xPadding * 2;
  this.size_.height = height;

  var arrowX = 0;
  if (this.sourceBlock_.RTL) {
    var imageX = xPadding + arrowWidth;
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
Blockly.FieldDropdown.prototype.renderSelectedText_ = function() {
  // Retrieves the selected option to display through getText_.
  this.textContent_.nodeValue = this.getDisplayText_();
  Blockly.utils.dom.addClass(/** @type {!Element} */ (this.textElement_),
      'blocklyDropdownText');
  this.textElement_.setAttribute('text-anchor', 'start');

  // Height and width include the border rect.
  var hasBorder = !!this.borderRect_;
  var height = Math.max(
      hasBorder ? this.getConstants().FIELD_DROPDOWN_BORDER_RECT_HEIGHT : 0,
      this.getConstants().FIELD_TEXT_HEIGHT);
  var textWidth = Blockly.utils.dom.getFastTextWidth(this.textElement_,
      this.getConstants().FIELD_TEXT_FONTSIZE,
      this.getConstants().FIELD_TEXT_FONTWEIGHT,
      this.getConstants().FIELD_TEXT_FONTFAMILY);
  var xPadding = hasBorder ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0;
  var arrowWidth = 0;
  if (this.svgArrow_) {
    arrowWidth = this.positionSVGArrow_(textWidth + xPadding, height / 2 -
        this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE / 2);
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
Blockly.FieldDropdown.prototype.positionSVGArrow_ = function(x, y) {
  if (!this.svgArrow_) {
    return 0;
  }
  var hasBorder = !!this.borderRect_;
  var xPadding = hasBorder ? this.getConstants().FIELD_BORDER_RECT_X_PADDING : 0;
  var textPadding = this.getConstants().FIELD_DROPDOWN_SVG_ARROW_PADDING;
  var svgArrowSize = this.getConstants().FIELD_DROPDOWN_SVG_ARROW_SIZE;
  var arrowX = this.sourceBlock_.RTL ? xPadding : x + textPadding;
  this.svgArrow_.setAttribute('transform',
      'translate(' + arrowX + ',' + y + ')');
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
Blockly.FieldDropdown.prototype.getText_ = function() {
  if (!this.selectedOption_) {
    return null;
  }
  var option = this.selectedOption_[0];
  if (typeof option == 'object') {
    return option['alt'];
  }
  return option;
};

/**
 * Validates the data structure to be processed as an options list.
 * @param {?} options The proposed dropdown options.
 * @throws {TypeError} If proposed options are incorrectly structured.
 * @private
 */
Blockly.FieldDropdown.validateOptions_ = function(options) {
  if (!Array.isArray(options)) {
    throw TypeError('FieldDropdown options must be an array.');
  }
  if (!options.length) {
    throw TypeError('FieldDropdown options must not be an empty array.');
  }
  var foundError = false;
  for (var i = 0; i < options.length; ++i) {
    var tuple = options[i];
    if (!Array.isArray(tuple)) {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option must be an ' +
          'array. Found: ', tuple);
    } else if (typeof tuple[1] != 'string') {
      foundError = true;
      console.error(
          'Invalid option[' + i + ']: Each FieldDropdown option id must be ' +
          'a string. Found ' + tuple[1] + ' in: ', tuple);
    } else if (tuple[0] &&
              (typeof tuple[0] != 'string') &&
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

Blockly.fieldRegistry.register('field_dropdown', Blockly.FieldDropdown);
