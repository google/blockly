/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Browser event handling.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.browserEvents');

goog.require('Blockly.Touch');
goog.require('Blockly.utils.global');


/**
 * Blockly opaque event data used to unbind events when using
 * `Blockly.browserEvents.bind` and
 * `Blockly.browserEvents.conditionalBind`.
 * @typedef {!Array<!Array>}
 */
Blockly.browserEvents.Data;

/**
 * Bind an event handler that can be ignored if it is not part of the active
 * touch stream.
 * Use this for events that either start or continue a multi-part gesture (e.g.
 * mousedown or mousemove, which may be part of a drag or click).
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {?Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @param {boolean=} opt_noCaptureIdentifier True if triggering on this event
 *     should not block execution of other event handlers on this touch or
 *     other simultaneous touches.  False by default.
 * @param {boolean=} opt_noPreventDefault True if triggering on this event
 *     should prevent the default handler.  False by default.  If
 *     opt_noPreventDefault is provided, opt_noCaptureIdentifier must also be
 *     provided.
 * @return {!Blockly.browserEvents.Data} Opaque data that can be passed to
 *     unbindEvent_.
 * @public
 */
Blockly.browserEvents.conditionalBind = function(
    node, name, thisObject, func, opt_noCaptureIdentifier,
    opt_noPreventDefault) {
  var handled = false;
  var wrapFunc = function(e) {
    var captureIdentifier = !opt_noCaptureIdentifier;
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    var events = Blockly.Touch.splitEventByTouches(e);
    for (var i = 0, event; (event = events[i]); i++) {
      if (captureIdentifier && !Blockly.Touch.shouldHandleEvent(event)) {
        continue;
      }
      Blockly.Touch.setClientFromTouch(event);
      if (thisObject) {
        func.call(thisObject, event);
      } else {
        func(event);
      }
      handled = true;
    }
  };

  var bindData = [];
  if (Blockly.utils.global['PointerEvent'] &&
      (name in Blockly.Touch.TOUCH_MAP)) {
    for (var i = 0, type; (type = Blockly.Touch.TOUCH_MAP[name][i]); i++) {
      node.addEventListener(type, wrapFunc, false);
      bindData.push([node, type, wrapFunc]);
    }
  } else {
    node.addEventListener(name, wrapFunc, false);
    bindData.push([node, name, wrapFunc]);

    // Add equivalent touch event.
    if (name in Blockly.Touch.TOUCH_MAP) {
      var touchWrapFunc = function(e) {
        wrapFunc(e);
        // Calling preventDefault stops the browser from scrolling/zooming the
        // page.
        var preventDef = !opt_noPreventDefault;
        if (handled && preventDef) {
          e.preventDefault();
        }
      };
      for (var i = 0, type; (type = Blockly.Touch.TOUCH_MAP[name][i]); i++) {
        node.addEventListener(type, touchWrapFunc, false);
        bindData.push([node, type, touchWrapFunc]);
      }
    }
  }
  return bindData;
};


/**
 * Bind an event handler that should be called regardless of whether it is part
 * of the active touch stream.
 * Use this for events that are not part of a multi-part gesture (e.g.
 * mouseover for tooltips).
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {?Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!Blockly.browserEvents.Data} Opaque data that can be passed to
 *     unbindEvent_.
 * @public
 */
Blockly.browserEvents.bind = function(node, name, thisObject, func) {
  var wrapFunc = function(e) {
    if (thisObject) {
      func.call(thisObject, e);
    } else {
      func(e);
    }
  };

  var bindData = [];
  if (Blockly.utils.global['PointerEvent'] &&
      (name in Blockly.Touch.TOUCH_MAP)) {
    for (var i = 0, type; (type = Blockly.Touch.TOUCH_MAP[name][i]); i++) {
      node.addEventListener(type, wrapFunc, false);
      bindData.push([node, type, wrapFunc]);
    }
  } else {
    node.addEventListener(name, wrapFunc, false);
    bindData.push([node, name, wrapFunc]);

    // Add equivalent touch event.
    if (name in Blockly.Touch.TOUCH_MAP) {
      var touchWrapFunc = function(e) {
        // Punt on multitouch events.
        if (e.changedTouches && e.changedTouches.length == 1) {
          // Map the touch event's properties to the event.
          var touchPoint = e.changedTouches[0];
          e.clientX = touchPoint.clientX;
          e.clientY = touchPoint.clientY;
        }
        wrapFunc(e);

        // Stop the browser from scrolling/zooming the page.
        e.preventDefault();
      };
      for (var i = 0, type; (type = Blockly.Touch.TOUCH_MAP[name][i]); i++) {
        node.addEventListener(type, touchWrapFunc, false);
        bindData.push([node, type, touchWrapFunc]);
      }
    }
  }
  return bindData;
};

/**
 * Unbind one or more events event from a function call.
 * @param {!Blockly.browserEvents.Data} bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return {!Function} The function call.
 * @public
 */
Blockly.browserEvents.unbind = function(bindData) {
  while (bindData.length) {
    var bindDatum = bindData.pop();
    var node = bindDatum[0];
    var name = bindDatum[1];
    var func = bindDatum[2];
    node.removeEventListener(name, func, false);
  }
  return func;
};
