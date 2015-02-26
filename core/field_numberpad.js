/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2013 Google Inc.
 * https://blockly.googlecode.com/
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

goog.provide('Blockly.FieldNumberpad');

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
Blockly.FieldNumberpad = function(text, opt_changeHandler) {
  var changeHandler;

  if (opt_changeHandler) {
    // Wrap the user's change handler together with the angle validator.
    var thisObj = this;
    changeHandler = function(value) {
      //value = Blockly.FieldArduino.angleValidator.call(thisObj, value);
      if (value !== null) {
        opt_changeHandler.call(thisObj, value);
      }
      return value;
    };
  } else {
    //changeHandler = Blockly.FieldArduino.angleValidator;
  }

  // Add degree symbol: "360°" (LTR) or "°360" (RTL)
  //this.symbol_ = Blockly.createSvgElement('tspan', {}, null);
  /*this.symbol_.appendChild(document.createTextNode('\u00B0'));
   */
  Blockly.FieldNumberpad.superClass_.constructor.call(this,
    text, changeHandler);
};
goog.inherits(Blockly.FieldNumberpad, Blockly.FieldTextInput);

/**
 * Clone this FieldArduino.
 * @return {!Blockly.FieldArduino} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldNumberpad.prototype.clone = function() {
  return new Blockly.FieldNumberpad(this.getText(), this.changeHandler_);
};

/**
 * Round angles to the nearest 15 degrees when using mouse.
 * Set to 0 to disable rounding.
 */
Blockly.FieldNumberpad.ROUND = 15;

/**
 * Half the width of protractor image.
 */
Blockly.FieldNumberpad.HALF = 100 / 2;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldNumberpad.RADIUS = Blockly.FieldArduino.HALF - 1;

