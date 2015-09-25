/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Library to create tooltips for Blockly.
 * First, call Blockly.Tooltip.init() after onload.
 * Second, set the 'tooltip' property on any SVG element that needs a tooltip.
 * If the tooltip is a string, then that message will be displayed.
 * If the tooltip is an SVG element, then that object's tooltip will be used.
 * Third, call Blockly.Tooltip.bindMouseEvents(e) passing the SVG element.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Tooltip');

goog.require('goog.dom');


/**
 * Class for a Tooltip.
 * Creates the Tooltip's DOM.
 * @param {!Blockly.Workspace} workspace The workspace in which to create new tooltip.
 * @constructor
 */
Blockly.Tooltip = function(workspace) {
  /**
   * @type {!Blockly.Workspace}
   * @private
   */
  this.workspace_ = workspace;
};


/**
 * Is a tooltip currently showing?
 */
Blockly.Tooltip.prototype.visible = false;

/**
 * Maximum width (in characters) of a tooltip.
 */
Blockly.Tooltip.prototype.LIMIT = 50;

/**
 * PID of suspended thread to clear tooltip on mouse out.
 * @private
 */
Blockly.Tooltip.prototype.mouseOutPid_ = 0;

/**
 * PID of suspended thread to show the tooltip.
 * @private
 */
Blockly.Tooltip.prototype.showPid_ = 0;

/**
 * Last observed X location of the mouse pointer (freezes when tooltip appears).
 * @private
 */
Blockly.Tooltip.prototype.lastX_ = 0;

/**
 * Last observed Y location of the mouse pointer (freezes when tooltip appears).
 * @private
 */
Blockly.Tooltip.prototype.lastY_ = 0;

/**
 * Current element being pointed at.
 * @private
 */
Blockly.Tooltip.prototype.element_ = null;

/**
 * Once a tooltip has opened for an element, that element is 'poisoned' and
 * cannot respawn a tooltip until the pointer moves over a different element.
 * @private
 */
Blockly.Tooltip.prototype.poisonedElement_ = null;

/**
 * Horizontal offset between mouse cursor and tooltip.
 */
Blockly.Tooltip.prototype.OFFSET_X = 0;

/**
 * Vertical offset between mouse cursor and tooltip.
 */
Blockly.Tooltip.prototype.OFFSET_Y = 10;

/**
 * Radius mouse can move before killing tooltip.
 */
Blockly.Tooltip.prototype.RADIUS_OK = 10;

/**
 * Delay before tooltip appears.
 */
Blockly.Tooltip.prototype.HOVER_MS = 1000;

/**
 * Horizontal padding between tooltip and screen edge.
 */
Blockly.Tooltip.prototype.MARGINS = 5;

/**
 * The HTML container.  Set once by Blockly.Tooltip.createDom.
 * @type {Element}
 */
Blockly.Tooltip.prototype.DIV = null;

/**
 * Create the tooltip div and inject it onto the page.
 */
Blockly.Tooltip.prototype.createDom = function() {
  if (this.DIV) {
    return;  // Already created.
  }
  // Create an HTML container for popup overlays (e.g. editor widgets).
  this.DIV = goog.dom.createDom('div', 'blocklyTooltipDiv');
  
  var svg = this.workspace_.options.svg;
  svg.parentNode.insertBefore(this.DIV, svg);
};

/**
 * Binds the required mouse events onto an SVG element.
 * @param {!Element} element SVG element onto which tooltip is to be bound.
 */
Blockly.Tooltip.prototype.bindMouseEvents = function(element) {
  Blockly.bindEvent_(element, 'mouseover', this, this.onMouseOver_);
  Blockly.bindEvent_(element, 'mouseout', this, this.onMouseOut_);
  Blockly.bindEvent_(element, 'mousemove', this, this.onMouseMove_);
};

/**
 * Hide the tooltip if the mouse is over a different object.
 * Initialize the tooltip to potentially appear for this object.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.prototype.onMouseOver_ = function(e) {
  // If the tooltip is an object, treat it as a pointer to the next object in
  // the chain to look at.  Terminate when a string or function is found.
  var element = e.target;
  while (!goog.isString(element.tooltip) && !goog.isFunction(element.tooltip)) {
    element = element.tooltip;
  }
  if (this.element_ != element) {
    this.hide();
    this.poisonedElement_ = null;
    this.element_ = element;
  }
  // Forget about any immediately preceeding mouseOut event.
  clearTimeout(this.mouseOutPid_);
};

/**
 * Hide the tooltip if the mouse leaves the object and enters the workspace.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.prototype.onMouseOut_ = function(e) {
  // Moving from one element to another (overlapping or with no gap) generates
  // a mouseOut followed instantly by a mouseOver.  Fork off the mouseOut
  // event and kill it if a mouseOver is received immediately.
  // This way the task only fully executes if mousing into the void.
  var self = this;
  this.mouseOutPid_ = setTimeout(function() {
        self.element_ = null;
        self.poisonedElement_ = null;
        self.hide();
      }, 1);
  clearTimeout(this.showPid_);
};

/**
 * When hovering over an element, schedule a tooltip to be shown.  If a tooltip
 * is already visible, hide it if the mouse strays out of a certain radius.
 * @param {!Event} e Mouse event.
 * @private
 */
