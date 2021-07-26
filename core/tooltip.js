/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Library to create tooltips for Blockly.
 * First, call init() after onload.
 * Second, set the 'tooltip' property on any SVG element that needs a tooltip.
 * If the tooltip is a string, then that message will be displayed.
 * If the tooltip is an SVG element, then that object's tooltip will be used.
 * Third, call bindMouseEvents(e) passing the SVG element.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.Tooltip
 * @namespace
 */
goog.module('Blockly.Tooltip');
goog.module.declareLegacyNamespace();

const blocklyString = goog.require('Blockly.utils.string');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');


/**
 * A type which can define a tooltip.
 * Either a string, an object containing a tooltip property, or a function which
 * returns either a string, or another arbitrarily nested function which
 * eventually unwinds to a string.
 * @typedef {string|{tooltip}|function(): (string|!Function)}
 */
let TipInfo;
exports.TipInfo = TipInfo;

/**
 * Is a tooltip currently showing?
 */
let visible = false;
exports.visible = visible;

/**
 * Is someone else blocking the tooltip from being shown?
 * @type {boolean}
 */
let blocked = false;

/**
 * Maximum width (in characters) of a tooltip.
 */
const LIMIT = 50;
exports.LIMIT = LIMIT;

/**
 * PID of suspended thread to clear tooltip on mouse out.
 */
let mouseOutPid = 0;

/**
 * PID of suspended thread to show the tooltip.
 */
let showPid = 0;

/**
 * Last observed X location of the mouse pointer (freezes when tooltip appears).
 */
let lastX = 0;

/**
 * Last observed Y location of the mouse pointer (freezes when tooltip appears).
 */
let lastY = 0;

/**
 * Current element being pointed at.
 * @type {Element}
 */
let element = null;

/**
 * Once a tooltip has opened for an element, that element is 'poisoned' and
 * cannot respawn a tooltip until the pointer moves over a different element.
 * @type {Element}
 */
let poisonedElement = null;

/**
 * Horizontal offset between mouse cursor and tooltip.
 */
const OFFSET_X = 0;
exports.OFFSET_X = OFFSET_X;

/**
 * Vertical offset between mouse cursor and tooltip.
 */
const OFFSET_Y = 10;
exports.OFFSET_Y = OFFSET_Y;

/**
 * Radius mouse can move before killing tooltip.
 */
const RADIUS_OK = 10;
exports.RADIUS_OK = RADIUS_OK;

/**
 * Delay before tooltip appears.
 */
const HOVER_MS = 750;
exports.HOVER_MS = HOVER_MS;

/**
 * Horizontal padding between tooltip and screen edge.
 */
const MARGINS = 5;
exports.MARGINS = MARGINS;

/**
 * The HTML container.  Set once by createDom.
 * @type {Element}
 */
let DIV = null;
exports.DIV = DIV;

/**
 * Returns the tooltip text for the given element.
 * @param {?Object} object The object to get the tooltip text of.
 * @return {string} The tooltip text of the element.
 */
const getTooltipOfObject = function(object) {
  const obj = getTargetObject(object);
  if (obj) {
    let tooltip = obj.tooltip;
    while (typeof tooltip == 'function') {
      tooltip = tooltip();
    }
    if (typeof tooltip != 'string') {
      throw Error('Tooltip function must return a string.');
    }
    return tooltip;
  }
  return '';
};
exports.getTooltipOfObject = getTooltipOfObject;

/**
 * Returns the target object that the given object is targeting for its
 * tooltip. Could be the object itself.
 * @param {?Object} obj The object are trying to find the target tooltip
 *     object of.
 * @return {?{tooltip}} The target tooltip object.
 */
const getTargetObject = function(obj) {
  while (obj && obj.tooltip) {
    if ((typeof obj.tooltip == 'string') ||
        (typeof obj.tooltip == 'function')) {
      return obj;
    }
    obj = obj.tooltip;
  }
  return null;
};

/**
 * Create the tooltip div and inject it onto the page.
 */
const createDom = function() {
  if (DIV) {
    return;  // Already created.
  }
  // Create an HTML container for popup overlays (e.g. editor widgets).
  DIV = document.createElement('div');
  DIV.className = 'blocklyTooltipDiv';
  const container = common.getParentContainer() || document.body;
  container.appendChild(DIV);
};
exports.createDom = createDom;

/**
 * Binds the required mouse events onto an SVG element.
 * @param {!Element} element SVG element onto which tooltip is to be bound.
 */
const bindMouseEvents = function(element) {
  element.mouseOverWrapper_ =
      browserEvents.bind(element, 'mouseover', null, onMouseOver);
  element.mouseOutWrapper_ =
      browserEvents.bind(element, 'mouseout', null, onMouseOut);

  // Don't use bindEvent_ for mousemove since that would create a
  // corresponding touch handler, even though this only makes sense in the
  // context of a mouseover/mouseout.
  element.addEventListener('mousemove', onMouseMove, false);
};
exports.bindMouseEvents = bindMouseEvents;

/**
 * Unbinds tooltip mouse events from the SVG element.
 * @param {!Element} element SVG element onto which tooltip is bound.
 */
const unbindMouseEvents = function(element) {
  if (!element) {
    return;
  }
  browserEvents.unbind(element.mouseOverWrapper_);
  browserEvents.unbind(element.mouseOutWrapper_);
  element.removeEventListener('mousemove', onMouseMove);
};
exports.unbindMouseEvents = unbindMouseEvents;

