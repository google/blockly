/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Functionality for the right-click context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.ContextMenu
 * @namespace
 */
goog.module('Blockly.ContextMenu');
goog.module.declareLegacyNamespace();

// TODO(#5073): Add Blockly require after fixing circular dependency.
// goog.require('Blockly');
goog.require('Blockly.browserEvents');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.internalConstants');
goog.require('Blockly.Menu');
goog.require('Blockly.MenuItem');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('Blockly.utils.aria');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.Rect');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.WidgetDiv');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Which block is the context menu attached to?
 * @type {?Blockly.Block}
 */
let currentBlock = null;

/**
 * Gets the block the context menu is currently attached to.
 * @return {?Blockly.Block} The block the context menu is attached to.
 */
const getCurrentBlock = function() {
  return currentBlock;
};
exports.getCurrentBlock = getCurrentBlock;

/**
 * Sets the block the context menu is currently attached to.
 * @param {?Blockly.Block} block The block the context menu is attached to.
 */
const setCurrentBlock = function(block) {
  currentBlock = block;
};
exports.setCurrentBlock = setCurrentBlock;

// Ad JS accessors for backwards compatibility.
Object.defineProperty(exports, 'currentBlock', {
  get: getCurrentBlock,
  set: setCurrentBlock,
});

/**
 * Menu object.
 * @type {Blockly.Menu}
 */
