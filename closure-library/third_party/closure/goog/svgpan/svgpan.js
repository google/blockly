/**
 *  SVGPan library 1.2.2
 * ======================
 *
 * Given an unique existing element with a given id (or by default, the first
 * g-element), including the library into any SVG adds the following
 * capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Object dragging
 *
 * You can configure the behaviour of the pan/zoom/drag via setOptions().
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.2.2, Tue Aug 30 17:21:56 CEST 2011, Andrea Leofreddi
 *  - Fixed viewBox on root tag (#7)
 *  - Improved zoom speed (#2)
 *
 * 1.2.1, Mon Jul  4 00:33:18 CEST 2011, Andrea Leofreddi
 *  - Fixed a regression with mouse wheel (now working on Firefox 5)
 *  - Working with viewBox attribute (#4)
 *  - Added "use strict;" and fixed resulting warnings (#5)
 *  - Added configuration variables, dragging is disabled by default (#3)
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *  Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *  Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *  First release
 */

/**
 * @license
 * This code is licensed under the following BSD license:
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights
 * reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL Andrea Leofreddi OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are
 * those of the authors and should not be interpreted as representing official
 * policies, either expressed or implied, of Andrea Leofreddi.
 *
 */

goog.provide('svgpan.SvgPan');

goog.require('goog.Disposable');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.MouseWheelHandler');



/**
 * Instantiates an SvgPan object.
 * @param {string=} opt_graphElementId The id of the graph element.
 * @param {Element=} opt_root An optional document root.
 * @constructor
 * @extends {goog.Disposable}
 */
svgpan.SvgPan = function(opt_graphElementId, opt_root) {
  svgpan.SvgPan.base(this, 'constructor');

  /** @private {Element} */
  this.root_ = opt_root || document.documentElement;

  /** @private {?string} */
  this.graphElementId_ = opt_graphElementId || null;

  /** @private {boolean} */
  this.cancelNextClick_ = false;

  /** @private {boolean} */
  this.enablePan_ = true;

  /** @private {boolean} */
  this.enableZoom_ = true;

  /** @private {boolean} */
  this.enableDrag_ = false;

  /** @private {number} */
  this.zoomScale_ = 0.4;

  /** @private {svgpan.SvgPan.State} */
  this.state_ = svgpan.SvgPan.State.NONE;

  /** @private {Element} */
  this.svgRoot_ = null;

  /** @private {Element} */
  this.stateTarget_ = null;

  /** @private {SVGPoint} */
  this.stateOrigin_ = null;

  /** @private {SVGMatrix} */
  this.stateTf_ = null;

  /** @private {goog.events.MouseWheelHandler} */
  this.mouseWheelHandler_ = null;

  this.setupHandlers_();
};
goog.inherits(svgpan.SvgPan, goog.Disposable);


/** @override */
svgpan.SvgPan.prototype.disposeInternal = function() {
  svgpan.SvgPan.base(this, 'disposeInternal');
  goog.events.removeAll(this.root_);
  this.mouseWheelHandler_.dispose();
};


/**
 * @enum {string}
 */
svgpan.SvgPan.State = {
  NONE: 'none',
  PAN: 'pan',
  DRAG: 'drag'
};


/**
 * Enables/disables panning the entire SVG (default = true).
 * @param {boolean} enabled Whether or not to allow panning.
 */
svgpan.SvgPan.prototype.setPanEnabled = function(enabled) {
  this.enablePan_ = enabled;
};


/**
 * Enables/disables zooming (default = true).
 * @param {boolean} enabled Whether or not to allow zooming (default = true).
 */
svgpan.SvgPan.prototype.setZoomEnabled = function(enabled) {
  this.enableZoom_ = enabled;
};


/**
 * Enables/disables dragging individual SVG objects (default = false).
 * @param {boolean} enabled Whether or not to allow dragging of objects.
 */
svgpan.SvgPan.prototype.setDragEnabled = function(enabled) {
  this.enableDrag_ = enabled;
};


