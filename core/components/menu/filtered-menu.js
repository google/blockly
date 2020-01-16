/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Blockly menu similar to Closure's goog.ui.Menu
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.FilteredMenu');

goog.require('Blockly.Set');
goog.require('Blockly.Trie');
goog.require('Blockly.Component');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');

/**
 * A basic menu class.
 * @constructor
 * @extends {Blockly.Component}
 */
Blockly.FilteredMenu = function () {
  Blockly.Component.call(this);

  /**
   * This is the element that we will listen to the real focus events on.
   * A value of -1 means no menuitem is highlighted.
   * @type {number}
   * @private
   */
  this.highlightedIndex_ = -1;

  // Initializes a trie. The trie is the way blocks are stored for quick search results.
  this.optionsTrie_ = new Blockly.Trie();
};
Blockly.utils.object.inherits(Blockly.FilteredMenu, Blockly.Component);

/**
 * Creates the menu DOM.
 * @override
 */
Blockly.FilteredMenu.prototype.createDom = function () {
  var element = document.createElement('div');
  element.id = this.getId();
  this.setElementInternal(element);

  // Set class
  element.className = 'goog-menu goog-menu-vertical blocklyNonSelectable';
  element.tabIndex = 0;

  // Initialize ARIA role.
  Blockly.utils.aria.setRole(element,
    this.roleName_ || Blockly.utils.aria.Role.MENU);

  var search = document.createElement('div');
  search.className = 'goog-menu-filter';
  search.style = 'user-select: none;';

  var innerSearchDiv = document.createElement('div');
  innerSearchDiv.style = 'user-select: none; visibility: visible;';
  search.appendChild(innerSearchDiv);

  this.filterInput_ = document.createElement('input');
  this.filterInput_.setAttribute('type', 'text');
  this.filterInput_.setAttribute('aria-autocomplete', 'list');
  this.filterInput_.setAttribute('aria-owns', ':2j:content-el');
  this.filterInput_.setAttribute('aria-expanded', 'true');
  // TODO: Localize
  this.filterInput_.setAttribute('placeholder', 'Search');
  this.filterInput_.setAttribute('id', 'dropdownSearchInput');
  this.filterInput_.setAttribute('tabindex', '0');
  search.appendChild(this.filterInput_);

  element.appendChild(search);

  this.noResults_ = document.createElement('div');
  this.noResults_.style = 'user-select: none; display: none;';
  this.noResults_.className = 'goog-menuitem-content';
  this.noResults_.id = 'dropdownSearchNoResults';
  this.noResults_.innerHTML = 'No results found';

  element.appendChild(this.noResults_);
};

/**
 * Focus the menu element.
 * @package
 */
Blockly.FilteredMenu.prototype.focus = function () {
  var el = this.getElement();
  if (el) {
    el.focus();
    Blockly.utils.dom.addClass(el, 'focused');
  }
};

/**
 * Blur the menu element.
 * @package
 */
Blockly.FilteredMenu.prototype.blur = function () {
  var el = this.getElement();
  if (el) {
    el.blur();
    Blockly.utils.dom.removeClass(el, 'focused');
  }
};

/**
 * Set the menu accessibility role.
 * @param {!Blockly.utils.aria.Role|string} roleName role name.
 * @package
 */
Blockly.FilteredMenu.prototype.setRole = function (roleName) {
  this.roleName_ = roleName;
};

