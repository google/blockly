/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Functionality for the right-click context menus.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * @name Blockly.ContextMenu
 * @namespace
 */
goog.provide('Blockly.ContextMenu');

goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.utils');
goog.require('Blockly.utils.uiMenu');
goog.require('Blockly.Xml');

goog.require('goog.events');
goog.require('goog.math.Coordinate');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.userAgent');


/**
 * Which block is the context menu attached to?
 * @type {Blockly.Block}
 */
Blockly.ContextMenu.currentBlock = null;

/**
 * Opaque data that can be passed to unbindEvent_.
 * @type {Array.<!Array>}
 * @private
 */
Blockly.ContextMenu.eventWrapper_ = null;

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {!Event} e Mouse event.
 * @param {!Array.<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 */
Blockly.ContextMenu.show = function(e, options, rtl) {
  Blockly.WidgetDiv.show(Blockly.ContextMenu, rtl, null);
  if (!options.length) {
    Blockly.ContextMenu.hide();
    return;
  }
  var menu = Blockly.ContextMenu.populate_(options, rtl);

  goog.events.listen(
      menu, goog.ui.Component.EventType.ACTION, Blockly.ContextMenu.hide);

  Blockly.ContextMenu.position_(menu, e, rtl);
  // 1ms delay is required for focusing on context menus because some other
  // mouse event is still waiting in the queue and clears focus.
  setTimeout(function() {menu.getElement().focus();}, 1);
  Blockly.ContextMenu.currentBlock = null;  // May be set by Blockly.Block.
};

/**
 * Create the context menu object and populate it with the given options.
 * @param {!Array.<!Object>} options Array of menu options.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @return {!goog.ui.Menu} The menu that will be shown on right click.
 * @private
 */
Blockly.ContextMenu.populate_ = function(options, rtl) {
  /* Here's what one option object looks like:
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  var menu = new goog.ui.Menu();
  menu.setRightToLeft(rtl);
  for (var i = 0, option; option = options[i]; i++) {
    var menuItem = new goog.ui.MenuItem(option.text);
    menuItem.setRightToLeft(rtl);
    menu.addChild(menuItem, true);
    menuItem.setEnabled(option.enabled);
    if (option.enabled) {
      goog.events.listen(
          menuItem, goog.ui.Component.EventType.ACTION, option.callback);
      menuItem.handleContextMenu = function(/* e */) {
        // Right-clicking on menu option should count as a click.
        goog.events.dispatchEvent(this, goog.ui.Component.EventType.ACTION);
      };
    }
  }
  return menu;
};

/**
 * Add the menu to the page and position it correctly.
 * @param {!goog.ui.Menu} menu The menu to add and position.
 * @param {!Event} e Mouse event for the right click that is making the context
 *     menu appear.
 * @param {boolean} rtl True if RTL, false if LTR.
 * @private
 */
Blockly.ContextMenu.position_ = function(menu, e, rtl) {
  // Record windowSize and scrollOffset before adding menu.
  var viewportBBox = Blockly.utils.getViewportBBox();
  // This one is just a point, but we'll pretend that it's a rect so we can use
  // some helper functions.
  var anchorBBox = {
    top: e.clientY + viewportBBox.top,
    bottom: e.clientY + viewportBBox.top,
    left: e.clientX + viewportBBox.left,
    right: e.clientX + viewportBBox.left
  };

  Blockly.ContextMenu.createWidget_(menu);
  var menuSize = Blockly.utils.uiMenu.getSize(menu);

  if (rtl) {
    Blockly.utils.uiMenu.adjustBBoxesForRTL(viewportBBox, anchorBBox, menuSize);
  }

  Blockly.WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize, rtl);
  // Calling menuDom.focus() has to wait until after the menu has been placed
  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
  // in view.  See issue #1329.
  menu.getElement().focus();
};

/**
 * Create and render the menu widget inside Blockly's widget div.
 * @param {!goog.ui.Menu} menu The menu to add to the widget div.
 * @private
 */
Blockly.ContextMenu.createWidget_ = function(menu) {
  var div = Blockly.WidgetDiv.DIV;
  menu.render(div);
  var menuDom = menu.getElement();
  Blockly.utils.addClass(menuDom, 'blocklyContextMenu');
  // Prevent system context menu when right-clicking a Blockly context menu.
  Blockly.bindEventWithChecks_(
      menuDom, 'contextmenu', null, Blockly.utils.noEvent);
  // Enable autofocus after the initial render to avoid issue #1329.
  menu.setAllowAutoFocus(true);
};

/**
 * Hide the context menu.
 */
Blockly.ContextMenu.hide = function() {
  Blockly.WidgetDiv.hideIfOwner(Blockly.ContextMenu);
  Blockly.ContextMenu.currentBlock = null;
  if (Blockly.ContextMenu.eventWrapper_) {
    Blockly.unbindEvent_(Blockly.ContextMenu.eventWrapper_);
  }
};

/**
 * Create a callback function that creates and configures a block,
 *   then places the new block next to the original.
 * @param {!Blockly.Block} block Original block.
 * @param {!Element} xml XML representation of new block.
 * @return {!Function} Function that creates a block.
 */
Blockly.ContextMenu.callbackFactory = function(block, xml) {
  return function() {
    Blockly.Events.disable();
    try {
      var newBlock = Blockly.Xml.domToBlock(xml, block.workspace);
      // Move the new block next to the old block.
      var xy = block.getRelativeToSurfaceXY();
      if (block.RTL) {
        xy.x -= Blockly.SNAP_RADIUS;
      } else {
        xy.x += Blockly.SNAP_RADIUS;
      }
      xy.y += Blockly.SNAP_RADIUS * 2;
      newBlock.moveBy(xy.x, xy.y);
    } finally {
      Blockly.Events.enable();
    }
    if (Blockly.Events.isEnabled() && !newBlock.isShadow()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(newBlock));
    }
    newBlock.select();
  };
};

