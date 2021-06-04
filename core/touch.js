/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Touch handling for Blockly.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * @name Blockly.Touch
 * @namespace
 */
goog.provide('Blockly.Touch');

/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.utils');
goog.require('Blockly.utils.global');
goog.require('Blockly.utils.string');

goog.requireType('Blockly.Gesture');


/**
  * Whether touch is enabled in the browser.
  * Copied from Closure's goog.events.BrowserFeature.TOUCH_ENABLED
  */
Blockly.Touch.TOUCH_ENABLED =
    ('ontouchstart' in Blockly.utils.global ||
     !!(Blockly.utils.global['document'] && document.documentElement &&
        'ontouchstart' in document.documentElement) ||
     // IE10 uses non-standard touch events, so it has a different check.
     !!(Blockly.utils.global['navigator'] &&
        (Blockly.utils.global['navigator']['maxTouchPoints'] ||
         Blockly.utils.global['navigator']['msMaxTouchPoints'])));

/**
 * Which touch events are we currently paying attention to?
 * @type {?string}
 * @private
 */
Blockly.Touch.touchIdentifier_ = null;

/**
 * The TOUCH_MAP lookup dictionary specifies additional touch events to fire,
 * in conjunction with mouse events.
 * @type {Object}
 */
Blockly.Touch.TOUCH_MAP = {};
if (Blockly.utils.global['PointerEvent']) {
  Blockly.Touch.TOUCH_MAP = {
    'mousedown': ['pointerdown'],
    'mouseenter': ['pointerenter'],
    'mouseleave': ['pointerleave'],
    'mousemove': ['pointermove'],
    'mouseout': ['pointerout'],
    'mouseover': ['pointerover'],
    'mouseup': ['pointerup', 'pointercancel'],
    'touchend': ['pointerup'],
    'touchcancel': ['pointercancel']
  };
} else if (Blockly.Touch.TOUCH_ENABLED) {
  Blockly.Touch.TOUCH_MAP = {
    'mousedown': ['touchstart'],
    'mousemove': ['touchmove'],
    'mouseup': ['touchend', 'touchcancel']
  };
}

/**
 * PID of queued long-press task.
 * @private
 */
Blockly.longPid_ = 0;

/**
 * Context menus on touch devices are activated using a long-press.
 * Unfortunately the contextmenu touch event is currently (2015) only supported
 * by Chrome.  This function is fired on any touchstart event, queues a task,
 * which after about a second opens the context menu.  The tasks is killed
 * if the touch event terminates early.
 * @param {!Event} e Touch start event.
 * @param {Blockly.Gesture} gesture The gesture that triggered this longStart.
 * @package
 */
Blockly.longStart = function(e, gesture) {
  Blockly.longStop_();
  // Punt on multitouch events.
  if (e.changedTouches && e.changedTouches.length != 1) {
    return;
  }
  Blockly.longPid_ = setTimeout(function() {
    // Additional check to distinguish between touch events and pointer events
    if (e.changedTouches) {
      // TouchEvent
      e.button = 2;  // Simulate a right button click.
      // e was a touch event.  It needs to pretend to be a mouse event.
      e.clientX = e.changedTouches[0].clientX;
      e.clientY = e.changedTouches[0].clientY;
    }

    // Let the gesture route the right-click correctly.
    if (gesture) {
      gesture.handleRightClick(e);
    }

  }, Blockly.LONGPRESS);
};

/**
 * Nope, that's not a long-press.  Either touchend or touchcancel was fired,
 * or a drag hath begun.  Kill the queued long-press task.
 * @package
 */
Blockly.longStop_ = function() {
  if (Blockly.longPid_) {
    clearTimeout(Blockly.longPid_);
    Blockly.longPid_ = 0;
  }
};

/**
 * Clear the touch identifier that tracks which touch stream to pay attention
 * to.  This ends the current drag/gesture and allows other pointers to be
 * captured.
 */
Blockly.Touch.clearTouchIdentifier = function() {
  Blockly.Touch.touchIdentifier_ = null;
};

/**
 * Decide whether Blockly should handle or ignore this event.
 * Mouse and touch events require special checks because we only want to deal
 * with one touch stream at a time.  All other events should always be handled.
 * @param {!Event} e The event to check.
 * @return {boolean} True if this event should be passed through to the
 *     registered handler; false if it should be blocked.
 */
