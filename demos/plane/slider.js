/**
 * Blockly Demos: SVG Slider
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview A slider control in SVG.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/**
 * Object representing a horizontal slider widget.
 * @param {number} x The horizontal offset of the slider.
 * @param {number} y The vertical offset of the slider.
 * @param {number} width The total width of the slider.
 * @param {!Element} svgParent The SVG element to append the slider to.
 * @param {Function} opt_changeFunc Optional callback function that will be
 *     called when the slider is moved.  The current value is passed.
 * @constructor
 */
var Slider = function(x, y, width, svgParent, opt_changeFunc) {
  this.KNOB_Y_ = y - 12;
  this.KNOB_MIN_X_ = x + 8;
  this.KNOB_MAX_X_ = x + width - 8;
  this.TARGET_OVERHANG_ = 20;
  this.value_ = 0.5;
  this.changeFunc_ = opt_changeFunc;
  this.animationTasks_ = [];

  // Draw the slider.
  /*
  <line class="sliderTrack" x1="10" y1="35" x2="140" y2="35" />
  <rect style="opacity: 0" x="5" y="25" width="150" height="20" />
  <path id="knob"
      transform="translate(67, 23)"
      d="m 8,0 l -8,8 v 12 h 16 v -12 z" />
  <circle style="opacity: 0" r="20" cy="35" cx="75"></circle>
  */
  var track = document.createElementNS(Slider.SVG_NS_, 'line');
  track.setAttribute('class', 'sliderTrack');
  track.setAttribute('x1', x);
  track.setAttribute('y1', y);
  track.setAttribute('x2', x + width);
  track.setAttribute('y2', y);
  svgParent.appendChild(track);
  this.track_ = track;
  var rect = document.createElementNS(Slider.SVG_NS_, 'rect');
  rect.setAttribute('style', 'opacity: 0');
  rect.setAttribute('x', x - this.TARGET_OVERHANG_);
  rect.setAttribute('y', y - this.TARGET_OVERHANG_);
  rect.setAttribute('width',  width + 2 * this.TARGET_OVERHANG_);
  rect.setAttribute('height', 2 * this.TARGET_OVERHANG_);
  rect.setAttribute('rx', this.TARGET_OVERHANG_);
  rect.setAttribute('ry', this.TARGET_OVERHANG_);
  svgParent.appendChild(rect);
  this.trackTarget_ = rect;
  var knob = document.createElementNS(Slider.SVG_NS_, 'path');
  knob.setAttribute('class', 'sliderKnob');
  knob.setAttribute('d', 'm 0,0 l -8,8 v 12 h 16 v -12 z');
  svgParent.appendChild(knob);
  this.knob_ = knob;
  var circle = document.createElementNS(Slider.SVG_NS_, 'circle');
  circle.setAttribute('style', 'opacity: 0');
  circle.setAttribute('r', this.TARGET_OVERHANG_);
  circle.setAttribute('cy', y);
  svgParent.appendChild(circle);
  this.knobTarget_ = circle;
  this.setValue(0.5);

  // Find the root SVG object.
  while (svgParent && svgParent.nodeName.toLowerCase() != 'svg') {
    svgParent = svgParent.parentNode;
  }
  this.SVG_ = svgParent;

  // Bind the events to this slider.
  Slider.bindEvent_(this.knobTarget_, 'mousedown', this, this.knobMouseDown_);
  Slider.bindEvent_(this.knobTarget_, 'touchstart', this, this.knobMouseDown_);
  Slider.bindEvent_(this.trackTarget_, 'mousedown', this, this.rectMouseDown_);
  Slider.bindEvent_(this.SVG_, 'mouseup', null, Slider.knobMouseUp_);
  Slider.bindEvent_(this.SVG_, 'touchend', null, Slider.knobMouseUp_);
  Slider.bindEvent_(this.SVG_, 'mousemove', null, Slider.knobMouseMove_);
  Slider.bindEvent_(this.SVG_, 'touchmove', null, Slider.knobMouseMove_);
  Slider.bindEvent_(document, 'mouseover', null, Slider.mouseOver_);
};


Slider.SVG_NS_ = 'http://www.w3.org/2000/svg';

Slider.activeSlider_ = null;
Slider.startMouseX_ = 0;
Slider.startKnobX_ = 0;

/**
 * Start a drag when clicking down on the knob.
 * @param {!Event} e Mouse-down event.
 * @private
 */
