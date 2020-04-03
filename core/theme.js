/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a theme.
 */
'use strict';

goog.provide('Blockly.Theme');

goog.require('Blockly.utils');
goog.require('Blockly.utils.colour');
goog.require('Blockly.utils.object');


/**
 * Class for a theme.
 * @param {string} name Theme name.
 * @param {!Object.<string, Blockly.Theme.BlockStyle>=} opt_blockStyles A map
 *     from style names (strings) to objects with style attributes for blocks.
 * @param {!Object.<string, Blockly.Theme.CategoryStyle>=} opt_categoryStyles A
 *     map from style names (strings) to objects with style attributes for
 *     categories.
 * @param {!Blockly.Theme.ComponentStyle=} opt_componentStyles A map of Blockly
 *     component names to style value.
 * @constructor
 */
Blockly.Theme = function(name, opt_blockStyles, opt_categoryStyles,
    opt_componentStyles) {

  /**
   * The theme name. This can be used to reference a specific theme in CSS.
   * @type {string}
   */
  this.name = name;

  /**
   * The block styles map.
   * @type {!Object.<string, !Blockly.Theme.BlockStyle>}
   * @package
   */
  this.blockStyles = opt_blockStyles || Object.create(null);

  /**
   * The category styles map.
   * @type {!Object.<string, Blockly.Theme.CategoryStyle>}
   * @package
   */
  this.categoryStyles = opt_categoryStyles || Object.create(null);

  /**
   * The UI components styles map.
   * @type {!Blockly.Theme.ComponentStyle}
   * @package
   */
  this.componentStyles = opt_componentStyles ||
    (/** @type {Blockly.Theme.ComponentStyle} */ (Object.create(null)));

  /**
   * The font style.
   * @type {!Blockly.Theme.FontStyle}
   * @package
   */
  this.fontStyle = /** @type {Blockly.Theme.FontStyle} */ (Object.create(null));

  /**
   * Whether or not to add a 'hat' on top of all blocks with no previous or
   * output connections.
   * @type {?boolean}
   * @package
   */
  this.startHats = null;
};

/**
 * A block style.
 * @typedef {{
 *            colourPrimary:string,
 *            colourSecondary:string,
 *            colourTertiary:string,
 *            hat:string
 *          }}
 */
Blockly.Theme.BlockStyle;

/**
 * A category style.
 * @typedef {{
 *            colour:string
 *          }}
 */
Blockly.Theme.CategoryStyle;

/**
 * A component style.
 * @typedef {{
 *            workspaceBackgroundColour:string?,
 *            toolboxBackgroundColour:string?,
 *            toolboxForegroundColour:string?,
 *            flyoutBackgroundColour:string?,
 *            flyoutForegroundColour:string?,
 *            flyoutOpacity:number?,
 *            scrollbarColour:string?,
 *            scrollbarOpacity:number?,
 *            insertionMarkerColour:string?,
 *            insertionMarkerOpacity:number?,
 *            markerColour:string?,
 *            cursorColour:string?,
 *            selectedGlowColour:string?,
 *            selectedGlowOpacity:number?,
 *            replacementGlowColour:string?,
 *            replacementGlowOpacity:number?
 *          }}
 */
Blockly.Theme.ComponentStyle;

/**
 * A font style.
 * @typedef {{
 *            family:string?,
 *            weight:string?,
 *            size:number?
 *          }}
 */
Blockly.Theme.FontStyle;

/**
 * Gets the class name that identifies this theme.
 * @return {string} The CSS class name.
 * @package
 */
Blockly.Theme.prototype.getClassName = function() {
  return this.name + '-theme';
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param {string} blockStyleName The name of the block style.
 * @param {Blockly.Theme.BlockStyle} blockStyle The block style.
*/
Blockly.Theme.prototype.setBlockStyle = function(blockStyleName, blockStyle) {
  this.blockStyles[blockStyleName] = blockStyle;
};

/**
 * Overrides or adds a style to the categoryStyles map.
 * @param {string} categoryStyleName The name of the category style.
 * @param {Blockly.Theme.CategoryStyle} categoryStyle The category style.
*/
Blockly.Theme.prototype.setCategoryStyle = function(categoryStyleName,
    categoryStyle) {
  this.categoryStyles[categoryStyleName] = categoryStyle;
};

/**
 * Gets the style for a given Blockly UI component.  If the style value is a
 * string, we attempt to find the value of any named references.
 * @param {string} componentName The name of the component.
 * @return {?string} The style value.
 */
Blockly.Theme.prototype.getComponentStyle = function(componentName) {
  var style = this.componentStyles[componentName];
  if (style && typeof propertyValue == 'string' &&
      this.getComponentStyle(/** @type {string} */ (style))) {
    return this.getComponentStyle(/** @type {string} */ (style));
  }
  return style ? String(style) : null;
};

/**
 * Configure a specific Blockly UI component with a style value.
 * @param {string} componentName The name of the component.
 * @param {*} styleValue The style value.
*/
Blockly.Theme.prototype.setComponentStyle = function(componentName,
    styleValue) {
  this.componentStyles[componentName] = styleValue;
};

/**
 * Configure a theme's font style.
 * @param {Blockly.Theme.FontStyle} fontStyle The font style.
*/
Blockly.Theme.prototype.setFontStyle = function(fontStyle) {
  this.fontStyle = fontStyle;
};

/**
 * Configure a theme's start hats.
 * @param {boolean} startHats True if the theme enables start hats, false
 *     otherwise.
*/
Blockly.Theme.prototype.setStartHats = function(startHats) {
  this.startHats = startHats;
};

/**
 * Define a new Blockly theme.
 * @param {string} name The name of the theme.
 * @param {!Object} themeObj An object containing theme properties.
 * @return {!Blockly.Theme} A new Blockly theme.
*/
Blockly.Theme.defineTheme = function(name, themeObj) {
  var theme = new Blockly.Theme(name);
  var base = themeObj['base'];
  if (base && base instanceof Blockly.Theme) {
    Blockly.utils.object.deepMerge(theme, base);
    theme.name = name;
  }
  
  Blockly.utils.object.deepMerge(theme.blockStyles,
      themeObj['blockStyles']);
  Blockly.utils.object.deepMerge(theme.categoryStyles,
      themeObj['categoryStyles']);
  Blockly.utils.object.deepMerge(theme.componentStyles,
      themeObj['componentStyles']);
  Blockly.utils.object.deepMerge(theme.fontStyle,
      themeObj['fontStyle']);
  if (themeObj['startHats'] != null) {
    theme.startHats = themeObj['startHats'];
  }
  return theme;
};
