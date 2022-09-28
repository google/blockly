/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Browser event handling.
 */
'use strict';

/**
 * Browser event handling.
 * @namespace Blockly.browserEvents
 */
goog.module('Blockly.browserEvents');

const Touch = goog.require('Blockly.Touch');
const userAgent = goog.require('Blockly.utils.userAgent');
const {globalThis} = goog.require('Blockly.utils.global');


/**
 * Blockly opaque event data used to unbind events when using
 * `bind` and `conditionalBind`.
 * @typedef {!Array<!Array>}
 * @alias Blockly.browserEvents.Data
 */
let Data;
exports.Data = Data;

/**
 * The multiplier for scroll wheel deltas using the line delta mode.
 * See https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
 * for more information on deltaMode.
 * @type {number}
 * @const
 */
const LINE_MODE_MULTIPLIER = 40;

/**
 * The multiplier for scroll wheel deltas using the page delta mode.
 * See https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode
 * for more information on deltaMode.
 * @type {number}
 * @const
 */
const PAGE_MODE_MULTIPLIER = 125;

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
 * @return {!Data} Opaque data that can be passed to
 *     unbindEvent_.
 * @alias Blockly.browserEvents.conditionalBind
 */
const conditionalBind = function(
    node, name, thisObject, func, opt_noCaptureIdentifier,
    opt_noPreventDefault) {
  let handled = false;
  const wrapFunc = function(e) {
    const captureIdentifier = !opt_noCaptureIdentifier;
    // Handle each touch point separately.  If the event was a mouse event, this
    // will hand back an array with one element, which we're fine handling.
    const events = Touch.splitEventByTouches(e);
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (captureIdentifier && !Touch.shouldHandleEvent(event)) {
        continue;
      }
      Touch.setClientFromTouch(event);
      if (thisObject) {
        func.call(thisObject, event);
      } else {
        func(event);
      }
      handled = true;
    }
  };

  const bindData = [];
  if (globalThis['PointerEvent'] && (name in Touch.TOUCH_MAP)) {
    for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
      const type = Touch.TOUCH_MAP[name][i];
      node.addEventListener(type, wrapFunc, false);
      bindData.push([node, type, wrapFunc]);
    }
  } else {
    node.addEventListener(name, wrapFunc, false);
    bindData.push([node, name, wrapFunc]);

    // Add equivalent touch event.
    if (name in Touch.TOUCH_MAP) {
      const touchWrapFunc = function(e) {
        wrapFunc(e);
        // Calling preventDefault stops the browser from scrolling/zooming the
        // page.
        const preventDef = !opt_noPreventDefault;
        if (handled && preventDef) {
          e.preventDefault();
        }
      };
      for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
        const type = Touch.TOUCH_MAP[name][i];
        node.addEventListener(type, touchWrapFunc, false);
        bindData.push([node, type, touchWrapFunc]);
      }
    }
  }
  return bindData;
};
exports.conditionalBind = conditionalBind;


/**
 * Bind an event handler that should be called regardless of whether it is part
 * of the active touch stream.
 * Use this for events that are not part of a multi-part gesture (e.g.
 * mouseover for tooltips).
 * @param {!EventTarget} node Node upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {?Object} thisObject The value of 'this' in the function.
 * @param {!Function} func Function to call when event is triggered.
 * @return {!Data} Opaque data that can be passed to
 *     unbindEvent_.
 * @alias Blockly.browserEvents.bind
 */
