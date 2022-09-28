/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Blockly menu similar to Closure's goog.ui.Menu
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.Menu');

import * as browserEvents from './browser_events.js';
import type {MenuItem} from './menuitem.js';
import * as aria from './utils/aria.js';
import {Coordinate} from './utils/coordinate.js';
import * as dom from './utils/dom.js';
import {KeyCodes} from './utils/keycodes.js';
import type {Size} from './utils/size.js';
import * as style from './utils/style.js';


/**
 * A basic menu class.
 *
 * @alias Blockly.Menu
 */
export class Menu {
  /**
   * Array of menu items.
   * (Nulls are never in the array, but typing the array as nullable prevents
   * the compiler from objecting to .indexOf(null))
   */
  private readonly menuItems_: MenuItem[] = [];

  /**
   * Coordinates of the mousedown event that caused this menu to open. Used to
   * prevent the consequent mouseup event due to a simple click from
   * activating a menu item immediately.
   */
  openingCoords: Coordinate|null = null;

  /**
   * This is the element that we will listen to the real focus events on.
   * A value of null means no menu item is highlighted.
   */
  private highlightedItem_: MenuItem|null = null;

  /** Mouse over event data. */
  private mouseOverHandler_: browserEvents.Data|null = null;

  /** Click event data. */
  private clickHandler_: browserEvents.Data|null = null;

  /** Mouse enter event data. */
  private mouseEnterHandler_: browserEvents.Data|null = null;

  /** Mouse leave event data. */
  private mouseLeaveHandler_: browserEvents.Data|null = null;

  /** Key down event data. */
  private onKeyDownHandler_: browserEvents.Data|null = null;

  /** The menu's root DOM element. */
  private element_: HTMLDivElement|null = null;

  /** ARIA name for this menu. */
  private roleName_: aria.Role|null = null;

  /** Constructs a new Menu instance. */
  constructor() {}

  /**
   * Add a new menu item to the bottom of this menu.
   *
   * @param menuItem Menu item to append.
   * @internal
   */
  addChild(menuItem: MenuItem) {
    this.menuItems_.push(menuItem);
  }

  /**
   * Creates the menu DOM.
   *
   * @param container Element upon which to append this menu.
   * @returns The menu's root DOM element.
   */
  render(container: Element): HTMLDivElement {
    const element = (document.createElement('div'));
    // goog-menu is deprecated, use blocklyMenu.  May 2020.
    element.className = 'blocklyMenu goog-menu blocklyNonSelectable';
    element.tabIndex = 0;
    if (this.roleName_) {
      aria.setRole(element, this.roleName_);
    }
    this.element_ = element;

    // Add menu items.
    for (let i = 0, menuItem; menuItem = this.menuItems_[i]; i++) {
      element.appendChild(menuItem.createDom());
    }

    // Add event handlers.
    this.mouseOverHandler_ = browserEvents.conditionalBind(
        element, 'mouseover', this, this.handleMouseOver_, true);
    this.clickHandler_ = browserEvents.conditionalBind(
        element, 'click', this, this.handleClick_, true);
    this.mouseEnterHandler_ = browserEvents.conditionalBind(
        element, 'mouseenter', this, this.handleMouseEnter_, true);
    this.mouseLeaveHandler_ = browserEvents.conditionalBind(
        element, 'mouseleave', this, this.handleMouseLeave_, true);
    this.onKeyDownHandler_ = browserEvents.conditionalBind(
        element, 'keydown', this, this.handleKeyEvent_);

    container.appendChild(element);
    return element;
  }

  /**
   * Gets the menu's element.
   *
   * @returns The DOM element.
   * @internal
   */
  getElement(): HTMLDivElement|null {
    return this.element_;
  }

  /**
   * Focus the menu element.
   *
   * @internal
   */
  focus() {
    const el = this.getElement();
    if (el) {
      el.focus({preventScroll: true});
      dom.addClass(el, 'blocklyFocused');
    }
  }

  /** Blur the menu element. */
  private blur_() {
    const el = this.getElement();
    if (el) {
      el.blur();
      dom.removeClass(el, 'blocklyFocused');
    }
  }

  /**
   * Set the menu accessibility role.
   *
   * @param roleName role name.
   * @internal
   */
  setRole(roleName: aria.Role) {
    this.roleName_ = roleName;
  }

