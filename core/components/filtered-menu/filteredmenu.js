// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Menu where items can be filtered based on user keyboard input.
 * If a filter is specified only the items matching it will be displayed.
 *
 * @see ../demos/filteredmenu.html
 */

goog.provide('Blockly.FilteredMenu');

goog.require('Blockly.Component');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.style');
goog.require('Blockly.Menu');
goog.require('Blockly.MenuItem');

goog.require('goog.ui.FilterObservingMenuItem');
goog.require('Blockly.Menu');
goog.require('Blockly.MenuItem');

/**
 * Filtered menu class.
 * @constructor
 * @extends {Blockly.Menu}
 */
Blockly.FilteredMenu = function () {
  Blockly.Menu.call(this);
};
goog.inherits(Blockly.FilteredMenu, Blockly.Menu);

/**
 * Events fired by component.
 * @enum {string}
 */
Blockly.FilteredMenu.EventType = {
  /** Dispatched after the component filter criteria has been changed. */
  FILTER_CHANGED: 'filterchange'
};

/**
 * Filter menu element ids.
 * @enum {string}
 * @private
 */
Blockly.FilteredMenu.Id_ = {
  CONTENT_ELEMENT: 'content-el'
};

/**
 * Filter input element.
 * @type {Element|undefined}
 * @private
 */
Blockly.FilteredMenu.prototype.filterInput_;

/**
 * The input handler that provides the input event.
 * @type {goog.events.InputHandler|undefined}
 * @private
 */
Blockly.FilteredMenu.prototype.inputHandler_;

/**
 * Maximum number of characters for filter input.
 * @type {number}
 * @private
 */
Blockly.FilteredMenu.prototype.maxLength_ = 0;

/**
 * Label displayed in the filter input when no text has been entered.
 * @type {string}
 * @private
 */
Blockly.FilteredMenu.prototype.label_ = '';

/**
 * Label element.
 * @type {Element|undefined}
 * @private
 */
Blockly.FilteredMenu.prototype.labelEl_;

/**
 * Whether multiple items can be entered comma separated.
 * @type {boolean}
 * @private
 */
Blockly.FilteredMenu.prototype.allowMultiple_ = false;

/**
 * List of items entered in the search box if multiple entries are allowed.
 * @type {Array<string>|undefined}
 * @private
 */
Blockly.FilteredMenu.prototype.enteredItems_;

/**
 * Index of first item that should be affected by the filter. Menu items with
 * a lower index will not be affected by the filter.
 * @type {number}
 * @private
 */
Blockly.FilteredMenu.prototype.filterFromIndex_ = 0;

/**
 * Filter applied to the menu.
 * @type {string|undefined|null}
 * @private
 */
Blockly.FilteredMenu.prototype.filterStr_;

/**
 * @private {Element}
 */
Blockly.FilteredMenu.prototype.contentElement_;

/**
 * Map of child nodes that shouldn't be affected by filtering.
 * @type {Object|undefined}
 * @private
 */
Blockly.FilteredMenu.prototype.persistentChildren_;

/** @override */
Blockly.FilteredMenu.prototype.createDom = function () {
  Blockly.FilteredMenu.superClass_.createDom.call(this);

  var dom = this.getDomHelper();
  var el = dom.createDom(
    goog.dom.TagName.DIV,
    goog.getCssName(this.getRenderer().getCssClass(), 'filter'),
    this.labelEl_ = dom.createDom(goog.dom.TagName.DIV, null, this.label_),
    this.filterInput_ = dom.createDom(
      goog.dom.TagName.INPUT, { type: goog.dom.InputType.TEXT }));
  var element = this.getElement();
  dom.appendChild(element, el);
  var contentElementId = this.makeId(Blockly.FilteredMenu.Id_.CONTENT_ELEMENT);
  this.contentElement_ = dom.createDom(goog.dom.TagName.DIV, {
    class: goog.getCssName(this.getRenderer().getCssClass(), 'content'),
    id: contentElementId
  });
  dom.appendChild(element, this.contentElement_);

  this.initFilterInput_();

  goog.a11y.aria.setState(
    this.filterInput_, goog.a11y.aria.State.AUTOCOMPLETE,
    goog.a11y.aria.AutoCompleteValues.LIST);
  goog.a11y.aria.setState(
    this.filterInput_, goog.a11y.aria.State.OWNS, contentElementId);
  goog.a11y.aria.setState(
    this.filterInput_, goog.a11y.aria.State.EXPANDED, true);
};

