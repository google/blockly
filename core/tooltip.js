/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

goog.module('Blockly.Tooltip');

const blocklyString = goog.require('Blockly.utils.string');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');


/**
 * Returns the target object that the given object is targeting for its
 * tooltip. Could be the object itself.
 * @param {?Object} obj The object are trying to find the target tooltip
 *     object of.
 * @return {?{tooltip}} The target tooltip object.
 */
const getTargetObject = function(obj) {
  while (obj && obj.tooltip) {
    if ((typeof obj.tooltip === 'string') ||
        (typeof obj.tooltip === 'function')) {
      return obj;
    }
    obj = obj.tooltip;
  }
  return null;
};

/**
 * Class to create tooltips. This class represents a singleton and should not be
 * constructed outside of this file. Use `Blockly.tooltipManager` to interact
 * with the singleton. First, call createDom() after onload. Second, set the
 * 'tooltip' property on any SVG element that needs a tooltip. If the tooltip is
 * a string, or a function that returns a string, then that message will be
 * displayed. If the tooltip is an SVG element, then that object's tooltip will
 * be used. Third, call bindMouseEvents(e) passing the SVG element.
 */
class Tooltip {
  /**
   * Class to create tooltips. Do not instantiate this class outside of this
   * file.
   * @protected
   * @alias Blockly.Tooltip
   */
  constructor() {
    /**
     * Is a tooltip currently showing?
     * @type {boolean}
     * @protected
     */
    this.visible = false;

    /**
     * Is someone else blocking the tooltip from being shown?
     * @type {boolean}
     * @protected
     */
    this.blocked = false;

    /**
     * PID of suspended thread to clear tooltip on mouse out.
     * @protected
     */
    this.mouseOutPid = 0;

    /**
     * PID of suspended thread to show the tooltip.
     * @protected
     */
    this.showPid = 0;

    /**
     * Last observed X location of the mouse pointer (freezes when tooltip
     * appears).
     * @protected
     */
    this.lastX = 0;

    /**
     * Last observed Y location of the mouse pointer (freezes when tooltip
     * appears).
     * @protected
     */
    this.lastY = 0;

    /**
     * Current element being pointed at.
     * @type {?Element}
     * @protected
     */
    this.element = null;

    /**
     * Once a tooltip has opened for an element, that element is 'poisoned' and
     * cannot respawn a tooltip until the pointer moves over a different
     * element.
     * @type {?Element}
     * @protected
     */
    this.poisonedElement = null;

    /**
     * Maximum width (in characters) of a tooltip.
     * @alias Blockly.Tooltip.LIMIT
     */
    this.LIMIT = 50;

    /**
     * Horizontal offset between mouse cursor and tooltip.
     * @alias Blockly.Tooltip.OFFSET_X
     */
    this.OFFSET_X = 0;

    /**
     * Vertical offset between mouse cursor and tooltip.
     * @alias Blockly.Tooltip.OFFSET_Y
     */
    this.OFFSET_Y = 10;

    /**
     * Radius mouse can move before killing tooltip.
     * @alias Blockly.Tooltip.RADIUS_OK
     */
    this.RADIUS_OK = 10;

    /**
     * Delay before tooltip appears.
     * @alias Blockly.Tooltip.HOVER_MS
     */
    this.HOVER_MS = 750;

    /**
     * Horizontal padding between tooltip and screen edge.
     * @alias Blockly.Tooltip.MARGINS
     */
    this.MARGINS = 5;

    /**
     * The HTML container.  Set once by createDom.
     * @type {?Element}
     * @protected
     */
    this.DIV = null;
  }

  /**
   * Returns the tooltip text for the given element.
   * @param {?Object} object The object to get the tooltip text of.
   * @return {string} The tooltip text of the element.
   * @alias Blockly.Tooltip.getTooltipOfObject
   */
  getTooltipOfObject(object) {
    const obj = getTargetObject(object);
    if (obj) {
      let tooltip = obj.tooltip;
      while (typeof tooltip === 'function') {
        tooltip = tooltip();
      }
      if (typeof tooltip !== 'string') {
        throw Error('Tooltip function must return a string.');
      }
      return tooltip;
    }
    return '';
  }

