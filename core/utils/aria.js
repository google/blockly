/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview ARIA-related constants and utilities.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 */
'use strict';

/**
 * ARIA-related constants and utilities.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @namespace Blockly.utils.aria
 */
goog.module('Blockly.utils.aria');


/** ARIA states/properties prefix. */
const ARIA_PREFIX = 'aria-';

/** ARIA role attribute. */
const ROLE_ATTRIBUTE = 'role';

/**
 * ARIA role values.
 * Copied from Closure's goog.a11y.aria.Role
 * @enum {string}
 * @alias Blockly.utils.aria.Role
 */
const Role = {
  // ARIA role for an interactive control of tabular data.
  GRID: 'grid',

  // ARIA role for a cell in a grid.
  GRIDCELL: 'gridcell',

  // ARIA role for a group of related elements like tree item siblings.
  GROUP: 'group',

  // ARIA role for a listbox.
  LISTBOX: 'listbox',

  // ARIA role for a popup menu.
  MENU: 'menu',

  // ARIA role for menu item elements.
  MENUITEM: 'menuitem',

  // ARIA role for a checkbox box element inside a menu.
  MENUITEMCHECKBOX: 'menuitemcheckbox',

  // ARIA role for option items that are  children of combobox, listbox, menu,
  // radiogroup, or tree elements.
  OPTION: 'option',

  // ARIA role for ignorable cosmetic elements with no semantic significance.
  PRESENTATION: 'presentation',

  // ARIA role for a row of cells in a grid.
  ROW: 'row',

  // ARIA role for a tree.
  TREE: 'tree',

  // ARIA role for a tree item that sometimes may be expanded or collapsed.
  TREEITEM: 'treeitem',
};
exports.Role = Role;

/**
 * ARIA states and properties.
 * Copied from Closure's goog.a11y.aria.State
 * @enum {string}
 * @alias Blockly.utils.aria.State
 */
const State = {
  // ARIA property for setting the currently active descendant of an element,
  // for example the selected item in a list box. Value: ID of an element.
  ACTIVEDESCENDANT: 'activedescendant',

  // ARIA property defines the total number of columns in a table, grid, or
  // treegrid.
  // Value: integer.
  COLCOUNT: 'colcount',

  // ARIA state for a disabled item. Value: one of {true, false}.
  DISABLED: 'disabled',

  // ARIA state for setting whether the element like a tree node is expanded.
  // Value: one of {true, false, undefined}.
  EXPANDED: 'expanded',

  // ARIA state indicating that the entered value does not conform. Value:
  // one of {false, true, 'grammar', 'spelling'}
  INVALID: 'invalid',

  // ARIA property that provides a label to override any other text, value, or
  // contents used to describe this element. Value: string.
  LABEL: 'label',

  // ARIA property for setting the element which labels another element.
  // Value: space-separated IDs of elements.
  LABELLEDBY: 'labelledby',

  // ARIA property for setting the level of an element in the hierarchy.
  // Value: integer.
  LEVEL: 'level',

  // ARIA property indicating if the element is horizontal or vertical.
  // Value: one of {'vertical', 'horizontal'}.
  ORIENTATION: 'orientation',

  // ARIA property that defines an element's number of position in a list.
  // Value: integer.
  POSINSET: 'posinset',

  // ARIA property defines the total number of rows in a table, grid, or
  // treegrid.
  // Value: integer.
  ROWCOUNT: 'rowcount',

  // ARIA state for setting the currently selected item in the list.
  // Value: one of {true, false, undefined}.
  SELECTED: 'selected',

  // ARIA property defining the number of items in a list. Value: integer.
  SETSIZE: 'setsize',

  // ARIA property for slider maximum value. Value: number.
  VALUEMAX: 'valuemax',

  // ARIA property for slider minimum value. Value: number.
  VALUEMIN: 'valuemin',
};
exports.State = State;

/**
 * Sets the role of an element.
 *
 * Similar to Closure's goog.a11y.aria
 *
 * @param {!Element} element DOM node to set role of.
 * @param {!Role} roleName Role name.
 * @alias Blockly.utils.aria.setRole
 */
const setRole = function(element, roleName) {
  element.setAttribute(ROLE_ATTRIBUTE, roleName);
};
exports.setRole = setRole;

/**
 * Sets the state or property of an element.
 * Copied from Closure's goog.a11y.aria
 * @param {!Element} element DOM node where we set state.
 * @param {!State} stateName State attribute being set.
 *     Automatically adds prefix 'aria-' to the state name if the attribute is
 *     not an extra attribute.
 * @param {string|boolean|number|!Array<string>} value Value
 * for the state attribute.
 * @alias Blockly.utils.aria.setState
 */
const setState = function(element, stateName, value) {
  if (Array.isArray(value)) {
    value = value.join(' ');
  }
  const attrStateName = ARIA_PREFIX + stateName;
  element.setAttribute(attrStateName, value);
};
exports.setState = setState;
