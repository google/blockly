/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class for a button in the flyout.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.module('Blockly.FlyoutButton');
goog.module.declareLegacyNamespace();

goog.require('Blockly.browserEvents');
goog.require('Blockly.Css');
goog.require('Blockly.utils');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.style');
goog.require('Blockly.utils.Svg');

goog.requireType('Blockly.utils.toolbox');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for a button in the flyout.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace in which to place this
 *     button.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The flyout's target workspace.
 * @param {!Blockly.utils.toolbox.ButtonOrLabelInfo} json
 *    The JSON specifying the label/button.
 * @param {boolean} isLabel Whether this button should be styled as a label.
 * @constructor
 * @package
 */
const FlyoutButton = function(workspace, targetWorkspace, json, isLabel) {
  // Labels behave the same as buttons, but are styled differently.

  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.workspace_ = workspace;

  /**
   * @type {!Blockly.WorkspaceSvg}
   * @private
   */
  this.targetWorkspace_ = targetWorkspace;

  /**
   * @type {string}
   * @private
   */
  this.text_ = json['text'];

  /**
   * @type {!Blockly.utils.Coordinate}
   * @private
   */
  this.position_ = new Blockly.utils.Coordinate(0, 0);

  /**
   * Whether this button should be styled as a label.
   * @type {boolean}
   * @private
   */
  this.isLabel_ = isLabel;

  /**
   * The key to the function called when this button is clicked.
   * @type {string}
   * @private
   */
  this.callbackKey_ = json['callbackKey'] ||
  /* Check the lower case version too to satisfy IE */
                      json['callbackkey'];

  /**
   * If specified, a CSS class to add to this button.
   * @type {?string}
   * @private
   */
  this.cssClass_ = json['web-class'] || null;

  /**
   * Mouse up event data.
   * @type {?Blockly.browserEvents.Data}
   * @private
   */
  this.onMouseUpWrapper_ = null;

  /**
   * The JSON specifying the label / button.
   * @type {!Blockly.utils.toolbox.ButtonOrLabelInfo}
   */
  this.info = json;
};

/**
 * The horizontal margin around the text in the button.
 */
FlyoutButton.MARGIN_X = 5;

/**
 * The vertical margin around the text in the button.
 */
FlyoutButton.MARGIN_Y = 2;

/**
 * The width of the button's rect.
 * @type {number}
 */
FlyoutButton.prototype.width = 0;

/**
 * The height of the button's rect.
 * @type {number}
 */
FlyoutButton.prototype.height = 0;

/**
 * Create the button elements.
 * @return {!SVGElement} The button's SVG group.
 */
FlyoutButton.prototype.createDom = function() {
  let cssClass = this.isLabel_ ? 'blocklyFlyoutLabel' : 'blocklyFlyoutButton';
  if (this.cssClass_) {
    cssClass += ' ' + this.cssClass_;
  }

  this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.G, {'class': cssClass},
      this.workspace_.getCanvas());

  let shadow;
  if (!this.isLabel_) {
    // Shadow rectangle (light source does not mirror in RTL).
    shadow = Blockly.utils.dom.createSvgElement(
        Blockly.utils.Svg.RECT,
        {
          'class': 'blocklyFlyoutButtonShadow',
          'rx': 4, 'ry': 4, 'x': 1, 'y': 1
        },
        this.svgGroup_);
  }
  // Background rectangle.
  const rect = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.RECT,
      {
        'class': this.isLabel_ ?
            'blocklyFlyoutLabelBackground' : 'blocklyFlyoutButtonBackground',
        'rx': 4, 'ry': 4
      },
      this.svgGroup_);

  const svgText = Blockly.utils.dom.createSvgElement(
      Blockly.utils.Svg.TEXT,
      {
        'class': this.isLabel_ ? 'blocklyFlyoutLabelText' : 'blocklyText',
        'x': 0,
        'y': 0,
        'text-anchor': 'middle'
      },
      this.svgGroup_);
  let text = Blockly.utils.replaceMessageReferences(this.text_);
  if (this.workspace_.RTL) {
    // Force text to be RTL by adding an RLM.
    text += '\u200F';
  }
  svgText.textContent = text;
  if (this.isLabel_) {
    this.svgText_ = svgText;
    this.workspace_.getThemeManager().subscribe(this.svgText_,
        'flyoutForegroundColour', 'fill');
  }

  const fontSize = Blockly.utils.style.getComputedStyle(svgText, 'fontSize');
  const fontWeight = Blockly.utils.style.getComputedStyle(svgText, 'fontWeight');
  const fontFamily = Blockly.utils.style.getComputedStyle(svgText, 'fontFamily');
  this.width = Blockly.utils.dom.getFastTextWidthWithSizeString(svgText,
      fontSize, fontWeight, fontFamily);
  const fontMetrics = Blockly.utils.dom.measureFontMetrics(text, fontSize,
      fontWeight, fontFamily);
  this.height = fontMetrics.height;

  if (!this.isLabel_) {
    this.width += 2 * FlyoutButton.MARGIN_X;
    this.height += 2 * FlyoutButton.MARGIN_Y;
    shadow.setAttribute('width', this.width);
    shadow.setAttribute('height', this.height);
  }
  rect.setAttribute('width', this.width);
  rect.setAttribute('height', this.height);

  svgText.setAttribute('x', this.width / 2);
  svgText.setAttribute('y', this.height / 2 - fontMetrics.height / 2 +
      fontMetrics.baseline);

  this.updateTransform_();

  this.onMouseUpWrapper_ = Blockly.browserEvents.conditionalBind(
      this.svgGroup_, 'mouseup', this, this.onMouseUp_);
  return this.svgGroup_;
};