  /**
   * Create the tooltip div and inject it onto the page.
   * @alias Blockly.Tooltip.createDom
   */
  createDom() {
    if (this.DIV) {
      return;  // Already created.
    }
    // Create an HTML container for popup overlays (e.g. editor widgets).
    this.DIV = document.createElement('div');
    this.DIV.className = 'blocklyTooltipDiv';
    const container = common.getParentContainer() || document.body;
    container.appendChild(this.DIV);
  }
  /**
   * Binds the required mouse events onto an SVG element.
   * @param {!Element} element SVG element onto which tooltip is to be bound.
   * @alias Blockly.Tooltip.bindMouseEvents
   */
  bindMouseEvents(element) {
    element.mouseOverWrapper_ =
        browserEvents.bind(element, 'mouseover', this, this.onMouseOver);
    element.mouseOutWrapper_ =
        browserEvents.bind(element, 'mouseout', this, this.onMouseOut);

    // Don't use bindEvent_ for mousemove since that would create a
    // corresponding touch handler, even though this only makes sense in the
    // context of a mouseover/mouseout.
    element.addEventListener('mousemove', (e) => {
      this.onMouseMove(e);
    }, false);
  }

  /**
   * Unbinds tooltip mouse events from the SVG element.
   * @param {!Element} element SVG element onto which tooltip is bound.
   * @alias Blockly.Tooltip.unbindMouseEvents
   */
  unbindMouseEvents(element) {
    if (!element) {
      return;
    }
    browserEvents.unbind(element.mouseOverWrapper_);
    browserEvents.unbind(element.mouseOutWrapper_);
    element.removeEventListener('mousemove', this.onMouseMove);
  }

  /**
   * Hide the tooltip if the mouse is over a different object.
   * Initialize the tooltip to potentially appear for this object.
   * @param {!Event} e Mouse event.
   * @protected
   */
  onMouseOver(e) {
    if (this.blocked) {
      // Someone doesn't want us to show tooltips.
      return;
    }
    // If the tooltip is an object, treat it as a pointer to the next object in
    // the chain to look at.  Terminate when a string or function is found.
    const newElement =
        /** @type {Element} */ (getTargetObject(e.currentTarget));
    if (this.element !== newElement) {
      this.hide();
      this.poisonedElement = null;
      this.element = newElement;
    }
    // Forget about any immediately preceding mouseOut event.
    clearTimeout(this.mouseOutPid);
  }

  /**
   * Hide the tooltip if the mouse leaves the object and enters the workspace.
   * @param {!Event} _e Mouse event.
   * @protected
   */
  onMouseOut(_e) {
    if (this.blocked) {
      // Someone doesn't want us to show tooltips.
      return;
    }
    // Moving from one element to another (overlapping or with no gap) generates
    // a mouseOut followed instantly by a mouseOver.  Fork off the mouseOut
    // event and kill it if a mouseOver is received immediately.
    // This way the task only fully executes if mousing into the void.
    this.mouseOutPid = setTimeout(() => {
      this.element = null;
      this.poisonedElement = null;
      this.hide();
    }, 1);
    clearTimeout(this.showPid);
  }


  /**
   * When hovering over an element, schedule a tooltip to be shown.  If a
   * tooltip is already visible, hide it if the mouse strays out of a certain
   * radius.
   * @param {!Event} e Mouse event.
   * @protected
   */
  onMouseMove(e) {
    if (!this.element || !this.element.tooltip) {
      // No tooltip here to show.
      return;
    } else if (this.blocked) {
      // Someone doesn't want us to show tooltips.  We are probably handling a
      // user gesture, such as a click or drag.
      return;
    }
    if (this.visible) {
      // Compute the distance between the mouse position when the tooltip was
      // shown and the current mouse position.  Pythagorean theorem.
      const dx = this.lastX - e.pageX;
      const dy = this.lastY - e.pageY;
      if (Math.sqrt(dx * dx + dy * dy) > this.RADIUS_OK) {
        this.hide();
      }
    } else if (this.poisonedElement !== this.element) {
      // The mouse moved, clear any previously scheduled tooltip.
      clearTimeout(this.showPid);
      // Maybe this time the mouse will stay put.  Schedule showing of tooltip.
      this.lastX = e.pageX;
      this.lastY = e.pageY;
      this.showPid = setTimeout(() => {
        this.show();
      }, this.HOVER_MS);
    }
  }