let menu_ = null;

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {!Event} e Mouse event.
 * @param {!Array<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 */
const show = function(e, options, rtl) {
  Blockly.WidgetDiv.show(exports, rtl, dispose);
  if (!options.length) {
    hide();
    return;
  }
  const menu = populate_(options, rtl);
  menu_ = menu;

  position_(menu, e, rtl);
  // 1ms delay is required for focusing on context menus because some other
  // mouse event is still waiting in the queue and clears focus.
  setTimeout(function() {menu.focus();}, 1);
  currentBlock = null;  // May be set by Blockly.Block.
};
exports.show = show;

/**
 * Create the context menu object and populate it with the given options.
 * @param {!Array<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @return {!Blockly.Menu} The menu that will be shown on right click.
 * @private
 */
const populate_ = function(options, rtl) {
  /* Here's what one option object looks like:
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  const menu = new Blockly.Menu();
  menu.setRole(Blockly.utils.aria.Role.MENU);
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const menuItem = new Blockly.MenuItem(option.text);
    menuItem.setRightToLeft(rtl);
    menuItem.setRole(Blockly.utils.aria.Role.MENUITEM);
    menu.addChild(menuItem);
    menuItem.setEnabled(option.enabled);
    if (option.enabled) {
      const actionHandler = function (_menuItem) {
        const option = this;
        hide();
        option.callback(option.scope);
      };
      menuItem.onAction(actionHandler, option);
    }
  }
  return menu;
};

/**
 * Add the menu to the page and position it correctly.
 * @param {!Blockly.Menu} menu The menu to add and position.
 * @param {!Event} e Mouse event for the right click that is making the context
 *     menu appear.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @private
 */
const position_ = function(menu, e, rtl) {
  // Record windowSize and scrollOffset before adding menu.
  const viewportBBox = Blockly.utils.getViewportBBox();
  // This one is just a point, but we'll pretend that it's a rect so we can use
  // some helper functions.
  const anchorBBox = new Blockly.utils.Rect(
      e.clientY + viewportBBox.top,
      e.clientY + viewportBBox.top,
      e.clientX + viewportBBox.left,
      e.clientX + viewportBBox.left
  );

  createWidget_(menu);
  const menuSize = menu.getSize();

  if (rtl) {
    anchorBBox.left += menuSize.width;
    anchorBBox.right += menuSize.width;
    viewportBBox.left += menuSize.width;
    viewportBBox.right += menuSize.width;
  }

  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize, rtl);
  // Calling menuDom.focus() has to wait until after the menu has been placed
  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
  // in view.  See issue #1329.
  menu.focus();
};

/**
 * Create and render the menu widget inside Blockly's widget div.
 * @param {!Blockly.Menu} menu The menu to add to the widget div.
 * @private
 */
const createWidget_ = function(menu) {
  const div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  const menuDom = menu.getElement();
  Blockly.utils.dom.addClass(
      /** @type {!Element} */ (menuDom), 'blocklyContextMenu');
  // Prevent system context menu when right-clicking a Blockly context menu.
  Blockly.browserEvents.conditionalBind(
      /** @type {!EventTarget} */ (menuDom), 'contextmenu', null,
      Blockly.utils.noEvent);
  // Focus only after the initial render to avoid issue #1329.
  menu.focus();
};

/**
 * Hide the context menu.
 */
const hide = function() {
  Blockly.WidgetDiv.hideIfOwner(exports);
  currentBlock = null;
};
exports.hide = hide;

/**
 * Dispose of the menu.
 */
const dispose = function() {
  if (menu_) {
    menu_.dispose();
    menu_ = null;
  }
};
exports.dispose = dispose;

/**
 * Create a callback function that creates and configures a block,
 *   then places the new block next to the original.
 * @param {!Blockly.Block} block Original block.
 * @param {!Element} xml XML representation of new block.
 * @return {!Function} Function that creates a block.
 */
const callbackFactory = function(block, xml) {
  return function() {
    Blockly.Events.disable();
    let newBlock;
    try {
      newBlock = Blockly.Xml.domToBlock(xml, block.workspace);
      // Move the new block next to the old block.
      const xy = block.getRelativeToSurfaceXY();
      if (block.RTL) {
        xy.x -= Blockly.internalConstants.SNAP_RADIUS;
      } else {
        xy.x += Blockly.internalConstants.SNAP_RADIUS;
      }
      xy.y += Blockly.internalConstants.SNAP_RADIUS * 2;
      newBlock.moveBy(xy.x, xy.y);
    } finally {
      Blockly.Events.enable();
    }
    if (Blockly.Events.isEnabled() && !newBlock.isShadow()) {
      Blockly.Events.fire(
          new (Blockly.Events.get(Blockly.Events.BLOCK_CREATE))(newBlock));
    }
    newBlock.select();
  };
};
exports.callbackFactory = callbackFactory;

// Helper functions for creating context menu options.

/**
 * Make a context menu option for deleting the current workspace comment.
 * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 */
const commentDeleteOption = function(comment) {
  const deleteOption = {
    text: Blockly.Msg['REMOVE_COMMENT'],
    enabled: true,
    callback: function () {
      Blockly.Events.setGroup(true);
      comment.dispose(true, true);
      Blockly.Events.setGroup(false);
    }
  };
  return deleteOption;
};
/** @package */
exports.commentDeleteOption = commentDeleteOption;

/**
 * Make a context menu option for duplicating the current workspace comment.
 * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 */
const commentDuplicateOption = function(comment) {
  const duplicateOption = {
    text: Blockly.Msg['DUPLICATE_COMMENT'],
    enabled: true,
    callback: function () {
      Blockly.duplicate(comment);
    }
  };
  return duplicateOption;
};
/** @package */
exports.commentDuplicateOption = commentDuplicateOption;

/**
 * Make a context menu option for adding a comment on the workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @param {!Event} e The right-click mouse event.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 * @suppress {strictModuleDepCheck,checkTypes} Suppress checks while workspace
 *     comments are not bundled in.
 */
const workspaceCommentOption = function(ws, e) {
  if (!Blockly.WorkspaceCommentSvg) {
    throw Error('Missing require for Blockly.WorkspaceCommentSvg');
  }
  // Helper function to create and position a comment correctly based on the
  // location of the mouse event.
  const addWsComment = function () {
    const comment = new Blockly.WorkspaceCommentSvg(
        ws, Blockly.Msg['WORKSPACE_COMMENT_DEFAULT_TEXT'],
        Blockly.WorkspaceCommentSvg.DEFAULT_SIZE,
        Blockly.WorkspaceCommentSvg.DEFAULT_SIZE);

    const injectionDiv = ws.getInjectionDiv();
    // Bounding rect coordinates are in client coordinates, meaning that they
    // are in pixels relative to the upper left corner of the visible browser
    // window.  These coordinates change when you scroll the browser window.
    const boundingRect = injectionDiv.getBoundingClientRect();

    // The client coordinates offset by the injection div's upper left corner.
    const clientOffsetPixels = new Blockly.utils.Coordinate(
        e.clientX - boundingRect.left, e.clientY - boundingRect.top);

    // The offset in pixels between the main workspace's origin and the upper
    // left corner of the injection div.
    const mainOffsetPixels = ws.getOriginOffsetInPixels();

    // The position of the new comment in pixels relative to the origin of the
    // main workspace.
    const finalOffset = Blockly.utils.Coordinate.difference(clientOffsetPixels,
        mainOffsetPixels);
    // The position of the new comment in main workspace coordinates.
    finalOffset.scale(1 / ws.scale);

    const commentX = finalOffset.x;
    const commentY = finalOffset.y;
    comment.moveBy(commentX, commentY);
    if (ws.rendered) {
      comment.initSvg();
      comment.render();
      comment.select();
    }
  };

  const wsCommentOption = {
    // Foreign objects don't work in IE.  Don't let the user create comments
    // that they won't be able to edit.
    enabled: !Blockly.utils.userAgent.IE
  };
  wsCommentOption.text = Blockly.Msg['ADD_COMMENT'];
  wsCommentOption.callback = function() {
    addWsComment();
  };
  return wsCommentOption;
};
/** @package */
exports.workspaceCommentOption = workspaceCommentOption;
