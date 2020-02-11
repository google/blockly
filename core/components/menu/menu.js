/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly menu similar to Closure's goog.ui.Menu
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.Menu');

goog.require('Blockly.Component');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');


/**
 * A basic menu class.
 * @constructor
 * @extends {Blockly.Component}
 */
Blockly.Menu = function() {
  Blockly.Component.call(this);

  /**
   * Coordinates of the mousedown event that caused this menu to open. Used to
   * prevent the consequent mouseup event due to a simple click from activating
   * a menu item immediately.
   * @type {?Blockly.utils.Coordinate}
   * @package
   */
  this.openingCoords = null;

  /**
   * This is the element that we will listen to the real focus events on.
   * A value of -1 means no menuitem is highlighted.
   * @type {number}
   * @private
   */
  this.highlightedIndex_ = -1;

  /**
   * Mouse over event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.mouseOverHandler_ = null;

  /**
   * Click event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.clickHandler_ = null;

  /**
   * Mouse enter event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.mouseEnterHandler_ = null;

  /**
   * Mouse leave event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.mouseLeaveHandler_ = null;

  /**
   * Key down event data.
   * @type {?Blockly.EventData}
   * @private
   */
  this.onKeyDownWrapper_ = null;
};
Blockly.utils.object.inherits(Blockly.Menu, Blockly.Component);


/**
 * Creates the menu DOM.
 * @override
 */
Blockly.Menu.prototype.createDom = function() {
  var element = document.createElement('div');
  element.id = this.getId();
  this.setElementInternal(element);

  // Set class
  element.className = 'goog-menu goog-menu-vertical blocklyNonSelectable';
  element.tabIndex = 0;

  // Initialize ARIA role.
  Blockly.utils.aria.setRole(element,
      this.roleName_ || Blockly.utils.aria.Role.MENU);
};

/**
 * Focus the menu element.
 * @package
 */
Blockly.Menu.prototype.focus = function() {
  var el = this.getElement();
  if (el) {
    el.focus({preventScroll:true});
    Blockly.utils.dom.addClass(el, 'focused');
  }
};

/**
 * Blur the menu element.
 * @package
 */
Blockly.Menu.prototype.blur = function() {
  var el = this.getElement();
  if (el) {
    el.blur();
    Blockly.utils.dom.removeClass(el, 'focused');
  }
};

/**
 * Set the menu accessibility role.
 * @param {!Blockly.utils.aria.Role} roleName role name.
 * @package
 */
Blockly.Menu.prototype.setRole = function(roleName) {
  this.roleName_ = roleName;
};

/** @override */
Blockly.Menu.prototype.enterDocument = function() {
  Blockly.Menu.superClass_.enterDocument.call(this);

  this.forEachChild(function(child) {
    if (child.isInDocument()) {
      this.registerChildId_(child);
    }
  }, this);

  this.attachEvents_();
};

/**
 * Cleans up the container before its DOM is removed from the document, and
 * removes event handlers.  Overrides {@link Blockly.Component#exitDocument}.
 * @override
 */
Blockly.Menu.prototype.exitDocument = function() {
  // {@link #setHighlightedIndex} has to be called before
  // {@link Blockly.Component#exitDocument}, otherwise it has no effect.
  this.setHighlightedIndex(-1);

  Blockly.Menu.superClass_.exitDocument.call(this);
};

/** @override */
Blockly.Menu.prototype.disposeInternal = function() {
  Blockly.Menu.superClass_.disposeInternal.call(this);

  this.detachEvents_();
};

/**
 * Adds the event listeners to the menu.
 * @private
 */
Blockly.Menu.prototype.attachEvents_ = function() {
  var el = /** @type {!EventTarget} */ (this.getElement());

  this.mouseOverHandler_ = Blockly.bindEventWithChecks_(el,
      'mouseover', this, this.handleMouseOver_, true);
  this.clickHandler_ = Blockly.bindEventWithChecks_(el,
      'click', this, this.handleClick_, true);
  this.mouseEnterHandler_ = Blockly.bindEventWithChecks_(el,
      'mouseenter', this, this.handleMouseEnter_, true);
  this.mouseLeaveHandler_ = Blockly.bindEventWithChecks_(el,
      'mouseleave', this, this.handleMouseLeave_, true);
  this.onKeyDownWrapper_ = Blockly.bindEventWithChecks_(el,
      'keydown', this, this.handleKeyEvent);
};

/**
 * Removes the event listeners from the menu.
 * @private
 */
Blockly.Menu.prototype.detachEvents_ = function() {
  if (this.mouseOverHandler_) {
    Blockly.unbindEvent_(this.mouseOverHandler_);
    this.mouseOverHandler_ = null;
  }
  if (this.clickHandler_) {
    Blockly.unbindEvent_(this.clickHandler_);
    this.clickHandler_ = null;
  }
  if (this.mouseEnterHandler_) {
    Blockly.unbindEvent_(this.mouseEnterHandler_);
    this.mouseEnterHandler_ = null;
  }
  if (this.mouseLeaveHandler_) {
    Blockly.unbindEvent_(this.mouseLeaveHandler_);
    this.mouseLeaveHandler_ = null;
  }
  if (this.onKeyDownWrapper_) {
    Blockly.unbindEvent_(this.onKeyDownWrapper_);
    this.onKeyDownWrapper_ = null;
  }
};