  /**
   * Dispose of the tooltip.
   * @alias Blockly.Tooltip.dispose
   * @package
   */
  dispose() {
    this.element = null;
    this.poisonedElement = null;
    this.hide();
  }

  /**
   * Hide the tooltip.
   * @alias Blockly.Tooltip.hide
   */
  hide() {
    if (this.visible) {
      this.visible = false;
      if (this.DIV) {
        this.DIV.style.display = 'none';
      }
    }
    if (this.showPid) {
      clearTimeout(this.showPid);
    }
  }

  /**
   * Hide any in-progress tooltips and block showing new tooltips until the next
   * call to unblock().
   * @alias Blockly.Tooltip.block
   * @package
   */
  block() {
    this.hide();
    this.blocked = true;
  }

  /**
   * Unblock tooltips: allow them to be scheduled and shown according to their
   * own logic.
   * @alias Blockly.Tooltip.unblock
   * @package
   */
  unblock() {
    this.blocked = false;
  }

  /**
   * Renders the tooltip content into the tooltip div.
   * @protected
   */
  renderContent() {
    let tip = this.getTooltipOfObject(this.element);
    tip = blocklyString.wrap(tip, this.LIMIT);
    // Create new text, line by line.
    const lines = tip.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(lines[i]));
      this.DIV.appendChild(div);
    }
  }

  /**
   * Gets the coordinates for the tooltip div, taking into account the edges of
   * the screen to prevent showing the tooltip offscreen.
   * @param {boolean} rtl True if the tooltip should be in right-to-left layout.
   * @returns {{x: number, y: number}} Coordinates at which the tooltip div
   *     should be placed.
   * @protected
   */
  getPosition(rtl) {
    // Position the tooltip just below the cursor.
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = document.documentElement.clientHeight;

    let anchorX = this.lastX;
    if (rtl) {
      anchorX -= this.OFFSET_X + this.DIV.offsetWidth;
    } else {
      anchorX += this.OFFSET_X;
    }

    let anchorY = this.lastY + this.OFFSET_Y;
    if (anchorY + this.DIV.offsetHeight > windowHeight + window.scrollY) {
      // Falling off the bottom of the screen; shift the tooltip up.
      anchorY -= this.DIV.offsetHeight + 2 * this.OFFSET_Y;
    }

    if (rtl) {
      // Prevent falling off left edge in RTL mode.
      anchorX = Math.max(this.MARGINS - window.scrollX, anchorX);
    } else {
      if (anchorX + this.DIV.offsetWidth >
          windowWidth + window.scrollX - 2 * this.MARGINS) {
        // Falling off the right edge of the screen;
        // clamp the tooltip on the edge.
        anchorX = windowWidth - this.DIV.offsetWidth - 2 * this.MARGINS;
      }
    }

    return {x: anchorX, y: anchorY};
  }

  /**
   * Create the tooltip and show it.
   */
  show() {
    if (this.blocked) {
      // Someone doesn't want us to show tooltips.
      return;
    }
    this.poisonedElement = this.element;
    if (!this.DIV) {
      return;
    }
    // Erase all existing text.
    this.DIV.textContent = '';

    // Add new content.
    this.renderContent();

    // Display the tooltip.
    const rtl = /** @type {{RTL: boolean}} */ (this.element).RTL;
    this.DIV.style.direction = rtl ? 'rtl' : 'ltr';
    this.DIV.style.display = 'block';
    this.visible = true;

    const {x, y} = this.getPosition(rtl);
    this.DIV.style.left = x + 'px';
    this.DIV.style.top = y + 'px';
  }
}
exports.Tooltip = Tooltip;


/**
 * A type which can define a tooltip.
 * Either a string, an object containing a tooltip property, or a function which
 * returns either a string, or another arbitrarily nested function which
 * eventually unwinds to a string.
 * @typedef {string|{tooltip}|function(): (string|!Function)}
 * @alias Blockly.Tooltip.TipInfo
 */
let TipInfo;
exports.TipInfo = TipInfo;

// Singleton tooltip manager. Only interact with this object.
// TODO(maribethb): Get this class from the registry.
exports.tooltipManager = new Tooltip();