/**
 * Helper method that initializes the filter input element.
 * @private
 */
Blockly.FilteredMenu.prototype.initFilterInput_ = function () {
  this.setFocusable(true);
  this.setKeyEventTarget(this.filterInput_);

  // Workaround for mozilla bug #236791.
  if (goog.userAgent.GECKO) {
    this.filterInput_.setAttribute('autocomplete', 'off');
  }

  if (this.maxLength_) {
    this.filterInput_.maxLength = this.maxLength_;
  }
};

/**
 * Sets up listeners and prepares the filter functionality.
 * @private
 */
Blockly.FilteredMenu.prototype.setUpFilterListeners_ = function () {
  if (!this.inputHandler_ && this.filterInput_) {
    this.inputHandler_ = new goog.events.InputHandler(
      /** @type {Element} */ (this.filterInput_));
    this.setUnselectable(this.filterInput_, false);
    goog.events.listen(
      this.inputHandler_, goog.events.InputHandler.EventType.INPUT,
      this.handleFilterEvent, false, this);
    goog.events.listen(
      this.filterInput_.parentNode, goog.events.EventType.CLICK,
      this.onFilterLabelClick_, false, this);
    if (this.allowMultiple_) {
      this.enteredItems_ = [];
    }
  }
};

/**
 * Tears down listeners and resets the filter functionality.
 * @private
 */
Blockly.FilteredMenu.prototype.tearDownFilterListeners_ = function () {
  if (this.inputHandler_) {
    goog.events.unlisten(
      this.inputHandler_, goog.events.InputHandler.EventType.INPUT,
      this.handleFilterEvent, false, this);
    goog.events.unlisten(
      this.filterInput_.parentNode, goog.events.EventType.CLICK,
      this.onFilterLabelClick_, false, this);

    this.inputHandler_.dispose();
    this.inputHandler_ = undefined;
    this.enteredItems_ = undefined;
  }
};

/** @override */
Blockly.FilteredMenu.prototype.setVisible = function (show, opt_force, opt_e) {
  var visibilityChanged = Blockly.FilteredMenu.superClass_.setVisible.call(
    this, show, opt_force, opt_e);
  if (visibilityChanged && show && this.isInDocument()) {
    this.setFilter('');
    this.setUpFilterListeners_();
  } else if (visibilityChanged && !show) {
    this.tearDownFilterListeners_();
  }

  return visibilityChanged;
};

/** @override */
Blockly.FilteredMenu.prototype.disposeInternal = function () {
  this.tearDownFilterListeners_();
  this.filterInput_ = undefined;
  this.labelEl_ = undefined;
  Blockly.FilteredMenu.superClass_.disposeInternal.call(this);
};

/**
 * Sets the filter label (the label displayed in the filter input element if no
 * text has been entered).
 * @param {?string} label Label text.
 */
Blockly.FilteredMenu.prototype.setFilterLabel = function (label) {
  this.label_ = label || '';
  if (this.labelEl_) {
    var node = this.labelEl_;
    var text = this.label_;

    if ('textContent' in node) {
      node.textContent = text;
    } else if (node.nodeType == 3) {
      node.data = text;
    } else if (node.firstChild &&
                 node.firstChild.nodeType == 3) {
      // If the first child is a text node we just change its data and remove the
      // rest of the children.
      while (node.lastChild != node.firstChild) {
        node.removeChild(node.lastChild);
      }
      node.firstChild.data = text;
    } else {
      var child;
      while ((child = node.firstChild)) {
        node.removeChild(child);
      }

      var doc = (node.nodeType == 9 ? node
        : node.ownerDocument || node.document);
      node.appendChild(doc.createTextNode(String(text)));
    }
  }
};

/**
 * @return {string} The filter label.
 */
Blockly.FilteredMenu.prototype.getFilterLabel = function () {
  return this.label_;
};

/**
 * Sets the filter string.
 * @param {?string} str Filter string.
 */
Blockly.FilteredMenu.prototype.setFilter = function (str) {
  if (this.filterInput_) {
    this.filterInput_.value = str;
    this.filterItems_(str);
  }
};