Blockly.Tooltip.prototype.onMouseMove_ = function(e) {
  if (!this.element_ || !this.element_.tooltip) {
    // No tooltip here to show.
    return;
  } else if (Blockly.dragMode_ != 0) {
    // Don't display a tooltip during a drag.
    return;
  } else if (this.workspace_ && this.workspace_.WidgetDiv_ && this.workspace_.WidgetDiv_.isVisible()) {
    // Don't display a tooltip if a widget is open (tooltip would be under it).
    return;
  }
  if (this.visible) {
    // Compute the distance between the mouse position when the tooltip was
    // shown and the current mouse position.  Pythagorean theorem.
    var dx = this.lastX_ - e.pageX;
    var dy = this.lastY_ - e.pageY;
    if (Math.sqrt(dx * dx + dy * dy) > this.RADIUS_OK) {
      this.hide();
    }
  } else if (this.poisonedElement_ != this.element_) {
    // The mouse moved, clear any previously scheduled tooltip.
    clearTimeout(this.showPid_);
    // Maybe this time the mouse will stay put.  Schedule showing of tooltip.
    this.lastX_ = e.pageX;
    this.lastY_ = e.pageY;
    var self = this;
    this.showPid_ = setTimeout(function() { self.show_(); }, this.HOVER_MS);
  }
};

/**
 * Hide the tooltip.
 */
Blockly.Tooltip.prototype.hide = function() {
  if (this.visible) {
    this.visible = false;
    if (this.DIV) {
      this.DIV.style.display = 'none';
    }
  }
  clearTimeout(this.showPid_);
};

/**
 * Create the tooltip and show it.
 * @private
 */
Blockly.Tooltip.prototype.show_ = function() {
  this.poisonedElement_ = this.element_;
  if (!this.DIV) {
    return;
  }
  // Erase all existing text.
  goog.dom.removeChildren(/** @type {!Element} */ (this.DIV));
  // Get the new text.
  var tip = this.element_.tooltip;
  if (goog.isFunction(tip)) {
    tip = tip();
  }
  tip = this.wrap_(tip, this.LIMIT);
  // Create new text, line by line.
  var lines = tip.split('\n');
  var self = this;
  for (var i = 0; i < lines.length; i++) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(lines[i]));
    self.DIV.appendChild(div);
  }
  var rtl = this.element_.RTL;
  var windowSize = goog.dom.getViewportSize();
  // Display the tooltip.
  this.DIV.style.direction = rtl ? 'rtl' : 'ltr';
  this.DIV.style.display = 'block';
  this.visible = true;
  // Move the tooltip to just below the cursor.
  var anchorX = this.lastX_;
  if (rtl) {
    anchorX -= this.OFFSET_X + this.DIV.offsetWidth;
  } else {
    anchorX += this.OFFSET_X;
  }
  var anchorY = this.lastY_ + this.OFFSET_Y;

  if (anchorY + this.DIV.offsetHeight >
      windowSize.height + window.scrollY) {
    // Falling off the bottom of the screen; shift the tooltip up.
    anchorY -= this.DIV.offsetHeight + 2 * this.OFFSET_Y;
  }
  if (rtl) {
    // Prevent falling off left edge in RTL mode.
    anchorX = Math.max(this.MARGINS - window.scrollX, anchorX);
  } else {
    if (anchorX + this.DIV.offsetWidth >
        windowSize.width + window.scrollX - 2 * this.MARGINS) {
      // Falling off the right edge of the screen;
      // clamp the tooltip on the edge.
      anchorX = windowSize.width - this.DIV.offsetWidth -
          2 * this.MARGINS;
    }
  }
  this.DIV.style.top = anchorY + 'px';
  this.DIV.style.left = anchorX + 'px';
};

/**
 * Wrap text to the specified width.
 * @param {string} text Text to wrap.
 * @param {number} limit Width to wrap each line.
 * @return {string} Wrapped text.
 * @private
 */