/**
 * Correctly position the flyout button and make it visible.
 */
FlyoutButton.prototype.show = function() {
  this.updateTransform_();
  this.svgGroup_.setAttribute('display', 'block');
};

/**
 * Update SVG attributes to match internal state.
 * @private
 */
FlyoutButton.prototype.updateTransform_ = function() {
  this.svgGroup_.setAttribute('transform',
      'translate(' + this.position_.x + ',' + this.position_.y + ')');
};

/**
 * Move the button to the given x, y coordinates.
 * @param {number} x The new x coordinate.
 * @param {number} y The new y coordinate.
 */
FlyoutButton.prototype.moveTo = function(x, y) {
  this.position_.x = x;
  this.position_.y = y;
  this.updateTransform_();
};

/**
 * @return {boolean} Whether or not the button is a label.
 */
FlyoutButton.prototype.isLabel = function() {
  return this.isLabel_;
};

/**
 * Location of the button.
 * @return {!Blockly.utils.Coordinate} x, y coordinates.
 * @package
 */
FlyoutButton.prototype.getPosition = function() {
  return this.position_;
};

/**
 * @return {string} Text of the button.
 */
FlyoutButton.prototype.getButtonText = function() {
  return this.text_;
};

/**
 * Get the button's target workspace.
 * @return {!Blockly.WorkspaceSvg} The target workspace of the flyout where this
 *     button resides.
 */
FlyoutButton.prototype.getTargetWorkspace = function() {
  return this.targetWorkspace_;
};

/**
 * Dispose of this button.
 */
FlyoutButton.prototype.dispose = function() {
  if (this.onMouseUpWrapper_) {
    Blockly.browserEvents.unbind(this.onMouseUpWrapper_);
  }
  if (this.svgGroup_) {
    Blockly.utils.dom.removeNode(this.svgGroup_);
  }
  if (this.svgText_) {
    this.workspace_.getThemeManager().unsubscribe(this.svgText_);
  }
};

/**
 * Do something when the button is clicked.
 * @param {!Event} e Mouse up event.
 * @private
 */
FlyoutButton.prototype.onMouseUp_ = function(e) {
  const gesture = this.targetWorkspace_.getGesture(e);
  if (gesture) {
    gesture.cancel();
  }

  if (this.isLabel_ && this.callbackKey_) {
    console.warn('Labels should not have callbacks. Label text: ' + this.text_);
  } else if (!this.isLabel_ && !(this.callbackKey_ &&
      this.targetWorkspace_.getButtonCallback(this.callbackKey_))) {
    console.warn('Buttons should have callbacks. Button text: ' + this.text_);
  } else if (!this.isLabel_) {
    this.targetWorkspace_.getButtonCallback(this.callbackKey_)(this);
  }
};

/**
 * CSS for buttons and labels.  See css.js for use.
 */
Blockly.Css.register([
  /* eslint-disable indent */
  '.blocklyFlyoutButton {',
    'fill: #888;',
    'cursor: default;',
  '}',

  '.blocklyFlyoutButtonShadow {',
    'fill: #666;',
  '}',

  '.blocklyFlyoutButton:hover {',
    'fill: #aaa;',
  '}',

  '.blocklyFlyoutLabel {',
    'cursor: default;',
  '}',

  '.blocklyFlyoutLabelBackground {',
    'opacity: 0;',
  '}',
  /* eslint-enable indent */
]);

exports = FlyoutButton;
