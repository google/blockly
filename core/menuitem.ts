/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Blockly menu item similar to Closure's goog.ui.MenuItem
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.MenuItem');

import * as aria from './utils/aria.js';
import * as dom from './utils/dom.js';
import * as idGenerator from './utils/idgenerator.js';


/**
 * Class representing an item in a menu.
 *
 * @alias Blockly.MenuItem
 */
export class MenuItem {
  /** Is the menu item clickable, as opposed to greyed-out. */
  private enabled_ = true;

  /** The DOM element for the menu item. */
  private element_: HTMLDivElement|null = null;

  /** Whether the menu item is rendered right-to-left. */
  private rightToLeft_ = false;

  /** ARIA name for this menu. */
  private roleName_: aria.Role|null = null;

  /** Is this menu item checkable. */
  private checkable_ = false;

  /** Is this menu item currently checked. */
  private checked_ = false;

  /** Is this menu item currently highlighted. */
  private highlight_ = false;

  /** Bound function to call when this menu item is clicked. */
  private actionHandler_: Function|null = null;

  /**
   * @param content Text caption to display as the content of the item, or a
   *     HTML element to display.
   * @param opt_value Data/model associated with the menu item.
   */
  constructor(
      private readonly content: string|HTMLElement,
      private readonly opt_value?: string) {}

  /**
   * Creates the menuitem's DOM.
   *
   * @returns Completed DOM.
   */
  createDom(): Element {
    const element = (document.createElement('div'));
    element.id = idGenerator.getNextUniqueId();
    this.element_ = element;

    // Set class and style
    // goog-menuitem* is deprecated, use blocklyMenuItem*.  May 2020.
    element.className = 'blocklyMenuItem goog-menuitem ' +
        (this.enabled_ ? '' :
                         'blocklyMenuItemDisabled goog-menuitem-disabled ') +
        (this.checked_ ? 'blocklyMenuItemSelected goog-option-selected ' : '') +
        (this.highlight_ ? 'blocklyMenuItemHighlight goog-menuitem-highlight ' :
                           '') +
        (this.rightToLeft_ ? 'blocklyMenuItemRtl goog-menuitem-rtl ' : '');

    const content = (document.createElement('div'));
    content.className = 'blocklyMenuItemContent goog-menuitem-content';
    // Add a checkbox for checkable menu items.
    if (this.checkable_) {
      const checkbox = (document.createElement('div'));
      checkbox.className = 'blocklyMenuItemCheckbox goog-menuitem-checkbox';
      content.appendChild(checkbox);
    }

    let contentDom: Node = this.content as HTMLElement;
    if (typeof this.content === 'string') {
      contentDom = document.createTextNode(this.content);
    }
    content.appendChild(contentDom);
    element.appendChild(content);

    // Initialize ARIA role and state.
    if (this.roleName_) {
      aria.setRole(element, this.roleName_);
    }
    aria.setState(
        element, aria.State.SELECTED,
        this.checkable_ && this.checked_ || false);
    aria.setState(element, aria.State.DISABLED, !this.enabled_);

    return element;
  }

  /** Dispose of this menu item. */
  dispose() {
    this.element_ = null;
  }

  /**
   * Gets the menu item's element.
   *
   * @returns The DOM element.
   * @internal
   */
  getElement(): Element|null {
    return this.element_;
  }

  /**
   * Gets the unique ID for this menu item.
   *
   * @returns Unique component ID.
   * @internal
   */
  getId(): string {
    return this.element_!.id;
  }

  /**
   * Gets the value associated with the menu item.
   *
   * @returns value Value associated with the menu item.
   * @internal
   */
  getValue(): string|null {
    return this.opt_value ?? null;
  }

  /**
   * Set menu item's rendering direction.
   *
   * @param rtl True if RTL, false if LTR.
   * @internal
   */
  setRightToLeft(rtl: boolean) {
    this.rightToLeft_ = rtl;
  }

  /**
   * Set the menu item's accessibility role.
   *
   * @param roleName Role name.
   * @internal
   */
  setRole(roleName: aria.Role) {
    this.roleName_ = roleName;
  }

  /**
   * Sets the menu item to be checkable or not. Set to true for menu items
   * that represent checkable options.
   *
   * @param checkable Whether the menu item is checkable.
   * @internal
   */
  setCheckable(checkable: boolean) {
    this.checkable_ = checkable;
  }

  /**
   * Checks or unchecks the component.
   *
   * @param checked Whether to check or uncheck the component.
   * @internal
   */
  setChecked(checked: boolean) {
    this.checked_ = checked;
  }

  /**
   * Highlights or unhighlights the component.
   *
   * @param highlight Whether to highlight or unhighlight the component.
   * @internal
   */
  setHighlighted(highlight: boolean) {
    this.highlight_ = highlight;

    const el = this.getElement();
    if (el && this.isEnabled()) {
      // goog-menuitem-highlight is deprecated, use blocklyMenuItemHighlight.
      // May 2020.
      const name = 'blocklyMenuItemHighlight';
      const nameDep = 'goog-menuitem-highlight';
      if (highlight) {
        dom.addClass(el, name);
        dom.addClass(el, nameDep);
      } else {
        dom.removeClass(el, name);
        dom.removeClass(el, nameDep);
      }
    }
  }

  /**
   * Returns true if the menu item is enabled, false otherwise.
   *
   * @returns Whether the menu item is enabled.
   * @internal
   */
  isEnabled(): boolean {
    return this.enabled_;
  }

  /**
   * Enables or disables the menu item.
   *
   * @param enabled Whether to enable or disable the menu item.
   * @internal
   */
  setEnabled(enabled: boolean) {
    this.enabled_ = enabled;
  }

  /**
   * Performs the appropriate action when the menu item is activated
   * by the user.
   *
   * @internal
   */
  performAction() {
    if (this.isEnabled() && this.actionHandler_) {
      this.actionHandler_(this);
    }
  }

  /**
   * Set the handler that's called when the menu item is activated by the user.
   * `obj` will be used as the 'this' object in the function when called.
   *
   * @param fn The handler.
   * @param obj Used as the 'this' object in fn when called.
   * @internal
   */
  onAction(fn: (p1: MenuItem) => void, obj: object) {
    this.actionHandler_ = fn.bind(obj);
  }
}