/**
 * Returns the filter string.
 * @return {string} Current filter or an an empty string.
 */
Blockly.FilteredMenu.prototype.getFilter = function () {
  return this.filterInput_ && typeof this.filterInput_.value === 'string'
    ? this.filterInput_.value
    : '';
};

/**
 * Sets the index of first item that should be affected by the filter. Menu
 * items with a lower index will not be affected by the filter.
 * @param {number} index Index of first item that should be affected by filter.
 */
Blockly.FilteredMenu.prototype.setFilterFromIndex = function (index) {
  this.filterFromIndex_ = index;
};

/**
 * Returns the index of first item that is affected by the filter.
 * @return {number} Index of first item that is affected by filter.
 */
Blockly.FilteredMenu.prototype.getFilterFromIndex = function () {
  return this.filterFromIndex_;
};

/**
 * Gets a list of items entered in the search box.
 * @return {!Array<string>} The entered items.
 */
Blockly.FilteredMenu.prototype.getEnteredItems = function () {
  return this.enteredItems_ || [];
};

/**
 * Sets whether multiple items can be entered comma separated.
 * @param {boolean} b Whether multiple items can be entered.
 */
Blockly.FilteredMenu.prototype.setAllowMultiple = function (b) {
  this.allowMultiple_ = b;
};

/**
 * @return {boolean} Whether multiple items can be entered comma separated.
 */
Blockly.FilteredMenu.prototype.getAllowMultiple = function () {
  return this.allowMultiple_;
};

/**
 * Sets whether the specified child should be affected (shown/hidden) by the
 * filter criteria.
 * @param {Blockly.Component} child Child to change.
 * @param {boolean} persistent Whether the child should be persistent.
 */
Blockly.FilteredMenu.prototype.setPersistentVisibility = function (
  child, persistent) {
  if (!this.persistentChildren_) {
    this.persistentChildren_ = {};
  }
  this.persistentChildren_[child.getId()] = persistent;
};

/**
 * Returns whether the specified child should be affected (shown/hidden) by the
 * filter criteria.
 * @param {Blockly.Component} child Menu item to check.
 * @return {boolean} Whether the menu item is persistent.
 */
Blockly.FilteredMenu.prototype.hasPersistentVisibility = function (child) {
  return !!(
    this.persistentChildren_ && this.persistentChildren_[child.getId()]);
};

/**
 * Handles filter input events.
 * @param {goog.events.BrowserEvent} e The event object.
 */
Blockly.FilteredMenu.prototype.handleFilterEvent = function (e) {
  this.filterItems_(this.filterInput_.value);

  // Highlight the first visible item unless there's already a highlighted item.
  var highlighted = this.getHighlighted();
  if (!highlighted || !highlighted.isVisible()) {
    this.highlightFirst();
  }
  this.dispatchEvent(Blockly.FilteredMenu.EventType.FILTER_CHANGED);
};

/**
 * Shows/hides elements based on the supplied filter.
 * @param {?string} str Filter string.
 * @private
 */
Blockly.FilteredMenu.prototype.filterItems_ = function (str) {
  // Do nothing unless the filter string has changed.
  if (this.filterStr_ == str) {
    return;
  }

  if (this.labelEl_) {
    this.labelEl_.style.visibility = str == '' ? 'visible' : 'hidden';
  }

  if (this.allowMultiple_ && this.enteredItems_) {
    // Matches all non space characters after the last comma.
    var lastWordRegExp = /^(.+),[ ]*([^,]*)$/;
    var matches = str.match(lastWordRegExp);
    // matches[1] is the string up to, but not including, the last comma and
    // matches[2] the part after the last comma. If there are no non-space
    // characters after the last comma matches[2] is undefined.
    var items = matches && matches[1] ? matches[1].split(',') : [];

    // If the number of comma separated items has changes recreate the
    // entered items array and fire a change event.
    if (str.substr(str.length - 1, 1) == ',' ||
        items.length != this.enteredItems_.length) {
      var lastItem = items[items.length - 1] || '';

      // Auto complete text in input box based on the highlighted item.
      if (this.getHighlighted() && lastItem != '') {
        var caption = this.getHighlighted().getCaption();
        if (caption.toLowerCase().indexOf(lastItem.toLowerCase()) == 0) {
          items[items.length - 1] = caption;
          this.filterInput_.value = items.join(',') + ',';
        }
      }
      this.enteredItems_ = items;
      //   this.dispatchEvent('change');
      this.setHighlightedIndex(-1);
    }

    if (matches) {
      str = matches.length > 2 ? matches[2].trim() : '';
    }
  }

  var matcher =
      new RegExp('(^|[- ,_/.:])' + this.regExpEscape(str), 'i');
  for (var child, i = this.filterFromIndex_; child = this.getChildAt(i); i++) {
    if (child instanceof goog.ui.FilterObservingMenuItem) {
      child.callObserver(str);
    } else if (!this.hasPersistentVisibility(child)) {
      // Only show items matching the filter and highlight the part of the
      // caption that matches.
      var caption = child.getCaption();
      if (caption) {
        var matchArray = caption.match(matcher);
        if (str == '' || matchArray) {
          child.setVisible(true);
          var pos = caption.indexOf(matchArray[0]);

          // If position is non zero increase by one to skip the separator.
          if (pos) {
            pos++;
          }
          this.boldContent(child, pos, str.length);
        } else {
          child.setVisible(false);
        }
      } else {
        // Hide separators and other items without a caption if a filter string
        // has been entered.
        child.setVisible(str == '');
      }
    }
  }
  this.filterStr_ = str;
};