/**
 * Clean up this FieldArduino, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldNumberpad.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldNumberpad.superClass_.dispose_.call(thisField)();
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
Blockly.FieldNumberpad.prototype.showEditor_ = function() {
  var noFocus =
    goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldNumberpad.superClass_.showEditor_.call(this, noFocus);
  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    // Mobile interface uses window.prompt.
    return;
  }

  //define scaling vars
  var scale = 1;
  var pad = 15 * scale;
  var squareWidth = 50 * scale;
  var squareHeight = 50 * scale;
  var xshift = squareWidth + pad;
  var yshift = (squareWidth) + (50 * scale);
  var downshift = 350 * scale;
  var rightshift = 250 * scale
  var xbase = 9 * scale;
  var rightpad = 20 * scale;
  var leftpad = 20 * scale;
  var font = 'Verdana, Geneva, sans-serif';
  // Build the SVG DOM.
  var svg = Blockly.createSvgElement('svg', {
    'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:html': 'http://www.w3.org/1999/xhtml',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'width': ((250 * scale) + 60) + 'px',
    'height': ((340 * scale) + 60) + 'px'
  }, div);
  //center rectangle
  var rectangle = Blockly.createSvgElement('rect', {
    'id': 'rectangle',
    'width': 250 * scale,
    'height': 340 * scale,
    'x': -40 + xshift,
    'y': -40 + squareHeight + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoRect'
  }, svg);


  ///////////////number labels////////////////////
  var text1 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (-1) + yshift + pad+30 + (yshift /2), 
    'x': -40 + 12 + pad+65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text1.appendChild(document.createTextNode("1"));

  var text2 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (-1) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text2.appendChild(document.createTextNode("2"));

  var text3 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (-1) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + squareHeight + rightshift + pad-65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text3.appendChild(document.createTextNode("3"));

  var text4 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (0) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + pad+65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text4.appendChild(document.createTextNode("4"));

  var text5 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (0) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text5.appendChild(document.createTextNode("5"));

  var text6 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (0) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + squareHeight + rightshift + pad-65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text6.appendChild(document.createTextNode("6"));

  var text7 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + pad+65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text7.appendChild(document.createTextNode("7"));

  var text8 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text8.appendChild(document.createTextNode("8"));

  var text9 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+30 + (yshift /2),
    'x': -40 + 12 + squareHeight + rightshift + pad-65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text9.appendChild(document.createTextNode("9"));

  var text0 = Blockly.createSvgElement('text', {
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+30 + (yshift /2), 
    'x': -40 + 12 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNum'
  }, svg);
  text0.appendChild(document.createTextNode("0"));

  // var textESC = Blockly.createSvgElement('text', {
  //   'y': -50 + 2 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+30 + (yshift /2), 
  //   'x': -50 + 14 + squareHeight + rightshift + pad-65,
  //   'font-family': font,
  //   'fill': '#75A2F0',
  //   'class': 'blocklyArduinoNumText'
  // }, svg);
  // textESC.appendChild(document.createTextNode("ESC"));

  var textPOM = Blockly.createSvgElement('text', {
    'y': -50 + 2 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+30 + (yshift /2), 
    'x': -50 + 14 + pad+65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNumText'
  }, svg);
  textPOM.appendChild(document.createTextNode("+/-"));

  var textCLR = Blockly.createSvgElement('text', {
    'y': -50 + 2 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+30 + (yshift /2), 
    'x': -50 + 14 + squareHeight + rightshift + pad-65,
    'font-family': font,
    'fill': '#75A2F0',
    'class': 'blocklyArduinoNumText'
  }, svg);
  textCLR.appendChild(document.createTextNode("CLR"));


  ///////////////text squares////////////////////
  var square1 = Blockly.createSvgElement('rect', {
    'id': '1',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (-1) + yshift + pad+40,
    'x': -40 + pad+65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square2 = Blockly.createSvgElement('rect', {
    'id': '2',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (-1) + yshift + pad+40,
    'x': -40 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square3 = Blockly.createSvgElement('rect', {
    'id': '3',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (-1) + yshift + pad+40,
    'x': -40 + squareHeight + rightshift + pad-65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);
  
  var square4 = Blockly.createSvgElement('rect', {
    'id': '4',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (0) + yshift + pad+40,
    'x': -40 + pad+65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square5 = Blockly.createSvgElement('rect', {
    'id': '5',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (0) + yshift + pad+40,
    'x': -40 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square6 = Blockly.createSvgElement('rect', {
    'id': '6',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (0) + yshift + pad+40,
    'x': -40 + squareHeight + rightshift + pad-65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square7 = Blockly.createSvgElement('rect', {
    'id': '7',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+40,
    'x': -40 + pad+65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square8 = Blockly.createSvgElement('rect', {
    'id': '8',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+40,
    'x': -40 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square9 = Blockly.createSvgElement('rect', {
    'id': '9',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+40,
    'x': -40 + squareHeight + rightshift + pad-65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var square0 = Blockly.createSvgElement('rect', {
    'id': '0',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+40,
    'x': -40 + (pad+65 + squareHeight + rightshift + pad-65) / 2,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  // var squareESC = Blockly.createSvgElement('rect', {
  //   'id': 'E',
  //   'width': squareWidth,
  //   'height': squareHeight,
  //   'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+40,
  //   'x': -40 + squareHeight + rightshift + pad-65,
  //   'rx': '5',
  //   'ry': '5',
  //   'class': 'blocklyArduinoSelectorTransparent'
  // }, svg);

  var squarePOM = Blockly.createSvgElement('rect', {
    'id': 'P',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+40,
    'x': -40 + pad+65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  var squareCLR = Blockly.createSvgElement('rect', {
    'id': 'C',
    'width': squareWidth,
    'height': squareHeight,
    'y': -40 + xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+40,
    'x': -40 + squareHeight + rightshift + pad-65,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelectorTransparent'
  }, svg);

  // this.clickWrapper_ =
  //   Blockly.bindEvent_(svg, 'click', this, Blockly.WidgetDiv.hide);
  this.clickWrapper_ =
    Blockly.bindEvent_(rectangle, 'mousedown', this, this.createBlockFunc_(rectangle));
  this.clickWrapper_ =
    Blockly.bindEvent_(square1, 'mousedown', this, this.createBlockFunc_(square1));
  this.clickWrapper_ =
    Blockly.bindEvent_(square2, 'mousedown', this, this.createBlockFunc_(square2));
  this.clickWrapper_ =
    Blockly.bindEvent_(square3, 'mousedown', this, this.createBlockFunc_(square3));
  this.clickWrapper_ =
    Blockly.bindEvent_(square4, 'mousedown', this, this.createBlockFunc_(square4));
  this.clickWrapper_ =
    Blockly.bindEvent_(square5, 'mousedown', this, this.createBlockFunc_(square5));
  this.clickWrapper_ =
    Blockly.bindEvent_(square6, 'mousedown', this, this.createBlockFunc_(square6));
  this.clickWrapper_ =
    Blockly.bindEvent_(square7, 'mousedown', this, this.createBlockFunc_(square7));
  this.clickWrapper_ =
    Blockly.bindEvent_(square8, 'mousedown', this, this.createBlockFunc_(square8));
  this.clickWrapper_ =
    Blockly.bindEvent_(square9, 'mousedown', this, this.createBlockFunc_(square9));
  this.clickWrapper_ =
    Blockly.bindEvent_(square0, 'mousedown', this, this.createBlockFunc_(square0));
  this.clickWrapper_ =
    Blockly.bindEvent_(squareCLR, 'mousedown', this, this.createBlockFunc_(squareCLR));
  // this.clickWrapper_ =
  //   Blockly.bindEvent_(squareESC, 'click', this, this.createBlockFunc_(squareESC));
  // this.clickWrapper_ =
  //   Blockly.bindEvent_(squareESC, 'click', this, Blockly.WidgetDiv.hide);
  this.clickWrapper_ =
    Blockly.bindEvent_(squarePOM, 'mousedown', this, this.createBlockFunc_(squarePOM));
  this.clickWrapper_ =
    Blockly.bindEvent_(text1, 'mousedown', this, this.createBlockFunc_(text1));
  this.clickWrapper_ =
    Blockly.bindEvent_(text2, 'mousedown', this, this.createBlockFunc_(text2));
  this.clickWrapper_ =
    Blockly.bindEvent_(text3, 'mousedown', this, this.createBlockFunc_(text3));
  this.clickWrapper_ =
    Blockly.bindEvent_(text4, 'mousedown', this, this.createBlockFunc_(text4));
  this.clickWrapper_ =
    Blockly.bindEvent_(text5, 'mousedown', this, this.createBlockFunc_(text5));
  this.clickWrapper_ =
    Blockly.bindEvent_(text6, 'mousedown', this, this.createBlockFunc_(text6));
    this.clickWrapper_ =
    Blockly.bindEvent_(text7, 'mousedown', this, this.createBlockFunc_(text7));
  this.clickWrapper_ =
    Blockly.bindEvent_(text8, 'mousedown', this, this.createBlockFunc_(text8));
  this.clickWrapper_ =
    Blockly.bindEvent_(text9, 'mousedown', this, this.createBlockFunc_(text9));
  this.clickWrapper_ =
    Blockly.bindEvent_(text0, 'mousedown', this, this.createBlockFunc_(text0));
  this.clickWrapper_ =
    Blockly.bindEvent_(textCLR, 'mousedown', this, this.createBlockFunc_(textCLR));
  // this.clickWrapper_ =
  //   Blockly.bindEvent_(textESC, 'click', this, this.createBlockFunc_(textESC));
  this.clickWrapper_ =
    Blockly.bindEvent_(textPOM, 'mousedown', this, this.createBlockFunc_(textPOM));
};

Blockly.FieldNumberpad.prototype.createBlockFunc_ = function(originBlock) {
  var FieldNumberpad = this;
  return function(e) {
    if (originBlock.id.length == 1) {
      console.log(originBlock.id + " was clicked");
      //FieldArduino.setText(originBlock.id);
      if(originBlock.id == 'E') {
        //does nothing
      } else if(originBlock.id == 'P') {
        Blockly.FieldTextInput.htmlInput_.value = Blockly.FieldTextInput.htmlInput_.value * -1;
      } else if(originBlock.id == 'C') {
        Blockly.FieldTextInput.htmlInput_.value = 0;
      } else if(Blockly.FieldTextInput.htmlInput_.value.length == 1 && Blockly.FieldTextInput.htmlInput_.value == 0) {
        Blockly.FieldTextInput.htmlInput_.value = originBlock.id;
      } else {
        Blockly.FieldTextInput.htmlInput_.value = Blockly.FieldTextInput.htmlInput_.value + originBlock.id;
      }
    }
  };
};

/**
 * Insert a degree symbol.
 * @param {?string} text New text.
 */
Blockly.FieldNumberpad.prototype.setText = function(text) {
  Blockly.FieldNumberpad.superClass_.setText.call(this, text);
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};