/**
 * Sets the sensitivity of mousewheel zooming (default = 0.4).
 * @param {number} scale The new zoom scale.
 */
svgpan.SvgPan.prototype.setZoomScale = function(scale) {
  this.zoomScale_ = scale;
};


/**
 * Registers mouse event handlers.
 * @private
 */
svgpan.SvgPan.prototype.setupHandlers_ = function() {
  goog.events.listen(this.root_, goog.events.EventType.CLICK,
      goog.bind(this.handleMouseClick_, this));
  goog.events.listen(this.root_, goog.events.EventType.MOUSEUP,
      goog.bind(this.handleMouseUp_, this));
  goog.events.listen(this.root_, goog.events.EventType.MOUSEDOWN,
      goog.bind(this.handleMouseDown_, this));
  goog.events.listen(this.root_, goog.events.EventType.MOUSEMOVE,
      goog.bind(this.handleMouseMove_, this));
  this.mouseWheelHandler_ = new goog.events.MouseWheelHandler(this.root_);
  goog.events.listen(this.mouseWheelHandler_,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
      goog.bind(this.handleMouseWheel_, this));
};


/**
 * Retrieves the root element for SVG manipulation. The element is then cached.
 * @param {Document} svgDoc The document.
 * @return {Element} The svg root.
 * @private
 */
svgpan.SvgPan.prototype.getRoot_ = function(svgDoc) {
  if (!this.svgRoot_) {
    var r = this.graphElementId_ ?
        svgDoc.getElementById(this.graphElementId_) : svgDoc.documentElement;
    var t = r;
    while (t != svgDoc) {
      if (t.getAttribute('viewBox')) {
        this.setCtm_(r, r.getCTM());
        t.removeAttribute('viewBox');
      }
      t = t.parentNode;
    }
    this.svgRoot_ = r;
  }
  return this.svgRoot_;
};


/**
 * Instantiates an SVGPoint object with given event coordinates.
 * @param {!goog.events.Event} evt The event with coordinates.
 * @return {SVGPoint} The created point.
 * @private
 */
svgpan.SvgPan.prototype.getEventPoint_ = function(evt) {
  return this.newPoint_(evt.clientX, evt.clientY);
};


/**
 * Instantiates an SVGPoint object with given coordinates.
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @return {SVGPoint} The created point.
 * @private
 */
svgpan.SvgPan.prototype.newPoint_ = function(x, y) {
  var p = this.root_.createSVGPoint();
  p.x = x;
  p.y = y;
  return p;
};


/**
 * Sets the current transform matrix of an element.
 * @param {Element} element The element.
 * @param {SVGMatrix} matrix The transform matrix.
 * @private
 */
svgpan.SvgPan.prototype.setCtm_ = function(element, matrix) {
  var s = 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' +
      matrix.d + ',' + matrix.e + ',' + matrix.f + ')';
  element.setAttribute('transform', s);
};


/**
 * Handle mouse wheel event.
 * @param {!goog.events.Event} evt The event.
 * @private
 */
svgpan.SvgPan.prototype.handleMouseWheel_ = function(evt) {
  if (!this.enableZoom_)
    return;

  // Prevents scrolling.
  evt.preventDefault();

  var svgDoc = evt.target.ownerDocument;

  var delta = evt.deltaY / -9;
  var z = Math.pow(1 + this.zoomScale_, delta);
  var g = this.getRoot_(svgDoc);
  var p = this.getEventPoint_(evt);
  p = p.matrixTransform(g.getCTM().inverse());

  // Compute new scale matrix in current mouse position
  var k = this.root_.createSVGMatrix().translate(
      p.x, p.y).scale(z).translate(-p.x, -p.y);
  this.setCtm_(g, g.getCTM().multiply(k));

  if (typeof(this.stateTf_) == 'undefined') {
    this.stateTf_ = g.getCTM().inverse();
  }
  this.stateTf_ =
      this.stateTf_ ? this.stateTf_.multiply(k.inverse()) : this.stateTf_;
};


