/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for working with the Closure menu
 * (goog.ui.menu).
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * @name Blockly.utils.uiMenu
 * @namespace
 */
goog.provide('Blockly.utils.uiMenu');

goog.require('Blockly.utils.style');


/**
 * Get the size of a rendered goog.ui.Menu.
 * @param {!Blockly.Menu} menu The menu to measure.
 * @return {!Blockly.utils.Size} Object with width and height properties.
 * @package
 */
Blockly.utils.uiMenu.getSize = function(menu) {
  var menuDom = menu.getElement();
  var menuSize = Blockly.utils.style.getSize(/** @type {!Element} */ (menuDom));
  // Recalculate height for the total content, not only box height.
  menuSize.height = menuDom.scrollHeight;
  return menuSize;
};

/**
 * Adjust the bounding boxes used to position the widget div to deal with RTL
 * goog.ui.Menu positioning.  In RTL mode the menu renders down and to the left
 * of its start point, instead of down and to the right.  Adjusting all of the
 * bounding boxes accordingly allows us to use the same code for all widgets.
 * This function in-place modifies the provided bounding boxes.
 * @param {!Object} viewportBBox The bounding rectangle of the current viewport,
 *     in window coordinates.
 * @param {!Object} anchorBBox The bounding rectangle of the anchor, in window
 *     coordinates.
 * @param {!Blockly.utils.Size} menuSize The size of the menu that is inside the
 *     widget div, in window coordinates.
 * @package
 */
Blockly.utils.uiMenu.adjustBBoxesForRTL = function(viewportBBox, anchorBBox,
    menuSize) {
  anchorBBox.left += menuSize.width;
  anchorBBox.right += menuSize.width;
  viewportBBox.left += menuSize.width;
  viewportBBox.right += menuSize.width;
};