// Child component management.

/**
 * Map of DOM IDs to child menuitems. Each key is the DOM ID of a child
 * menuitems's root element; each value is a reference to the child menu
 * item itself.
 * @type {?Object}
 * @private
 */
Blockly.Menu.prototype.childElementIdMap_ = null;

/**
 * Creates a DOM ID for the child menuitem and registers it to an internal
 * hash table to be able to find it fast by id.
 * @param {Blockly.Component} child The child menuitem. Its root element has
 *     to be created yet.
 * @private
 */
Blockly.Menu.prototype.registerChildId_ = function(child) {
  // Map the DOM ID of the menuitem's root element to the menuitem itself.
  var childElem = child.getElement();

  // If the menuitem's root element doesn't have a DOM ID assign one.
  var id = childElem.id || (childElem.id = child.getId());

  // Lazily create the child element ID map on first use.
  if (!this.childElementIdMap_) {
    this.childElementIdMap_ = {};
  }
  this.childElementIdMap_[id] = child;
};

/**
 * Returns the child menuitem that owns the given DOM node, or null if no such
 * menuitem is found.
 * @param {Node} node DOM node whose owner is to be returned.
 * @return {?Blockly.MenuItem} menuitem for which the DOM node belongs to.
 * @protected
 */
Blockly.Menu.prototype.getMenuItem = function(node) {
  // Ensure that this menu actually has child menuitems before
  // looking up the menuitem.
  if (this.childElementIdMap_) {
    var elem = this.getElement();
    while (node && node !== elem) {
      var id = node.id;
      if (id in this.childElementIdMap_) {
        return this.childElementIdMap_[id];
      }
      node = node.parentNode;
    }
  }
  return null;
};

// Highlight management.

/**
 * Unhighlight the current highlighted item.
 * @protected
 */
Blockly.Menu.prototype.unhighlightCurrent = function() {
  var highlighted = this.getHighlighted();
  if (highlighted) {
    highlighted.setHighlighted(false);
  }
};

/**
 * Clears the currently highlighted item.
 * @protected
 */
Blockly.Menu.prototype.clearHighlighted = function() {
  this.unhighlightCurrent();
  this.setHighlightedIndex(-1);
};

/**
 * Returns the currently highlighted item (if any).
 * @return {?Blockly.Component} Highlighted item (null if none).
 * @protected
 */
Blockly.Menu.prototype.getHighlighted = function() {
  return this.getChildAt(this.highlightedIndex_);
};

/**
 * Highlights the item at the given 0-based index (if any). If another item
 * was previously highlighted, it is un-highlighted.
 * @param {number} index Index of item to highlight (-1 removes the current
 *     highlight).
 * @protected
 */
Blockly.Menu.prototype.setHighlightedIndex = function(index) {
  var child = this.getChildAt(index);
  if (child) {
    child.setHighlighted(true);
    this.highlightedIndex_ = index;
  } else if (this.highlightedIndex_ > -1) {
    this.getHighlighted().setHighlighted(false);
    this.highlightedIndex_ = -1;
  }

  // Bring the highlighted item into view. This has no effect if the menu is not
  // scrollable.
  if (child) {
    Blockly.utils.style.scrollIntoContainerView(
        /** @type {!Element} */ (child.getElement()),
        /** @type {!Element} */ (this.getElement()));
  }
};

/**
 * Highlights the given item if it exists and is a child of the container;
 * otherwise un-highlights the currently highlighted item.
 * @param {Blockly.MenuItem} item Item to highlight.
 * @protected
 */
Blockly.Menu.prototype.setHighlighted = function(item) {
  this.setHighlightedIndex(this.indexOfChild(item));
};

/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 * @package
 */
Blockly.Menu.prototype.highlightNext = function() {
  this.unhighlightCurrent();
  this.highlightHelper(function(index, max) {
    return (index + 1) % max;
  }, this.highlightedIndex_);
};

/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 * @package
 */
Blockly.Menu.prototype.highlightPrevious = function() {
  this.unhighlightCurrent();
  this.highlightHelper(function(index, max) {
    index--;
    return index < 0 ? max - 1 : index;
  }, this.highlightedIndex_);
};

/**
 * Helper function that manages the details of moving the highlight among
 * child menuitems in response to keyboard events.
 * @param {function(this: Blockly.Component, number, number) : number} fn
 *     Function that accepts the current and maximum indices, and returns the
 *     next index to check.
 * @param {number} startIndex Start index.
 * @return {boolean} Whether the highlight has changed.
 * @protected
 */