const bind = function(node, name, thisObject, func) {
  const wrapFunc = function(e) {
    if (thisObject) {
      func.call(thisObject, e);
    } else {
      func(e);
    }
  };

  const bindData = [];
  if (globalThis['PointerEvent'] && (name in Touch.TOUCH_MAP)) {
    for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
      const type = Touch.TOUCH_MAP[name][i];
      node.addEventListener(type, wrapFunc, false);
      bindData.push([node, type, wrapFunc]);
    }
  } else {
    node.addEventListener(name, wrapFunc, false);
    bindData.push([node, name, wrapFunc]);

    // Add equivalent touch event.
    if (name in Touch.TOUCH_MAP) {
      const touchWrapFunc = function(e) {
        // Punt on multitouch events.
        if (e.changedTouches && e.changedTouches.length === 1) {
          // Map the touch event's properties to the event.
          const touchPoint = e.changedTouches[0];
          e.clientX = touchPoint.clientX;
          e.clientY = touchPoint.clientY;
        }
        wrapFunc(e);

        // Stop the browser from scrolling/zooming the page.
        e.preventDefault();
      };
      for (let i = 0; i < Touch.TOUCH_MAP[name].length; i++) {
        const type = Touch.TOUCH_MAP[name][i];
        node.addEventListener(type, touchWrapFunc, false);
        bindData.push([node, type, touchWrapFunc]);
      }
    }
  }
  return bindData;
};
exports.bind = bind;

/**
 * Unbind one or more events event from a function call.
 * @param {!Data} bindData Opaque data from bindEvent_.
 *     This list is emptied during the course of calling this function.
 * @return {!Function} The function call.
 * @alias Blockly.browserEvents.unbind
 */
const unbind = function(bindData) {
  let func;
  while (bindData.length) {
    const bindDatum = bindData.pop();
    const node = bindDatum[0];
    const name = bindDatum[1];
    func = bindDatum[2];
    node.removeEventListener(name, func, false);
  }
  return func;
};
exports.unbind = unbind;

/**
 * Returns true if this event is targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @alias Blockly.browserEvents.isTargetInput
 */
const isTargetInput = function(e) {
  return e.target.type === 'textarea' || e.target.type === 'text' ||
      e.target.type === 'number' || e.target.type === 'email' ||
      e.target.type === 'password' || e.target.type === 'search' ||
      e.target.type === 'tel' || e.target.type === 'url' ||
      e.target.isContentEditable ||
      (e.target.dataset && e.target.dataset.isTextInput === 'true');
};
exports.isTargetInput = isTargetInput;

/**
 * Returns true this event is a right-click.
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 * @alias Blockly.browserEvents.isRightButton
 */
const isRightButton = function(e) {
  if (e.ctrlKey && userAgent.MAC) {
    // Control-clicking on Mac OS X is treated as a right-click.
    // WebKit on Mac OS X fails to change button to 2 (but Gecko does).
    return true;
  }
  return e.button === 2;
};
exports.isRightButton = isRightButton;

/**
 * Returns the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Event} e Mouse event.
 * @param {!Element} svg SVG element.
 * @param {?SVGMatrix} matrix Inverted screen CTM to use.
 * @return {!SVGPoint} Object with .x and .y properties.
 * @alias Blockly.browserEvents.mouseToSvg
 */
const mouseToSvg = function(e, svg, matrix) {
  const svgPoint = svg.createSVGPoint();
  svgPoint.x = e.clientX;
  svgPoint.y = e.clientY;

  if (!matrix) {
    matrix = svg.getScreenCTM().inverse();
  }
  return svgPoint.matrixTransform(matrix);
};
exports.mouseToSvg = mouseToSvg;

/**
 * Returns the scroll delta of a mouse event in pixel units.
 * @param {!Event} e Mouse event.
 * @return {{x: number, y: number}} Scroll delta object with .x and .y
 *    properties.
 * @alias Blockly.browserEvents.getScrollDeltaPixels
 */
const getScrollDeltaPixels = function(e) {
  switch (e.deltaMode) {
    case 0x00:  // Pixel mode.
    default:
      return {x: e.deltaX, y: e.deltaY};
    case 0x01:  // Line mode.
      return {
        x: e.deltaX * LINE_MODE_MULTIPLIER,
        y: e.deltaY * LINE_MODE_MULTIPLIER,
      };
    case 0x02:  // Page mode.
      return {
        x: e.deltaX * PAGE_MODE_MULTIPLIER,
        y: e.deltaY * PAGE_MODE_MULTIPLIER,
      };
  }
};
exports.getScrollDeltaPixels = getScrollDeltaPixels;
