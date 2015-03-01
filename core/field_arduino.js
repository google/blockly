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

goog.provide('Blockly.FieldArduino');

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
Blockly.FieldArduino = function(text, opt_changeHandler) {
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
  Blockly.FieldArduino.superClass_.constructor.call(this,
    text, changeHandler);
};
goog.inherits(Blockly.FieldArduino, Blockly.FieldTextInput);

/**
 * Clone this FieldArduino.
 * @return {!Blockly.FieldArduino} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldArduino.prototype.clone = function() {
  return new Blockly.FieldArduino(this.getText(), this.changeHandler_);
};

/**
 * Round angles to the nearest 15 degrees when using mouse.
 * Set to 0 to disable rounding.
 */
Blockly.FieldArduino.ROUND = 15;

/**
 * Half the width of protractor image.
 */
Blockly.FieldArduino.HALF = 100 / 2;

/**
 * Radius of protractor circle.  Slightly smaller than protractor size since
 * otherwise SVG crops off half the border at the edges.
 */
Blockly.FieldArduino.RADIUS = Blockly.FieldArduino.HALF - 1;

/**
 * Clean up this FieldArduino, as well as the inherited FieldTextInput.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldArduino.prototype.dispose_ = function() {
  var thisField = this;
  return function() {
    Blockly.FieldArduino.superClass_.dispose_.call(thisField)();
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
Blockly.FieldArduino.prototype.showEditor_ = function() {
  var noFocus =
    goog.userAgent.MOBILE || goog.userAgent.ANDROID || goog.userAgent.IPAD;
  // Mobile browsers have issues with in-line textareas (focus & keyboards).
  Blockly.FieldArduino.superClass_.showEditor_.call(this, noFocus);
  var div = Blockly.WidgetDiv.DIV;
  if (!div.firstChild) {
    // Mobile interface uses window.prompt.
    return;
  }

  Blockly.WidgetDiv.show(this, null);

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
    'height': ((370 * scale) + (2 * squareWidth)) + 'px',
    'width': ((270 * scale) + (2 * squareWidth)) + 'px'
  }, div);
  //center rectangle
  var rectangle = Blockly.createSvgElement('rect', {
    'width': 250 * scale,
    'height': 350 * scale,
    'x': xshift,
    'y': squareHeight + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoRect'
  }, svg);
  //top squares
  var squarea = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'x': xbase + xshift,
    'y': pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var squareb = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'x': xbase + leftpad + rightpad + squareWidth * (1) + xshift,
    'y': pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var squarec = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'x': xbase + (leftpad + rightpad + squareWidth) * (2) + xshift,
    'y': pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  ///bottom squares
  var squared = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'x': xbase + xshift,
    'y': squareHeight + downshift + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var squaree = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'x': xbase + (leftpad + rightpad + squareWidth) * (1) + xshift,
    'y': squareHeight + downshift + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var squaref = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'x': xbase + (leftpad + rightpad + squareWidth) * (2) + xshift,
    'y': squareHeight + downshift + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  //side blocks
  //left squares
  var square1 = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'y': xbase + yshift + pad,
    'x': pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var square2 = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'y': xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad,
    'x': pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var square3 = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'y': xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad,
    'x': pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);
  //right squares
  var square4 = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'y': xbase + yshift + pad,
    'x': squareHeight + rightshift + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var square5 = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'y': xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad,
    'x': squareHeight + rightshift + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);

  var square6 = Blockly.createSvgElement('rect', {
    'width': squareWidth,
    'height': squareHeight,
    'y': xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad,
    'x': squareHeight + rightshift + pad,
    'rx': '5',
    'ry': '5',
    'class': 'blocklyArduinoSelector'
  }, svg);
 
  ///////////////text labels////////////////////
  //center labels
  var textIn = Blockly.createSvgElement('text', {
    'x': xbase + leftpad + rightpad + squareWidth * (1) + xshift-5,
    'y': pad+200,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoIO'
  }, svg);
  textIn.appendChild(document.createTextNode("Inputs"));

  var textOut = Blockly.createSvgElement('text', {
    'x': xbase + leftpad + rightpad + squareWidth * (1) + xshift-10,
    'y': pad+230,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoIO'
  }, svg);
  textOut.appendChild(document.createTextNode("Outputs"));

  //top label
  var texta = Blockly.createSvgElement('text', {
    'x': xbase + xshift+10,
    'y': pad+90,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoText'
  }, svg);
  texta.appendChild(document.createTextNode("A"));

  var textb = Blockly.createSvgElement('text', {
    'x': xbase + leftpad + rightpad + squareWidth * (1) + xshift+10,
    'y': pad+90,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoText'
  }, svg);
  textb.appendChild(document.createTextNode("B"));


  var textc = Blockly.createSvgElement('text', {
    'x': xbase + (leftpad + rightpad + squareWidth) * (2) + xshift+10,
    'y': pad+90,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoText'
  }, svg);
  textc.appendChild(document.createTextNode("C"));

  ///bottom labels
  var textd = Blockly.createSvgElement('text', {
    'x': xbase + xshift+10,
    'y': squareHeight + downshift + pad-10,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoText'
  }, svg);
  textd.appendChild(document.createTextNode("D"));

  var texte = Blockly.createSvgElement('text', {
    'x': xbase + (leftpad + rightpad + squareWidth) * (1) + xshift+10,
    'y': squareHeight + downshift + pad-10,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoText'
  }, svg);
  texte.appendChild(document.createTextNode("E"));

  var textf = Blockly.createSvgElement('text', {
    'x': xbase + (leftpad + rightpad + squareWidth) * (2) + xshift+10,
    'y': squareHeight + downshift + pad-10,
    'font-family': font,
    'fill': '#4DC4D9',
    'class': 'blocklyArduinoText'
  }, svg);
  textf.appendChild(document.createTextNode("F"));

  //left labels
  var text1 = Blockly.createSvgElement('text', {
    'y': xbase + yshift + pad+40,
    'x': pad+65,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoText'
  }, svg);
  text1.appendChild(document.createTextNode("1"));

  var text2 = Blockly.createSvgElement('text', {
    'y': xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+40,
    'x': pad+65,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoText'
  }, svg);
  text2.appendChild(document.createTextNode("2"));

  var text3 = Blockly.createSvgElement('text', {
    'y': xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+40,
    'x': pad+65,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoText'
  }, svg);
  text3.appendChild(document.createTextNode("3"));
  //right labels
  var text4 = Blockly.createSvgElement('text', {
    'y': xbase + yshift + pad+40,
    'x': squareHeight + rightshift + pad-40,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoText'
  }, svg);
  text4.appendChild(document.createTextNode("4"));

  var text5 = Blockly.createSvgElement('text', {
    'y': xbase + (leftpad + rightpad + squareWidth) * (1) + yshift + pad+40,
    'x': squareHeight + rightshift + pad-40,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoText'
  }, svg);
  text5.appendChild(document.createTextNode("5"));

  var text6 = Blockly.createSvgElement('text', {
    'y': xbase + (leftpad + rightpad + squareWidth) * (2) + yshift + pad+40,
    'x': squareHeight + rightshift + pad-40,
    'font-family': font,
    'fill': '#8EDD65',
    'class': 'blocklyArduinoText'
  }, svg);
  text6.appendChild(document.createTextNode("6"));

 
  this.clickWrapper_ =
    Blockly.bindEvent_(svg, 'mousedown', this, Blockly.WidgetDiv.hide);
  this.clickWrapper_ =
    Blockly.bindEvent_(rectangle, 'mousedown', this, this.createBlockFunc_(rectangle));
  this.clickWrapper_ =
    Blockly.bindEvent_(squarea, 'mousedown', this, this.createBlockFunc_("Output A"));
  this.clickWrapper_ =
    Blockly.bindEvent_(squareb, 'mousedown', this, this.createBlockFunc_("Output B"));
  this.clickWrapper_ =
    Blockly.bindEvent_(squarec, 'mousedown', this, this.createBlockFunc_("Output C"));
  this.clickWrapper_ =
    Blockly.bindEvent_(squared, 'mousedown', this, this.createBlockFunc_("Output D"));
  this.clickWrapper_ =
    Blockly.bindEvent_(squaree, 'mousedown', this, this.createBlockFunc_("Output E"));
  this.clickWrapper_ =
    Blockly.bindEvent_(squaref, 'mousedown', this, this.createBlockFunc_("Output F"));
  this.clickWrapper_ =
    Blockly.bindEvent_(square1, 'mousedown', this, this.createBlockFunc_("Input 1"));
  this.clickWrapper_ =
    Blockly.bindEvent_(square2, 'mousedown', this, this.createBlockFunc_("Input 3"));
  this.clickWrapper_ =
    Blockly.bindEvent_(square3, 'mousedown', this, this.createBlockFunc_("Input 3"));
  this.clickWrapper_ =
    Blockly.bindEvent_(square4, 'mousedown', this, this.createBlockFunc_("Input 4"));
  this.clickWrapper_ =
    Blockly.bindEvent_(square5, 'mousedown', this, this.createBlockFunc_("Input 5"));
  this.clickWrapper_ =
    Blockly.bindEvent_(square6, 'mousedown', this, this.createBlockFunc_("Input 6"));
};

Blockly.FieldArduino.prototype.createBlockFunc_ = function(value) {
  var FieldArduino = this;
  return function(e) {
    FieldArduino.setText(value);
  };
};

/**
 * Insert a degree symbol.
 * @param {?string} text New text.
 */
Blockly.FieldArduino.prototype.setText = function(text) {
  Blockly.FieldArduino.superClass_.setText.call(this, text);
  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;
};