Blockly.Menu.prototype.highlightHelper = function(fn, startIndex) {
  // If the start index is -1 (meaning there's nothing currently highlighted),
  // try starting from the currently open item, if any.
  var curIndex =
      startIndex < 0 ? -1 : startIndex;
  var numItems = this.getChildCount();

  curIndex = fn.call(this, curIndex, numItems);
  var visited = 0;
  while (visited <= numItems) {
    var menuItem = /** @type {Blockly.MenuItem} */ (this.getChildAt(curIndex));
    if (menuItem && this.canHighlightItem(menuItem)) {
      this.setHighlightedIndex(curIndex);
      return true;
    }
    visited++;
    curIndex = fn.call(this, curIndex, numItems);
  }
  return false;
};

/**
 * Returns whether the given item can be highlighted.
 * @param {Blockly.MenuItem} item The item to check.
 * @return {boolean} Whether the item can be highlighted.
 * @protected
 */
Blockly.Menu.prototype.canHighlightItem = function(item) {
  return item.isEnabled();
};

// Mouse events.

/**
 * Handles mouseover events. Highlight menuitems as the user
 * hovers over them.
 * @param {Event} e Mouse event to handle.
 * @private
 */
Blockly.Menu.prototype.handleMouseOver_ = function(e) {
  var menuItem = this.getMenuItem(/** @type {Node} */ (e.target));

  if (menuItem) {
    if (menuItem.isEnabled()) {
      var currentHighlighted = this.getHighlighted();
      if (currentHighlighted === menuItem) {
        return;
      }

      this.unhighlightCurrent();
      this.setHighlighted(menuItem);
    } else {
      this.unhighlightCurrent();
    }
  }
};

/**
 * Handles click events. Pass the event onto the child
 * menuitem to handle.
 * @param {Event} e Click to handle.
 * @private
 */
Blockly.Menu.prototype.handleClick_ = function(e) {
  var oldCoords = this.openingCoords;
  // Clear out the saved opening coords immediately so they're not used twice.
  this.openingCoords = null;
  if (oldCoords && typeof e.clientX === 'number') {
    var newCoords = new Blockly.utils.Coordinate(e.clientX, e.clientY);
    if (Blockly.utils.Coordinate.distance(oldCoords, newCoords) < 1) {
      // This menu was opened by a mousedown and we're handling the consequent
      // click event. The coords haven't changed, meaning this was the same
      // opening event. Don't do the usual behavior because the menu just popped
      // up under the mouse and the user didn't mean to activate this item.
      return;
    }
  }

  var menuItem = this.getMenuItem(/** @type {Node} */ (e.target));

  if (menuItem && menuItem.handleClick(e)) {
    e.preventDefault();
  }
};

/**
 * Handles mouse enter events. Focus the element.
 * @param {Event} _e Mouse event to handle.
 * @private
 */
Blockly.Menu.prototype.handleMouseEnter_ = function(_e) {
  this.focus();
};

/**
 * Handles mouse leave events. Blur and clear highlight.
 * @param {Event} _e Mouse event to handle.
 * @private
 */
Blockly.Menu.prototype.handleMouseLeave_ = function(_e) {
  if (this.getElement()) {
    this.blur();
    this.clearHighlighted();
  }
};

// Keyboard events.

/**
 * Attempts to handle a keyboard event, if the menuitem is enabled, by calling
 * {@link handleKeyEventInternal}.  Considered protected; should only be used
 * within this package and by subclasses.
 * @param {Event} e Key event to handle.
 * @return {boolean} Whether the key event was handled.
 * @protected
 */
Blockly.Menu.prototype.handleKeyEvent = function(e) {
  if (this.getChildCount() != 0 &&
      this.handleKeyEventInternal(e)) {
    e.preventDefault();
    e.stopPropagation();
    return true;
  }
  return false;
};

/**
 * Attempts to handle a keyboard event; returns true if the event was handled,
 * false otherwise.  If the container is enabled, and a child is highlighted,
 * calls the child menuitem's `handleKeyEvent` method to give the menuitem
 * a chance to handle the event first.
 * @param {Event} e Key event to handle.
 * @return {boolean} Whether the event was handled by the container (or one of
 *     its children).
 * @protected
 */
Blockly.Menu.prototype.handleKeyEventInternal = function(e) {
  // Give the highlighted menuitem the chance to handle the key event.
  var highlighted = this.getHighlighted();
  if (highlighted && typeof highlighted.handleKeyEvent == 'function' &&
      highlighted.handleKeyEvent(e)) {
    return true;
  }

  // Do not handle the key event if any modifier key is pressed.
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return false;
  }

  // Either nothing is highlighted, or the highlighted menuitem didn't handle
  // the key event, so attempt to handle it here.
  switch (e.keyCode) {
    case Blockly.utils.KeyCodes.ENTER:
      if (highlighted) {
        highlighted.performActionInternal(e);
      }
      break;

    case Blockly.utils.KeyCodes.UP:
      this.highlightPrevious();
      break;

    case Blockly.utils.KeyCodes.DOWN:
      this.highlightNext();
      break;

    default:
      return false;
  }

  return true;
};