Blockly.Tooltip.prototype.wrap_ = function(text, limit) {
  if (text.length <= limit) {
    // Short text, no need to wrap.
    return text;
  }
  // Split the text into words.
  var words = text.trim().split(/\s+/);
  // Set limit to be the length of the largest word.
  for (var i = 0; i < words.length; i++) {
    if (words[i].length > limit) {
      limit = words[i].length;
    }
  }

  var lastScore;
  var score = -Infinity;
  var lastText;
  var lineCount = 1;
  var self = this;
  do {
    lastScore = score;
    lastText = text;
    // Create a list of booleans representing if a space (false) or
    // a break (true) appears after each word.
    var wordBreaks = [];
    // Seed the list with evenly spaced linebreaks.
    var steps = words.length / lineCount;
    var insertedBreaks = 1;
    for (var i = 0; i < words.length - 1; i++) {
      if (insertedBreaks < (i + 1.5) / steps) {
        insertedBreaks++;
        wordBreaks[i] = true;
      } else {
        wordBreaks[i] = false;
      }
    }
    wordBreaks = self.wrapMutate_(words, wordBreaks, limit);
    score = self.wrapScore_(words, wordBreaks, limit);
    text = self.wrapToText_(words, wordBreaks);
    lineCount++;
  } while (score > lastScore);
  return lastText;
};

/**
 * Compute a score for how good the wrapping is.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {number} Larger the better.
 * @private
 */
Blockly.Tooltip.prototype.wrapScore_ = function(words, wordBreaks, limit) {
  // If this function becomes a performance liability, add caching.
  // Compute the length of each line.
  var lineLengths = [0];
  var linePunctuation = [];
  for (var i = 0; i < words.length; i++) {
    lineLengths[lineLengths.length - 1] += words[i].length;
    if (wordBreaks[i] === true) {
      lineLengths.push(0);
      linePunctuation.push(words[i].charAt(words[i].length - 1));
    } else if (wordBreaks[i] === false) {
      lineLengths[lineLengths.length - 1]++;
    }
  }
  var maxLength = Math.max.apply(Math, lineLengths);

  var score = 0;
  for (var i = 0; i < lineLengths.length; i++) {
    // Optimize for width.
    // -2 points per char over limit (scaled to the power of 1.5).
    score -= Math.pow(Math.abs(limit - lineLengths[i]), 1.5) * 2;
    // Optimize for even lines.
    // -1 point per char smaller than max (scaled to the power of 1.5).
    score -= Math.pow(maxLength - lineLengths[i], 1.5);
    // Optimize for structure.
    // Add score to line endings after punctuation.
    if ('.?!'.indexOf(linePunctuation[i]) != -1) {
      score += limit / 3;
    } else if (',;)]}'.indexOf(linePunctuation[i]) != -1) {
      score += limit / 4;
    }
  }
  // All else being equal, the last line should not be longer than the
  // previous line.  For example, this looks wrong:
  // aaa bbb
  // ccc ddd eee
  if (lineLengths.length > 1 && lineLengths[lineLengths.length - 1] <=
      lineLengths[lineLengths.length - 2]) {
    score += 0.5;
  }
  return score;
};

/**
 * Mutate the array of line break locations until an optimal solution is found.
 * No line breaks are added or deleted, they are simply moved around.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @param {number} limit Width to wrap each line.
 * @return {!Array.<boolean>} New array of optimal line breaks.
 * @private
 */
Blockly.Tooltip.prototype.wrapMutate_ = function(words, wordBreaks, limit) {
  var bestScore = this.wrapScore_(words, wordBreaks, limit);
  var bestBreaks;
  var self=  this;
  // Try shifting every line break forward or backward.
  for (var i = 0; i < wordBreaks.length - 1; i++) {
    if (wordBreaks[i] == wordBreaks[i + 1]) {
      continue;
    }
    var mutatedWordBreaks = [].concat(wordBreaks);
    mutatedWordBreaks[i] = !mutatedWordBreaks[i];
    mutatedWordBreaks[i + 1] = !mutatedWordBreaks[i + 1];
    var mutatedScore =
        self.wrapScore_(words, mutatedWordBreaks, limit);
    if (mutatedScore > bestScore) {
      bestScore = mutatedScore;
      bestBreaks = mutatedWordBreaks;
    }
  }
  if (bestBreaks) {
    // Found an improvement.  See if it may be improved further.
    return self.wrapMutate_(words, bestBreaks, limit);
  }
  // No improvements found.  Done.
  return wordBreaks;
};

/**
 * Reassemble the array of words into text, with the specified line breaks.
 * @param {!Array.<string>} words Array of each word.
 * @param {!Array.<boolean>} wordBreaks Array of line breaks.
 * @return {string} Plain text.
 * @private
 */
Blockly.Tooltip.prototype.wrapToText_ = function(words, wordBreaks) {
  var text = [];
  for (var i = 0; i < words.length; i++) {
    text.push(words[i]);
    if (wordBreaks[i] !== undefined) {
      text.push(wordBreaks[i] ? '\n' : ' ');
    }
  }
  return text.join('');
};