  /** Dispose of this menu. */
  dispose() {
    // Remove event handlers.
    if (this.mouseOverHandler_) {
      browserEvents.unbind(this.mouseOverHandler_);
      this.mouseOverHandler_ = null;
    }
    if (this.clickHandler_) {
      browserEvents.unbind(this.clickHandler_);
      this.clickHandler_ = null;
    }
    if (this.mouseEnterHandler_) {
      browserEvents.unbind(this.mouseEnterHandler_);
      this.mouseEnterHandler_ = null;
    }
    if (this.mouseLeaveHandler_) {
      browserEvents.unbind(this.mouseLeaveHandler_);
      this.mouseLeaveHandler_ = null;
    }
    if (this.onKeyDownHandler_) {
      browserEvents.unbind(this.onKeyDownHandler_);
      this.onKeyDownHandler_ = null;
    }

    // Remove menu items.
    for (let i = 0, menuItem; menuItem = this.menuItems_[i]; i++) {
      menuItem.dispose();
    }
    this.element_ = null;
  }

  // Child component management.

  /**
   * Returns the child menu item that owns the given DOM element,
   * or null if no such menu item is found.
   *
   * @param elem DOM element whose owner is to be returned.
   * @returns Menu item for which the DOM element belongs to.
   */
  private getMenuItem_(elem: Element): MenuItem|null {
    const menuElem = this.getElement();
    // Node might be the menu border (resulting in no associated menu item), or
    // a menu item's div, or some element within the menu item.
    // Walk up parents until one meets either the menu's root element, or
    // a menu item's div.
    let currentElement: Element|null = elem;
    while (currentElement && currentElement !== menuElem) {
      if (currentElement.classList.contains('blocklyMenuItem')) {
        // Having found a menu item's div, locate that menu item in this menu.
        for (let i = 0, menuItem; menuItem = this.menuItems_[i]; i++) {
          if (menuItem.getElement() === currentElement) {
            return menuItem;
          }
        }
      }
      currentElement = currentElement.parentElement;
    }
    return null;
  }

  // Highlight management.

  /**
   * Highlights the given menu item, or clears highlighting if null.
   *
   * @param item Item to highlight, or null.
   * @internal
   */
  setHighlighted(item: MenuItem|null) {
    const currentHighlighted = this.highlightedItem_;
    if (currentHighlighted) {
      currentHighlighted.setHighlighted(false);
      this.highlightedItem_ = null;
    }
    if (item) {
      item.setHighlighted(true);
      this.highlightedItem_ = item;
      // Bring the highlighted item into view. This has no effect if the menu is
      // not scrollable.
      const el = this.getElement() as Element;
      style.scrollIntoContainerView(item.getElement() as Element, el);

      aria.setState(el, aria.State.ACTIVEDESCENDANT, item.getId());
    }
  }

  /**
   * Highlights the next highlightable item (or the first if nothing is
   * currently highlighted).
   *
   * @internal
   */
  highlightNext() {
    const index = this.highlightedItem_ ?
        this.menuItems_.indexOf(this.highlightedItem_) :
        -1;
    this.highlightHelper_(index, 1);
  }

  /**
   * Highlights the previous highlightable item (or the last if nothing is
   * currently highlighted).
   *
   * @internal
   */
  highlightPrevious() {
    const index = this.highlightedItem_ ?
        this.menuItems_.indexOf(this.highlightedItem_) :
        -1;
    this.highlightHelper_(index < 0 ? this.menuItems_.length : index, -1);
  }

  /** Highlights the first highlightable item. */
  private highlightFirst_() {
    this.highlightHelper_(-1, 1);
  }

  /** Highlights the last highlightable item. */
  private highlightLast_() {
    this.highlightHelper_(this.menuItems_.length, -1);
  }

  /**
   * Helper function that manages the details of moving the highlight among
   * child menuitems in response to keyboard events.
   *
   * @param startIndex Start index.
   * @param delta Step direction: 1 to go down, -1 to go up.
   */
  private highlightHelper_(startIndex: number, delta: number) {
    let index = startIndex + delta;
    let menuItem;
    while (menuItem = this.menuItems_[index]) {
      if (menuItem.isEnabled()) {
        this.setHighlighted(menuItem);
        break;
      }
      index += delta;
    }
  }

  // Mouse events.

