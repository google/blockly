/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a theme.
 */
'use strict';

/**
 * The class representing a theme.
 * @class
 */
goog.module('Blockly.Theme');

const object = goog.require('Blockly.utils.object');
const registry = goog.require('Blockly.registry');


/**
 * Class for a theme.
 * @alias Blockly.Theme
 */
class Theme {
  /**
   * @param {string} name Theme name.
   * @param {!Object<string, Theme.BlockStyle>=} opt_blockStyles A map
   *     from style names (strings) to objects with style attributes for blocks.
   * @param {!Object<string, Theme.CategoryStyle>=} opt_categoryStyles A
   *     map from style names (strings) to objects with style attributes for
   *     categories.
   * @param {!Theme.ComponentStyle=} opt_componentStyles A map of Blockly
   *     component names to style value.
   */
  constructor(name, opt_blockStyles, opt_categoryStyles, opt_componentStyles) {
    /**
     * The theme name. This can be used to reference a specific theme in CSS.
     * @type {string}
     */
    this.name = name;

    /**
     * The block styles map.
     * @type {!Object<string, !Theme.BlockStyle>}
     * @package
     */
    this.blockStyles = opt_blockStyles || Object.create(null);

    /**
     * The category styles map.
     * @type {!Object<string, Theme.CategoryStyle>}
     * @package
     */
    this.categoryStyles = opt_categoryStyles || Object.create(null);

    /**
     * The UI components styles map.
     * @type {!Theme.ComponentStyle}
     * @package
     */
    this.componentStyles = opt_componentStyles ||
        (/** @type {Theme.ComponentStyle} */ (Object.create(null)));

    /**
     * The font style.
     * @type {!Theme.FontStyle}
     * @package
     */
    this.fontStyle = /** @type {Theme.FontStyle} */ (Object.create(null));

    /**
     * Whether or not to add a 'hat' on top of all blocks with no previous or
     * output connections.
     * @type {?boolean}
     * @package
     */
    this.startHats = null;

    // Register the theme by name.
    registry.register(registry.Type.THEME, name, this);
  }
  /**
   * Gets the class name that identifies this theme.
   * @return {string} The CSS class name.
   * @package
   */
  getClassName() {
    return this.name + '-theme';
  }
  /**
   * Overrides or adds a style to the blockStyles map.
   * @param {string} blockStyleName The name of the block style.
   * @param {Theme.BlockStyle} blockStyle The block style.
   */
  setBlockStyle(blockStyleName, blockStyle) {
    this.blockStyles[blockStyleName] = blockStyle;
  }
  /**
   * Overrides or adds a style to the categoryStyles map.
   * @param {string} categoryStyleName The name of the category style.
   * @param {Theme.CategoryStyle} categoryStyle The category style.
   */
  setCategoryStyle(categoryStyleName, categoryStyle) {
    this.categoryStyles[categoryStyleName] = categoryStyle;
  }
  /**
   * Gets the style for a given Blockly UI component.  If the style value is a
   * string, we attempt to find the value of any named references.
   * @param {string} componentName The name of the component.
   * @return {?string} The style value.
   */
  getComponentStyle(componentName) {
    const style = this.componentStyles[componentName];
    if (style && typeof style === 'string' &&
        this.getComponentStyle(/** @type {string} */ (style))) {
      return this.getComponentStyle(/** @type {string} */ (style));
    }
    return style ? String(style) : null;
  }
  /**
   * Configure a specific Blockly UI component with a style value.
   * @param {string} componentName The name of the component.
   * @param {*} styleValue The style value.
   */
  setComponentStyle(componentName, styleValue) {
    this.componentStyles[componentName] = styleValue;
  }
  /**
   * Configure a theme's font style.
   * @param {Theme.FontStyle} fontStyle The font style.
   */
  setFontStyle(fontStyle) {
    this.fontStyle = fontStyle;
  }
  /**
   * Configure a theme's start hats.
   * @param {boolean} startHats True if the theme enables start hats, false
   *     otherwise.
   */
  setStartHats(startHats) {
    this.startHats = startHats;
  }
  /**
   * Define a new Blockly theme.
   * @param {string} name The name of the theme.
   * @param {!Object} themeObj An object containing theme properties.
   * @return {!Theme} A new Blockly theme.
   */
  static defineTheme(name, themeObj) {
    const theme = new Theme(name);
    let base = themeObj['base'];
    if (base) {
      if (typeof base === 'string') {
        base = registry.getObject(registry.Type.THEME, base);
      }
      if (base instanceof Theme) {
        object.deepMerge(theme, base);
        theme.name = name;
      }
    }

    object.deepMerge(theme.blockStyles, themeObj['blockStyles']);
    object.deepMerge(theme.categoryStyles, themeObj['categoryStyles']);
    object.deepMerge(theme.componentStyles, themeObj['componentStyles']);
    object.deepMerge(theme.fontStyle, themeObj['fontStyle']);
    if (themeObj['startHats'] !== null) {
      theme.startHats = themeObj['startHats'];
    }

    return theme;
  }
}

/**
 * A block style.
 * @typedef {{
 *            colourPrimary:string,
 *            colourSecondary:string,
 *            colourTertiary:string,
 *            hat:string
 *          }}
 */
Theme.BlockStyle;

/**
 * A category style.
 * @typedef {{
 *            colour:string
 *          }}
 */
Theme.CategoryStyle;

/**
 * A component style.
 * @typedef {{
 *            workspaceBackgroundColour:?string,
 *            toolboxBackgroundColour:?string,
 *            toolboxForegroundColour:?string,
 *            flyoutBackgroundColour:?string,
 *            flyoutForegroundColour:?string,
 *            flyoutOpacity:?number,
 *            scrollbarColour:?string,
 *            scrollbarOpacity:?number,
 *            insertionMarkerColour:?string,
 *            insertionMarkerOpacity:?number,
 *            markerColour:?string,
 *            cursorColour:?string,
 *            selectedGlowColour:?string,
 *            selectedGlowOpacity:?number,
 *            replacementGlowColour:?string,
 *            replacementGlowOpacity:?number
 *          }}
 */
Theme.ComponentStyle;

/**
 * A font style.
 * @typedef {{
 *            family:?string,
 *            weight:?string,
 *            size:?number
 *          }}
 */
Theme.FontStyle;

exports.Theme = Theme;