/** @override */
Blockly.FilteredMenu.prototype.enterDocument = function () {
  Blockly.FilteredMenu.superClass_.enterDocument.call(this);

  this.forEachChild(function (child) {
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
Blockly.FilteredMenu.prototype.exitDocument = function () {
  // {@link #setHighlightedIndex} has to be called before
  // {@link Blockly.Component#exitDocument}, otherwise it has no effect.
  this.setHighlightedIndex(-1);

  Blockly.FilteredMenu.superClass_.exitDocument.call(this);
};

/** @override */
Blockly.FilteredMenu.prototype.disposeInternal = function () {
  Blockly.FilteredMenu.superClass_.disposeInternal.call(this);

  this.detachEvents_();
};

/**
 * Adds the event listeners to the menu.
 * @private
 */
Blockly.FilteredMenu.prototype.attachEvents_ = function () {
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

  // this.onClickSearchHandler_ = Blockly.bindEventWithChecks_(this.filterInput_,
  // 'click', this, this.handleSearchEnter);
  this.onSearchKeyUpHandler_ = Blockly.bindEventWithChecks_(this.filterInput_,
    'keyup', this, this.handleSearchKeyUp);
};

/**
 * Removes the event listeners from the menu.
 * @private
 */
Blockly.FilteredMenu.prototype.detachEvents_ = function () {
  Blockly.unbindEvent_(this.mouseOverHandler_);
  Blockly.unbindEvent_(this.clickHandler_);
  Blockly.unbindEvent_(this.mouseEnterHandler_);
  Blockly.unbindEvent_(this.mouseLeaveHandler_);
  Blockly.unbindEvent_(this.onKeyDownWrapper_);

  // Blockly.unbindEvent_(this.onClickSearchHandler_);
  Blockly.unbindEvent_(this.onSearchKeyUpHandler_);
};

// Child component management.

/**
 * Map of DOM IDs to child menuitems. Each key is the DOM ID of a child
 * menuitems's root element; each value is a reference to the child menu
 * item itself.
 * @type {?Object}
 * @private
 */
Blockly.FilteredMenu.prototype.childElementIdMap_ = null;

/**
 * Creates a DOM ID for the child menuitem and registers it to an internal
 * hash table to be able to find it fast by id.
 * @param {Blockly.Component} child The child menuitem. Its root element has
 *     to be created yet.
 * @private
 */
Blockly.FilteredMenu.prototype.registerChildId_ = function (child) {
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
 * @return {?Blockly.FilteredMenuItem} menuitem for which the DOM node belongs to.
 * @protected
 */
Blockly.FilteredMenu.prototype.getMenuItem = function (node) {
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
Blockly.FilteredMenu.prototype.unhighlightCurrent = function () {
  var highlighted = this.getHighlighted();
  if (highlighted) {
    highlighted.setHighlighted(false);
  }
};

/**
 * Clears the currently highlighted item.
 * @protected
 */
Blockly.FilteredMenu.prototype.clearHighlighted = function () {
  this.unhighlightCurrent();
  this.setHighlightedIndex(-1);
};

/**
 * Returns the currently highlighted item (if any).
 * @return {?Blockly.Component} Highlighted item (null if none).
 * @protected
 */
Blockly.FilteredMenu.prototype.getHighlighted = function () {
  return this.getChildAt(this.highlightedIndex_);
};

/**
 * Highlights the item at the given 0-based index (if any). If another item
 * was previously highlighted, it is un-highlighted.
 * @param {number} index Index of item to highlight (-1 removes the current
 *     highlight).
 * @protected
 */
Blockly.FilteredMenu.prototype.setHighlightedIndex = function (index) {
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
 * @param {Blockly.FilteredMenuItem} item Item to highlight.
 * @protected
 */
Blockly.FilteredMenu.prototype.setHighlighted = function (item) {
  this.setHighlightedIndex(this.indexOfChild(item));
};

/**
 * Highlights the next highlightable item (or the first if nothing is currently
 * highlighted).
 * @package
 */
Blockly.FilteredMenu.prototype.highlightNext = function () {
  this.unhighlightCurrent();
  this.highlightHelper(function (index, max) {
    return (index + 1) % max;
  }, this.highlightedIndex_);
};

/**
 * Highlights the previous highlightable item (or the last if nothing is
 * currently highlighted).
 * @package
 */
Blockly.FilteredMenu.prototype.highlightPrevious = function () {
  this.unhighlightCurrent();
  this.highlightHelper(function (index, max) {
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
Blockly.FilteredMenu.prototype.highlightHelper = function (fn, startIndex) {
  // If the start index is -1 (meaning there's nothing currently highlighted),
  // try starting from the currently open item, if any.
  var curIndex =
      startIndex < 0 ? -1 : startIndex;
  var numItems = this.getChildCount();

  curIndex = fn.call(this, curIndex, numItems);
  var visited = 0;
  while (visited <= numItems) {
    var menuItem = /** @type {Blockly.FilteredMenuItem} */ (this.getChildAt(curIndex));
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
 * @param {Blockly.FilteredMenuItem} item The item to check.
 * @return {boolean} Whether the item can be highlighted.
 * @protected
 */
Blockly.FilteredMenu.prototype.canHighlightItem = function (item) {
  return item.isEnabled();
};

// Mouse events.

/**
 * Handles mouseover events. Highlight menuitems as the user
 * hovers over them.
 * @param {Event} e Mouse event to handle.
 * @private
 */
Blockly.FilteredMenu.prototype.handleMouseOver_ = function (e) {
  var menuItem = this.getMenuItem(/** @type {Node} */ (e.target));

  if (menuItem) {
    if (menuItem.isEnabled()) {
      var currentHighlighted = this.getHighlighted();
      if (currentHighlighted === menuItem) {
        return;
      }

      this.unhighlightCurrent();
      this.setHighlighted(menuItem);
    }
  }
};

/**
 * Handles click events. Pass the event onto the child
 * menuitem to handle.
 * @param {Event} e Click to handle.
 * @private
 */
Blockly.FilteredMenu.prototype.handleClick_ = function (e) {
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
Blockly.FilteredMenu.prototype.handleMouseEnter_ = function (_e) {
  this.focus();
};

/**
 * Handles mouse leave events. Blur and clear highlight.
 * @param {Event} _e Mouse event to handle.
 * @private
 */
Blockly.FilteredMenu.prototype.handleMouseLeave_ = function (_e) {
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
Blockly.FilteredMenu.prototype.handleKeyEvent = function (e) {
  if (this.getChildCount() !== 0 &&
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
Blockly.FilteredMenu.prototype.handleKeyEventInternal = function (e) {
  // Give the highlighted menuitem the chance to handle the key event.
  var highlighted = this.getHighlighted();
  if (highlighted && typeof highlighted.handleKeyEvent === 'function' &&
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

Blockly.FilteredMenu.prototype.handleSearchKeyUp = function (e) {
  // Do not handle the key event if any modifier key is pressed.
  if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return false;
  }

  // Either nothing is highlighted, or the highlighted menuitem didn't handle
  // the key event, so attempt to handle it here.
  switch (e.keyCode) {
    case Blockly.utils.KeyCodes.ENTER:
      var highlighted = this.getHighlighted();

      if (highlighted) {
        highlighted.performActionInternal(e);
      }
      return true;

    case Blockly.utils.KeyCodes.ESC:
      this.filterInput_.blur();
      this.filterInput_.value = '';

      for (let i = 0; i < this.children_.length; i++) {
        const child = this.children_[i];
        child.element_.style.display = 'block';
      }

      return true;

    // case Blockly.utils.KeyCodes.UP:
    //   this.highlightPrevious();
    //   return true;

    // case Blockly.utils.KeyCodes.DOWN:
    //   this.highlightNext();
    //   return true;
  }

  const newSearchVal = this.filterInput_.value;

  // Prepare the contents of the search by trimming, lowercasing and splitting by whitespace
  var searchTerms = newSearchVal.trim().toLowerCase().split(/\s+/);

  // Remove those elements of the search terms that are empty (so no empty strings are in the search)
  searchTerms = Blockly.Toolbox.TreeSearch.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  // //Initialize a list that will hold the results
  var finalResults = [];

  if (searchTerms.length > 0) {
    finalResults = this.optionsMatchingSearchTerms_(searchTerms);
  } else {
    finalResults = this.children_;
  }

  for (let i = 0; i < this.children_.length; i++) {
    const child = this.children_[i];

    if (finalResults.indexOf(child.id_) >= 0 ||
        finalResults.indexOf(child) >= 0) {
      child.element_.style.display = 'block';
      child.setEnabled(true);
    } else {
      child.element_.style.display = 'none';
      child.setEnabled(false);
    }
  }

  if (finalResults.length === 0) {
    this.noResults_.style = 'user-select: none; display: block;';
  } else {
    this.noResults_.style = 'user-select: none; display: none;';
  }
};

Blockly.FilteredMenu.prototype.addChild = function (menuItem, optRender) {
  Blockly.FilteredMenu.superClass_.addChild.call(this, menuItem, optRender);

  let content = menuItem.content_;

  if (typeof content !== 'string') {
    content = menuItem.value_;
  }

  // Clean the string (trim, lowercase, etc). Then split by whitespace.
  const splitText = content.trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi , '').split(' ');

  // Go through the single words of the element after splitting it.
  for (let j = 0; j < splitText.length; j++) {
    const text = splitText[j];

    // Add the keyword to the block's keywords
    if (text && text != '') {
      this.addToTrie(text, menuItem.id_);
    }
  }
};

Blockly.FilteredMenu.prototype.addToTrie = function (key, value) {
  // Add the keyword to the trie, if it doesn't exist
  if (!this.optionsTrie_.containsKey(key)) {
    this.optionsTrie_.add(key, []);
  }

  // Add the block data to the keyword's values
  this.optionsTrie_.set(key, this.optionsTrie_.get(key).concat(value));
};

Blockly.FilteredMenu.prototype.optionsMatchingSearchTerms_ = function (terms) {
  var intersectingMatches = null;

  // Go through each word in the terms
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].length === 0) {
      continue;
    }

    // Get a set with all of the results for that word
    var matchSet = new Blockly.Set(this.optionsMatchingSearchTerm_(terms[i]));

    // Intersect the results with previous results (if any)
    if (intersectingMatches) {
      intersectingMatches = intersectingMatches.intersection(matchSet);
    } else {
      intersectingMatches = matchSet;
    }
  }

  return intersectingMatches.getValues();
};

Blockly.FilteredMenu.prototype.optionsMatchingSearchTerm_ = function (term) {
  if (!this.optionsTrie_) {
    return [];
  }

  var keys = this.optionsTrie_.getKeys(term.toLowerCase());
  var options = [];

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var optionsForKey = this.optionsTrie_.get(key);

    for (var j = 0; j < optionsForKey.length; j++) {
      options.push(optionsForKey[j]);
    }
  }

  return options;
};

Blockly.FilteredMenu.prototype.clearAll = function () {
  delete this.optionsTrie_;

  this.optionsTrie_ = new Blockly.Trie();
};