  /**
   * Handles mouseover events. Highlight menuitems as the user hovers over them.
   *
   * @param e Mouse event to handle.
   */
  private handleMouseOver_(e: Event) {
    const menuItem = this.getMenuItem_(e.target as Element);

    if (menuItem) {
      if (menuItem.isEnabled()) {
        if (this.highlightedItem_ !== menuItem) {
          this.setHighlighted(menuItem);
        }
      } else {
        this.setHighlighted(null);
      }
    }
  }

  /**
   * Handles click events. Pass the event onto the child menuitem to handle.
   *
   * @param e Click event to handle.
   */
  private handleClick_(e: Event) {
    const oldCoords = this.openingCoords;
    // Clear out the saved opening coords immediately so they're not used twice.
    this.openingCoords = null;
    // AnyDuringMigration because:  Property 'clientX' does not exist on type
    // 'Event'.
    if (oldCoords && typeof (e as AnyDuringMigration).clientX === 'number') {
      // AnyDuringMigration because:  Property 'clientY' does not exist on type
      // 'Event'. AnyDuringMigration because:  Property 'clientX' does not exist
      // on type 'Event'.
      const newCoords = new Coordinate(
          (e as AnyDuringMigration).clientX, (e as AnyDuringMigration).clientY);
      if (Coordinate.distance(oldCoords, newCoords) < 1) {
        // This menu was opened by a mousedown and we're handling the consequent
        // click event. The coords haven't changed, meaning this was the same
        // opening event. Don't do the usual behavior because the menu just
        // popped up under the mouse and the user didn't mean to activate this
        // item.
        return;
      }
    }

    const menuItem = this.getMenuItem_(e.target as Element);
    if (menuItem) {
      menuItem.performAction();
    }
  }

  /**
   * Handles mouse enter events. Focus the element.
   *
   * @param _e Mouse event to handle.
   */
  private handleMouseEnter_(_e: Event) {
    this.focus();
  }

  /**
   * Handles mouse leave events. Blur and clear highlight.
   *
   * @param _e Mouse event to handle.
   */
  private handleMouseLeave_(_e: Event) {
    if (this.getElement()) {
      this.blur_();
      this.setHighlighted(null);
    }
  }

  // Keyboard events.

  /**
   * Attempts to handle a keyboard event, if the menu item is enabled, by
   * calling
   * {@link Menu#handleKeyEventInternal_}.
   *
   * @param e Key event to handle.
   */
  private handleKeyEvent_(e: Event) {
    if (!this.menuItems_.length) {
      // Empty menu.
      return;
    }
    // AnyDuringMigration because:  Property 'altKey' does not exist on type
    // 'Event'. AnyDuringMigration because:  Property 'metaKey' does not exist
    // on type 'Event'. AnyDuringMigration because:  Property 'ctrlKey' does not
    // exist on type 'Event'. AnyDuringMigration because:  Property 'shiftKey'
    // does not exist on type 'Event'.
    if ((e as AnyDuringMigration).shiftKey ||
        (e as AnyDuringMigration).ctrlKey ||
        (e as AnyDuringMigration).metaKey || (e as AnyDuringMigration).altKey) {
      // Do not handle the key event if any modifier key is pressed.
      return;
    }

    const highlighted = this.highlightedItem_;
    // AnyDuringMigration because:  Property 'keyCode' does not exist on type
    // 'Event'.
    switch ((e as AnyDuringMigration).keyCode) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        if (highlighted) {
          highlighted.performAction();
        }
        break;

      case KeyCodes.UP:
        this.highlightPrevious();
        break;

      case KeyCodes.DOWN:
        this.highlightNext();
        break;

      case KeyCodes.PAGE_UP:
      case KeyCodes.HOME:
        this.highlightFirst_();
        break;

      case KeyCodes.PAGE_DOWN:
      case KeyCodes.END:
        this.highlightLast_();
        break;

      default:
        // Not a key the menu is interested in.
        return;
    }
    // The menu used this key, don't let it have secondary effects.
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Get the size of a rendered menu.
   *
   * @returns Object with width and height properties.
   * @internal
   */
  getSize(): Size {
    const menuDom = this.getElement();
    const menuSize = style.getSize(menuDom as Element);
    // Recalculate height for the total content, not only box height.
    menuSize.height = menuDom!.scrollHeight;
    return menuSize;
  }
}