/**
 * Handle mouse move event.
 * @param {!goog.events.Event} evt The event.
 * @private
 */
svgpan.SvgPan.prototype.handleMouseMove_ = function(evt) {
  if (evt.button != 0) {
    return;
  }
  this.handleMove(evt.clientX, evt.clientY, evt.target.ownerDocument);
};


/**
 * Handles mouse motion for the given coordinates.
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @param {Document} svgDoc The svg document.
 */
svgpan.SvgPan.prototype.handleMove = function(x, y, svgDoc) {
  var g = this.getRoot_(svgDoc);
  if (this.state_ == svgpan.SvgPan.State.PAN && this.enablePan_) {
    // Pan mode
    var p = this.newPoint_(x, y).matrixTransform(
        /** @type {!SVGMatrix} */ (this.stateTf_));
    this.setCtm_(g, this.stateTf_.inverse().translate(
        p.x - this.stateOrigin_.x, p.y - this.stateOrigin_.y));
    this.cancelNextClick_ = true;
  } else if (this.state_ == svgpan.SvgPan.State.DRAG && this.enableDrag_) {
    // Drag mode
    var p = this.newPoint_(x, y).matrixTransform(g.getCTM().inverse());
    this.setCtm_(this.stateTarget_, this.root_.createSVGMatrix().translate(
        p.x - this.stateOrigin_.x, p.y - this.stateOrigin_.y).multiply(
        g.getCTM().inverse()).multiply(this.stateTarget_.getCTM()));
    this.stateOrigin_ = p;
  }
};


/**
 * Handle click event.
 * @param {!goog.events.Event} evt The event.
 * @private
 */
svgpan.SvgPan.prototype.handleMouseDown_ = function(evt) {
  if (evt.button != 0) {
    return;
  }
  // Prevent selection while dragging.
  evt.preventDefault();
  var svgDoc = evt.target.ownerDocument;

  var g = this.getRoot_(svgDoc);

  if (evt.target.tagName == 'svg' || !this.enableDrag_) {
    // Pan mode
    this.state_ = svgpan.SvgPan.State.PAN;
    this.stateTf_ = g.getCTM().inverse();
    this.stateOrigin_ = this.getEventPoint_(evt).matrixTransform(this.stateTf_);
  } else {
    // Drag mode
    this.state_ = svgpan.SvgPan.State.DRAG;
    this.stateTarget_ = /** @type {Element} */ (evt.target);
    this.stateTf_ = g.getCTM().inverse();
    this.stateOrigin_ = this.getEventPoint_(evt).matrixTransform(this.stateTf_);
  }
};


/**
 * Handle mouse button release event.
 * @param {!goog.events.Event} evt The event.
 * @private
 */
svgpan.SvgPan.prototype.handleMouseUp_ = function(evt) {
  if (this.state_ != svgpan.SvgPan.State.NONE) {
    this.endPanOrDrag();
  }
};


/**
 * Ends pan/drag mode.
 */
svgpan.SvgPan.prototype.endPanOrDrag = function() {
  if (this.state_ != svgpan.SvgPan.State.NONE) {
    this.state_ = svgpan.SvgPan.State.NONE;
  }
};


/**
 * Handle mouse clicks.
 * @param {!goog.events.Event} evt The event.
 * @private
 */
svgpan.SvgPan.prototype.handleMouseClick_ = function(evt) {
  // We only set cancelNextClick_ after panning occurred, and use it to prevent
  // the default action that would otherwise take place when clicking on the
  // element (for instance, navigation on clickable links, but also any click
  // handler that may be set on an SVG element, in the case of active SVG
  // content)
  if (this.cancelNextClick_) {
    // Cancel potential click handler on active SVG content.
    evt.stopPropagation();
    // Cancel navigation when panning on clickable links.
    evt.preventDefault();
  }
  this.cancelNextClick_ = false;
};


/**
 * Returns the current state.
 * @return {!svgpan.SvgPan.State}
 */
svgpan.SvgPan.prototype.getState = function() {
  return this.state_;
};