Blockly.Touch.shouldHandleEvent = function(e) {
  return !Blockly.Touch.isMouseOrTouchEvent(e) ||
      Blockly.Touch.checkTouchIdentifier(e);
};

/**
 * Get the touch identifier from the given event.  If it was a mouse event, the
 * identifier is the string 'mouse'.
 * @param {!Event} e Mouse event or touch event.
 * @return {string} The touch identifier from the first changed touch, if
 *     defined.  Otherwise 'mouse'.
 */
Blockly.Touch.getTouchIdentifierFromEvent = function(e) {
  return e.pointerId != undefined ? e.pointerId :
      (e.changedTouches && e.changedTouches[0] &&
      e.changedTouches[0].identifier !== undefined &&
      e.changedTouches[0].identifier !== null) ?
      e.changedTouches[0].identifier : 'mouse';
};

/**
 * Check whether the touch identifier on the event matches the current saved
 * identifier.  If there is no identifier, that means it's a mouse event and
 * we'll use the identifier "mouse".  This means we won't deal well with
 * multiple mice being used at the same time.  That seems okay.
 * If the current identifier was unset, save the identifier from the
 * event.  This starts a drag/gesture, during which touch events with other
 * identifiers will be silently ignored.
 * @param {!Event} e Mouse event or touch event.
 * @return {boolean} Whether the identifier on the event matches the current
 *     saved identifier.
 */
Blockly.Touch.checkTouchIdentifier = function(e) {
  var identifier = Blockly.Touch.getTouchIdentifierFromEvent(e);

  // if (Blockly.touchIdentifier_) is insufficient because Android touch
  // identifiers may be zero.
  if (Blockly.Touch.touchIdentifier_ !== undefined &&
      Blockly.Touch.touchIdentifier_ !== null) {
    // We're already tracking some touch/mouse event.  Is this from the same
    // source?
    return Blockly.Touch.touchIdentifier_ == identifier;
  }
  if (e.type == 'mousedown' || e.type == 'touchstart' ||
      e.type == 'pointerdown') {
    // No identifier set yet, and this is the start of a drag.  Set it and
    // return.
    Blockly.Touch.touchIdentifier_ = identifier;
    return true;
  }
  // There was no identifier yet, but this wasn't a start event so we're going
  // to ignore it.  This probably means that another drag finished while this
  // pointer was down.
  return false;
};

/**
 * Set an event's clientX and clientY from its first changed touch.  Use this to
 * make a touch event work in a mouse event handler.
 * @param {!Event} e A touch event.
 */
Blockly.Touch.setClientFromTouch = function(e) {
  if (Blockly.utils.string.startsWith(e.type, 'touch')) {
    // Map the touch event's properties to the event.
    var touchPoint = e.changedTouches[0];
    e.clientX = touchPoint.clientX;
    e.clientY = touchPoint.clientY;
  }
};

/**
 * Check whether a given event is a mouse or touch event.
 * @param {!Event} e An event.
 * @return {boolean} True if it is a mouse or touch event; false otherwise.
 */
Blockly.Touch.isMouseOrTouchEvent = function(e) {
  return Blockly.utils.string.startsWith(e.type, 'touch') ||
      Blockly.utils.string.startsWith(e.type, 'mouse') ||
      Blockly.utils.string.startsWith(e.type, 'pointer');
};

/**
 * Check whether a given event is a touch event or a pointer event.
 * @param {!Event} e An event.
 * @return {boolean} True if it is a touch event; false otherwise.
 */
Blockly.Touch.isTouchEvent = function(e) {
  return Blockly.utils.string.startsWith(e.type, 'touch') ||
      Blockly.utils.string.startsWith(e.type, 'pointer');
};

/**
 * Split an event into an array of events, one per changed touch or mouse
 * point.
 * @param {!Event} e A mouse event or a touch event with one or more changed
 * touches.
 * @return {!Array<!Event>} An array of mouse or touch events.  Each touch
 *     event will have exactly one changed touch.
 */
Blockly.Touch.splitEventByTouches = function(e) {
  var events = [];
  if (e.changedTouches) {
    for (var i = 0; i < e.changedTouches.length; i++) {
      var newEvent = {
        type: e.type,
        changedTouches: [e.changedTouches[i]],
        target: e.target,
        stopPropagation: function() { e.stopPropagation(); },
        preventDefault: function() { e.preventDefault(); }
      };
      events[i] = newEvent;
    }
  } else {
    events.push(e);
  }
  return events;
};