Slider.prototype.knobMouseDown_ = function(e) {
  if (e.type == 'touchstart') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Slider.touchToMouse_(e)
  }
  Slider.activeSlider_ = this;
  Slider.startMouseX_ = this.mouseToSvg_(e).x;
  Slider.startKnobX_ = 0;
  var transform = this.knob_.getAttribute('transform');
  if (transform) {
    var r = transform.match(/translate\(\s*([-\d.]+)/);
    if (r) {
      Slider.startKnobX_ = Number(r[1]);
    }
  }
  // Stop browser from attempting to drag the knob or
  // from scrolling/zooming the page.
  e.preventDefault();
};

/**
 * Stop a drag when clicking up anywhere.
 * @param {Event} e Mouse-up event.
 * @private
 */
Slider.knobMouseUp_ = function(e) {
  Slider.activeSlider_ = null;
};

/**
 * Stop a drag when the mouse enters a node not part of the SVG.
 * @param {Event} e Mouse-up event.
 * @private
 */
Slider.mouseOver_ = function(e) {
  if (!Slider.activeSlider_) {
    return;
  }
  var node = e.target;
  // Find the root SVG object.
  do {
    if (node == Slider.activeSlider_.SVG_) {
      return;
    }
  } while (node = node.parentNode);
  Slider.knobMouseUp_(e);
};

/**
 * Drag the knob to follow the mouse.
 * @param {!Event} e Mouse-move event.
 * @private
 */
Slider.knobMouseMove_ = function(e) {
  var thisSlider = Slider.activeSlider_;
  if (!thisSlider) {
    return;
  }
  if (e.type == 'touchmove') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Slider.touchToMouse_(e)
  }
  var x = thisSlider.mouseToSvg_(e).x - Slider.startMouseX_ +
      Slider.startKnobX_;
  thisSlider.setValue((x - thisSlider.KNOB_MIN_X_) /
      (thisSlider.KNOB_MAX_X_ - thisSlider.KNOB_MIN_X_));
};

/**
 * Jump to a new value when the track is clicked.
 * @param {!Event} e Mouse-down event.
 * @private
 */
Slider.prototype.rectMouseDown_ = function(e) {
  if (e.type == 'touchstart') {
    if (e.changedTouches.length != 1) {
      return;
    }
    Slider.touchToMouse_(e)
  }
  var x = this.mouseToSvg_(e).x;
  this.animateValue((x - this.KNOB_MIN_X_) /
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_));
};

/**
 * Returns the slider's value (0.0 - 1.0).
 * @return {number} Current value.
 */
Slider.prototype.getValue = function() {
  return this.value_;
};

/**
 * Animates the slider's value (0.0 - 1.0).
 * @param {number} value New value.
 */
Slider.prototype.animateValue = function(value) {
  // Clear any ongoing animations.
  while (this.animationTasks_.length) {
    clearTimeout(this.animationTasks_.pop());
  }
  var duration = 200; // Milliseconds to animate for.
  var steps = 10; // Number of steps to animate.
  var oldValue = this.getValue();
  var thisSlider = this;
  var stepFunc = function(i) {
    return function() {
      var newVal = i * (value - oldValue) / (steps - 1) + oldValue;
      thisSlider.setValue(newVal);
    };
  }
  for (var i = 0; i < steps; i++) {
    this.animationTasks_.push(setTimeout(stepFunc(i), i * duration / steps));
  }
};

/**
 * Sets the slider's value (0.0 - 1.0).
 * @param {number} value New value.
 */
Slider.prototype.setValue = function(value) {
  this.value_ = Math.min(Math.max(value, 0), 1);
  var x = this.KNOB_MIN_X_ +
      (this.KNOB_MAX_X_ - this.KNOB_MIN_X_) * this.value_;
  this.knob_.setAttribute('transform',
      'translate(' + x + ',' + this.KNOB_Y_ + ')');
  this.knobTarget_.setAttribute('cx', x);
  this.changeFunc_ && this.changeFunc_(this.value_);
};

/**
 * Convert the mouse coordinates into SVG coordinates.
 * @param {!Object} e Object with x and y mouse coordinates.
 * @return {!Object} Object with x and y properties in SVG coordinates.
 * @private
 */
Slider.prototype.mouseToSvg_ = function(e) {
  var svgPoint = this.SVG_.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;
  var matrix = this.SVG_.getScreenCTM().inverse();
  return svgPoint.matrixTransform(matrix);
};

/**
 * Bind an event to a function call.
 * @param {!Node} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @private
 */
Slider.bindEvent_ = function(node, name, thisObject, func) {
  var wrapFunc = function(e) {
    func.apply(thisObject, arguments);
  };
  node.addEventListener(name, wrapFunc, false);
};

/**
 * Map the touch event's properties to be compatible with a mouse event.
 * @param {TouchEvent} e Event to modify.
 */
Slider.touchToMouse_ = function(e) {
  var touchPoint = e.changedTouches[0];
  e.clientX = touchPoint.clientX;
  e.clientY = touchPoint.clientY;
};