/**
 * Hide the tooltip if the mouse is over a different object.
 * Initialize the tooltip to potentially appear for this object.
 * @param {!Event} e Mouse event.
 */
const onMouseOver = function(e) {
  if (blocked) {
    // Someone doesn't want us to show tooltips.
    return;
  }
  // If the tooltip is an object, treat it as a pointer to the next object in
  // the chain to look at.  Terminate when a string or function is found.
  const newElement = /** @type {Element} */ (getTargetObject(e.currentTarget));
  if (element != newElement) {
    hide();
    poisonedElement = null;
    element = newElement;
  }
  // Forget about any immediately preceding mouseOut event.
  clearTimeout(mouseOutPid);
};

/**
 * Hide the tooltip if the mouse leaves the object and enters the workspace.
 * @param {!Event} _e Mouse event.
 */
const onMouseOut = function(_e) {
  if (blocked) {
    // Someone doesn't want us to show tooltips.
    return;
  }
  // Moving from one element to another (overlapping or with no gap) generates
  // a mouseOut followed instantly by a mouseOver.  Fork off the mouseOut
  // event and kill it if a mouseOver is received immediately.
  // This way the task only fully executes if mousing into the void.
  mouseOutPid = setTimeout(function() {
    element = null;
    poisonedElement = null;
    hide();
  }, 1);
  clearTimeout(showPid);
};

/**
 * When hovering over an element, schedule a tooltip to be shown.  If a tooltip
 * is already visible, hide it if the mouse strays out of a certain radius.
 * @param {!Event} e Mouse event.
 */
const onMouseMove = function(e) {
  if (!element || !element.tooltip) {
    // No tooltip here to show.
    return;
  } else if (blocked) {
    // Someone doesn't want us to show tooltips.  We are probably handling a
    // user gesture, such as a click or drag.
    return;
  }
  if (visible) {
    // Compute the distance between the mouse position when the tooltip was
    // shown and the current mouse position.  Pythagorean theorem.
    const dx = lastX - e.pageX;
    const dy = lastY - e.pageY;
    if (Math.sqrt(dx * dx + dy * dy) > RADIUS_OK) {
      hide();
    }
  } else if (poisonedElement != element) {
    // The mouse moved, clear any previously scheduled tooltip.
    clearTimeout(showPid);
    // Maybe this time the mouse will stay put.  Schedule showing of tooltip.
    lastX = e.pageX;
    lastY = e.pageY;
    showPid = setTimeout(show, HOVER_MS);
  }
};

/**
 * Dispose of the tooltip.
 */
const dispose = function() {
  element = null;
  poisonedElement = null;
  hide();
};
/** @package */
exports.dispose = dispose;

/**
 * Hide the tooltip.
 */
const hide = function() {
  if (visible) {
    visible = false;
    if (DIV) {
      DIV.style.display = 'none';
    }
  }
  if (showPid) {
    clearTimeout(showPid);
  }
};
exports.hide = hide;

/**
 * Hide any in-progress tooltips and block showing new tooltips until the next
 * call to unblock().
 */
const block = function() {
  hide();
  blocked = true;
};
/** @package */
exports.block = block;

/**
 * Unblock tooltips: allow them to be scheduled and shown according to their own
 * logic.
 */
const unblock = function() {
  blocked = false;
};
/** @package */
exports.unblock = unblock;

/**
 * Create the tooltip and show it.
 */
const show = function() {
  if (blocked) {
    // Someone doesn't want us to show tooltips.
    return;
  }
  poisonedElement = element;
  if (!DIV) {
    return;
  }
  // Erase all existing text.
  DIV.textContent = '';
  let tip = getTooltipOfObject(element);
  tip = blocklyString.wrap(tip, LIMIT);
  // Create new text, line by line.
  const lines = tip.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(lines[i]));
    DIV.appendChild(div);
  }
  const rtl = /** @type {{RTL: boolean}} */ (element).RTL;
  const windowWidth = document.documentElement.clientWidth;
  const windowHeight = document.documentElement.clientHeight;
  // Display the tooltip.
  DIV.style.direction = rtl ? 'rtl' : 'ltr';
  DIV.style.display = 'block';
  visible = true;
  // Move the tooltip to just below the cursor.
  let anchorX = lastX;
  if (rtl) {
    anchorX -= OFFSET_X + DIV.offsetWidth;
  } else {
    anchorX += OFFSET_X;
  }
  let anchorY = lastY + OFFSET_Y;

  if (anchorY + DIV.offsetHeight > windowHeight + window.scrollY) {
    // Falling off the bottom of the screen; shift the tooltip up.
    anchorY -= DIV.offsetHeight + 2 * OFFSET_Y;
  }
  if (rtl) {
    // Prevent falling off left edge in RTL mode.
    anchorX = Math.max(MARGINS - window.scrollX, anchorX);
  } else {
    if (anchorX + DIV.offsetWidth >
        windowWidth + window.scrollX - 2 * MARGINS) {
      // Falling off the right edge of the screen;
      // clamp the tooltip on the edge.
      anchorX = windowWidth - DIV.offsetWidth - 2 * MARGINS;
    }
  }
  DIV.style.top = anchorY + 'px';
  DIV.style.left = anchorX + 'px';
};