// Helper functions for creating context menu options.

/**
 * Make a context menu option for deleting the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockDeleteOption = function(block) {
  // Option to delete this block but not blocks lower in the stack.
  // Count the number of blocks that are nested in this block.
  var descendantCount = block.getDescendants(false).length;
  var nextBlock = block.getNextBlock();
  if (nextBlock) {
    // Blocks in the current stack would survive this block's deletion.
    descendantCount -= nextBlock.getDescendants(false).length;
  }
  var deleteOption = {
    text: descendantCount == 1 ? Blockly.Msg['DELETE_BLOCK'] :
        Blockly.Msg['DELETE_X_BLOCKS'].replace('%1', String(descendantCount)),
    enabled: true,
    callback: function() {
      Blockly.Events.setGroup(true);
      block.dispose(true, true);
      Blockly.Events.setGroup(false);
    }
  };
  return deleteOption;
};

/**
 * Make a context menu option for showing help for the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockHelpOption = function(block) {
  var url = (typeof block.helpUrl == 'function') ?
      block.helpUrl() : block.helpUrl;
  var helpOption = {
    enabled: !!url,
    text: Blockly.Msg['HELP'],
    callback: function() {
      block.showHelp_();
    }
  };
  return helpOption;
};

/**
 * Make a context menu option for duplicating the current block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockDuplicateOption = function(block) {
  var enabled = block.isDuplicatable();
  var duplicateOption = {
    text: Blockly.Msg['DUPLICATE_BLOCK'],
    enabled: enabled,
    callback: function() {
      Blockly.duplicate_(block);
    }
  };
  return duplicateOption;
};

/**
 * Make a context menu option for adding or removing comments on the current
 * block.
 * @param {!Blockly.BlockSvg} block The block where the right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.blockCommentOption = function(block) {
  var commentOption = {
    enabled: !goog.userAgent.IE
  };
  // If there's already a comment, add an option to delete it.
  if (block.comment) {
    commentOption.text = Blockly.Msg['REMOVE_COMMENT'];
    commentOption.callback = function() {
      block.setCommentText(null);
    };
  } else {
    // If there's no comment, add an option to create a comment.
    commentOption.text = Blockly.Msg['ADD_COMMENT'];
    commentOption.callback = function() {
      block.setCommentText('');
    };
  }
  return commentOption;
};

/**
 * Make a context menu option for deleting the current workspace comment.
 * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.commentDeleteOption = function(comment) {
  var deleteOption = {
    text: Blockly.Msg.REMOVE_COMMENT,
    enabled: true,
    callback: function() {
      Blockly.Events.setGroup(true);
      comment.dispose(true, true);
      Blockly.Events.setGroup(false);
    }
  };
  return deleteOption;
};

/**
 * Make a context menu option for duplicating the current workspace comment.
 * @param {!Blockly.WorkspaceCommentSvg} comment The workspace comment where the
 *     right-click originated.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.commentDuplicateOption = function(comment) {
  var duplicateOption = {
    text: Blockly.Msg.DUPLICATE_COMMENT,
    enabled: true,
    callback: function() {
      Blockly.duplicate_(comment);
    }
  };
  return duplicateOption;
};

/**
 * Make a context menu option for adding a comment on the workspace.
 * @param {!Blockly.WorkspaceSvg} ws The workspace where the right-click
 *     originated.
 * @param {!Event} e The right-click mouse event.
 * @return {!Object} A menu option, containing text, enabled, and a callback.
 * @package
 */
Blockly.ContextMenu.workspaceCommentOption = function(ws, e) {
  // Helper function to create and position a comment correctly based on the
  // location of the mouse event.
  var addWsComment = function() {
    var comment = new Blockly.WorkspaceCommentSvg(
        ws, Blockly.Msg.WORKSPACE_COMMENT_DEFAULT_TEXT,
        Blockly.WorkspaceCommentSvg.DEFAULT_SIZE,
        Blockly.WorkspaceCommentSvg.DEFAULT_SIZE);

    var injectionDiv = ws.getInjectionDiv();
    // Bounding rect coordinates are in client coordinates, meaning that they
    // are in pixels relative to the upper left corner of the visible browser
    // window.  These coordinates change when you scroll the browser window.
    var boundingRect = injectionDiv.getBoundingClientRect();

    // The client coordinates offset by the injection div's upper left corner.
    var clientOffsetPixels = new goog.math.Coordinate(
        e.clientX - boundingRect.left, e.clientY - boundingRect.top);

    // The offset in pixels between the main workspace's origin and the upper
    // left corner of the injection div.
    var mainOffsetPixels = ws.getOriginOffsetInPixels();

    // The position of the new comment in pixels relative to the origin of the
    // main workspace.
    var finalOffsetPixels = goog.math.Coordinate.difference(clientOffsetPixels,
        mainOffsetPixels);

    // The position of the new comment in main workspace coordinates.
    var finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);

    var commentX = finalOffsetMainWs.x;
    var commentY = finalOffsetMainWs.y;
    comment.moveBy(commentX, commentY);
    if (ws.rendered) {
      comment.initSvg();
      comment.render(false);
      comment.select();
    }
  };

  var wsCommentOption = {
    // Foreign objects don't work in IE.  Don't let the user create comments
    // that they won't be able to edit.
    enabled: !goog.userAgent.IE
  };
  wsCommentOption.text = Blockly.Msg.ADD_COMMENT;
  wsCommentOption.callback = function() {
    addWsComment();
  };
  return wsCommentOption;
};