/**
 * Updates the content of the given menu item, bolding the part of its caption
 * from start and through the next len characters.
 * @param {!goog.ui.Control} child The control to bold content on.
 * @param {number} start The index at which to start bolding.
 * @param {number} len How many characters to bold.
 * @protected
 */
Blockly.FilteredMenu.prototype.boldContent = function (child, start, len) {
  var caption = child.getCaption();
  var boldedCaption;
  if (len == 0) {
    boldedCaption = this.getDomHelper().createTextNode(caption);
  } else {
    var preMatch = caption.substr(0, start);
    var match = caption.substr(start, len);
    var postMatch = caption.substr(start + len);
    boldedCaption = this.getDomHelper().createDom(
      'SPAN', null, preMatch,
      this.getDomHelper().createDom(goog.dom.TagName.B, null, match),
      postMatch);
  }
  var accelerator = child.getAccelerator && child.getAccelerator();
  if (accelerator) {
    child.setContent([
      boldedCaption, this.getDomHelper().createDom(
        goog.dom.TagName.SPAN,
        Blockly.MenuItem.ACCELERATOR_CLASS, accelerator)
    ]);
  } else {
    child.setContent(boldedCaption);
  }
};

/**
 * Handles the menu's behavior for a key event. The highlighted menu item will
 * be given the opportunity to handle the key behavior.
 * @param {goog.events.KeyEvent} e A browser event.
 * @return {boolean} Whether the event was handled.
 * @override
 */
Blockly.FilteredMenu.prototype.handleKeyEventInternal = function (e) {
  // Home, end and the arrow keys are normally used to change the selected menu
  // item. Return false here to prevent the menu from preventing the default
  // behavior for HOME, END and any key press with a modifier.
  // 36 is HOME,  35 is END
  if (e.shiftKey || e.ctrlKey || e.altKey ||
      e.keyCode === 36 ||
      e.keyCode === 35) {
    return false;
  }

  // Escape
  if (e.keyCode === 27) {
    this.blur();
    return true;
  }

  return Blockly.FilteredMenu.superClass_.handleKeyEventInternal.call(this, e);
};

/**
 * Sets the highlighted index, unless the HIGHLIGHT event is intercepted and
 * cancelled.  -1 = no highlight. Also scrolls the menu item into view.
 * @param {number} index Index of menu item to highlight.
 * @override
 */
Blockly.FilteredMenu.prototype.setHighlightedIndex = function (index) {
  Blockly.FilteredMenu.superClass_.setHighlightedIndex.call(this, index);
  var contentEl = this.getContentElement();
  var el = /** @type {!HTMLElement} */ (
    this.getHighlighted() ? this.getHighlighted().getElement() : null);
  if (this.filterInput_) {
    goog.a11y.aria.setActiveDescendant(this.filterInput_, el);
  }

  if (el && goog.dom.contains(contentEl, el)) {
    var contentTop = goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(8)
      ? 0
      : contentEl.offsetTop;

    // IE (tested on IE8) sometime does not scroll enough by about
    // 1px. So we add 1px to the scroll amount. This still looks ok in
    // other browser except for the most degenerate case (menu height <=
    // item height).

    // Scroll down if the highlighted item is below the bottom edge.
    var diff = (el.offsetTop + el.offsetHeight - contentTop) -
        (contentEl.clientHeight + contentEl.scrollTop) + 1;
    contentEl.scrollTop += Math.max(diff, 0);

    // Scroll up if the highlighted item is above the top edge.
    diff = contentEl.scrollTop - (el.offsetTop - contentTop) + 1;
    contentEl.scrollTop -= Math.max(diff, 0);
  }
};

/**
 * Handles clicks on the filter label. Focuses the input element.
 * @param {goog.events.BrowserEvent} e A browser event.
 * @private
 */
Blockly.FilteredMenu.prototype.onFilterLabelClick_ = function (e) {
  this.filterInput_.focus();
};

/** @override */
Blockly.FilteredMenu.prototype.getContentElement = function () {
  return this.contentElement_ || this.getElement();
};

/**
 * Returns the filter input element.
 * @return {Element} Input element.
 */
Blockly.FilteredMenu.prototype.getFilterInputElement = function () {
  return this.filterInput_ || null;
};

/** @override */
Blockly.FilteredMenu.prototype.decorateInternal = function (element) {
  this.setElementInternal(element);

  // Decorate the menu content.
  this.decorateContent(element);

  // Locate internally managed elements.
  var el = this.getDomHelper().getElementsByTagNameAndClass(
    goog.dom.TagName.DIV,
    goog.getCssName(this.getRenderer().getCssClass(), 'filter'), element)[0];
  this.labelEl_ = this.getFirstElementChild(el);
  this.filterInput_ = this.getNextElementSibling(this.labelEl_);
  this.contentElement_ = this.getNextElementSibling(el);

  // Decorate additional menu items (like 'apply').
  this.getRenderer().decorateChildren(
    this,
    /** @type {!Element} */ (el.parentNode), this.contentElement_);

  this.initFilterInput_();
};

Blockly.FilteredMenu.getFirstElementChild = function (node) {
  if (node.firstElementChild != undefined) {
    return /** @type {Element} */(node).firstElementChild;
  }
  return Blockly.FilteredMenu.getNextElementNode_(node.firstChild, true);
};

Blockly.FilteredMenu.getNextElementSibling = function (node) {
  if (node.nextElementSibling != undefined) {
    return /** @type {Element} */(node).nextElementSibling;
  }
  return Blockly.FilteredMenu.getNextElementNode_(node.nextSibling, true);
};

Blockly.FilteredMenu.getNextElementNode_ = function (node, forward) {
  while (node && node.nodeType != 1) {
    node = forward ? node.nextSibling : node.previousSibling;
  }

  return /** @type {Element} */ (node);
};

Blockly.FilteredMenu.prototype.regExpEscape = function (s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1')
    .replace(/\x08/g, '\\x08');
};

Blockly.FilteredMenu.setUnselectable = function (el, unselectable, opt_noRecurse) {
  // TODO(attila): Do we need all of TR_DomUtil.makeUnselectable() in Closure?
  var descendants = !opt_noRecurse ? el.getElementsByTagName('*') : null;
  var name = this.unselectableStyle_();

  if (name) {
    // Add/remove the appropriate CSS style to/from the element and its
    // descendants.
    var value = unselectable ? 'none' : '';
    el.style[name] = value;
    if (descendants) {
      for (var i = 0, descendant; descendant = descendants[i]; i++) {
        descendant.style[name] = value;
      }
    }
  } else if (Blockly.utils.userAgent.IE || Blockly.utils.userAgent.OPERA) {
    // Toggle the 'unselectable' attribute on the element and its descendants.
    var value = unselectable ? 'on' : '';
    el.setAttribute('unselectable', value);
    if (descendants) {
      for (var i = 0, descendant; descendant = descendants[i]; i++) {
        descendant.setAttribute('unselectable', value);
      }
    }
  }
};

Blockly.FilteredMenu.unselectableStyle_ = function () {
  return Blockly.utils.userAgent.GECKO
    ? 'MozUserSelect' : Blockly.utils.userAgent.WEBKIT ? 'WebkitUserSelect'
      : null;
};
