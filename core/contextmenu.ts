/**
 * @fileoverview Functionality for the right-click context menus.
 */
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Functionality for the right-click context menus.
 * @namespace Blockly.ContextMenu
 */
/* eslint-disable-next-line no-unused-vars */
import { Block } from './block';
/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from './block_svg';
import * as browserEvents from './browser_events';
import * as clipboard from './clipboard';
import { config } from './config';
import { ContextMenuOption, ContextMenuRegistry, LegacyContextMenuOption } from './contextmenu_registry';
import * as BlockCreate from './events/events_block_create';
import * as eventUtils from './events/utils';
import { Menu } from './menu';
import { MenuItem } from './menuitem';
import { Msg } from './msg';
import * as aria from './utils/aria';
import { Coordinate } from './utils/coordinate';
import * as deprecation from './utils/deprecation';
import * as dom from './utils/dom';
import { Rect } from './utils/rect';
import * as svgMath from './utils/svg_math';
import * as userAgent from './utils/useragent';
import * as WidgetDiv from './widgetdiv';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceCommentSvg } from './workspace_comment_svg';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from './workspace_svg';
import * as Xml from './xml';


/**
 * Which block is the context menu attached to?
 */
let currentBlock: Block | null = null;

let dummyOwner = {};

/**
 * Gets the block the context menu is currently attached to.
 * @return The block the context menu is attached to.
 * @alias Blockly.ContextMenu.getCurrentBlock
 */
export function getCurrentBlock(): Block | null {
  return currentBlock;
}

/**
 * Sets the block the context menu is currently attached to.
 * @param block The block the context menu is attached to.
 * @alias Blockly.ContextMenu.setCurrentBlock
 */
export function setCurrentBlock(block: Block | null) {
  currentBlock = block;
}

/**
 * Menu object.
 */
let menu_: Menu | null = null;

/**
 * Construct the menu based on the list of options and show the menu.
 * @param e Mouse event.
 * @param options Array of menu options.
 * @param rtl True if RTL, false if LTR.
 * @alias Blockly.ContextMenu.show
 */
export function show(
  e: Event, options: (ContextMenuOption | LegacyContextMenuOption)[],
  rtl: boolean) {
  WidgetDiv.show(dummyOwner, rtl, dispose);
  if (!options.length) {
    hide();
    return;
  }
  const menu = populate_(options, rtl);
  menu_ = menu;

  position_(menu, e, rtl);
  // 1ms delay is required for focusing on context menus because some other
  // mouse event is still waiting in the queue and clears focus.
  setTimeout(function () {
    menu.focus();
  }, 1);
  currentBlock = null;
}
// May be set by Blockly.Block.

/**
 * Create the context menu object and populate it with the given options.
 * @param options Array of menu options.
 * @param rtl True if RTL, false if LTR.
 * @return The menu that will be shown on right click.
 */
function populate_(
  options: (ContextMenuOption | LegacyContextMenuOption)[],
  rtl: boolean): Menu {
  /* Here's what one option object looks like:
      {text: 'Make It So',
       enabled: true,
       callback: Blockly.MakeItSo}
    */
  const menu = new Menu();
  menu.setRole(aria.Role.MENU);
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const menuItem = new MenuItem(option.text);
    menuItem.setRightToLeft(rtl);
    menuItem.setRole(aria.Role.MENUITEM);
    menu.addChild(menuItem);
    menuItem.setEnabled(option.enabled);
    if (option.enabled) {
      const actionHandler = function (this: ContextMenuOption) {
        hide();
        this.callback(this.scope);
      };
      menuItem.onAction(actionHandler, option);
    }
  }
  return menu;
}

/**
 * Add the menu to the page and position it correctly.
 * @param menu The menu to add and position.
 * @param e Mouse event for the right click that is making the context
 *     menu appear.
 * @param rtl True if RTL, false if LTR.
 */
function position_(menu: Menu, e: Event, rtl: boolean) {
  // Record windowSize and scrollOffset before adding menu.
  const viewportBBox = svgMath.getViewportBBox();
  const mouseEvent = e as MouseEvent;
  // This one is just a point, but we'll pretend that it's a rect so we can use
  // some helper functions.
  const anchorBBox = new Rect(
    mouseEvent.clientY + viewportBBox.top,
    mouseEvent.clientY + viewportBBox.top,
    mouseEvent.clientX + viewportBBox.left,
    mouseEvent.clientX + viewportBBox.left);

  createWidget_(menu);
  const menuSize = menu.getSize();

  if (rtl) {
    anchorBBox.left += menuSize.width;
    anchorBBox.right += menuSize.width;
    viewportBBox.left += menuSize.width;
    viewportBBox.right += menuSize.width;
  }

  WidgetDiv.positionWithAnchor(viewportBBox, anchorBBox, menuSize, rtl);
  // Calling menuDom.focus() has to wait until after the menu has been placed
  // correctly.  Otherwise it will cause a page scroll to get the misplaced menu
  // in view.  See issue #1329.
  menu.focus();
}

/**
 * Create and render the menu widget inside Blockly's widget div.
 * @param menu The menu to add to the widget div.
 */
function createWidget_(menu: Menu) {
  const div = WidgetDiv.getDiv();
  if (!div) {
    throw Error('Attempting to create a context menu when widget div is null');
  }
  menu.render(div);
  const menuDom = menu.getElement();
  dom.addClass((menuDom as Element), 'blocklyContextMenu');
  // Prevent system context menu when right-clicking a Blockly context menu.
  browserEvents.conditionalBind(
    (menuDom as EventTarget), 'contextmenu', null, haltPropagation);
  // Focus only after the initial render to avoid issue #1329.
  menu.focus();
}
/**
 * Halts the propagation of the event without doing anything else.
 * @param e An event.
 */
function haltPropagation(e: Event) {
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Hide the context menu.
 * @alias Blockly.ContextMenu.hide
 */
export function hide() {
  WidgetDiv.hideIfOwner(dummyOwner);
  currentBlock = null;
}

/**
 * Dispose of the menu.
 * @alias Blockly.ContextMenu.dispose
 */
export function dispose() {
  if (menu_) {
    menu_.dispose();
    menu_ = null;
  }
}

/**
 * Create a callback function that creates and configures a block,
 *   then places the new block next to the original.
 * @param block Original block.
 * @param xml XML representation of new block.
 * @return Function that creates a block.
 * @alias Blockly.ContextMenu.callbackFactory
 */
export function callbackFactory(block: Block, xml: Element): Function {
  return () => {
    eventUtils.disable();
    let newBlock;
    try {
      newBlock = Xml.domToBlock(xml, block.workspace) as BlockSvg;
      // Move the new block next to the old block.
      const xy = block.getRelativeToSurfaceXY();
      if (block.RTL) {
        xy.x -= config.snapRadius;
      } else {
        xy.x += config.snapRadius;
      }
      xy.y += config.snapRadius * 2;
      newBlock.moveBy(xy.x, xy.y);
    } finally {
      eventUtils.enable();
    }
    if (eventUtils.isEnabled() && !newBlock.isShadow()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CREATE))!(newBlock));
    }
    newBlock.select();
  };
}

// Helper functions for creating context menu options.

/**
 * Make a context menu option for deleting the current workspace comment.
 * @param comment The workspace comment where the
 *     right-click originated.
 * @return A menu option,
 *     containing text, enabled, and a callback.
 * @alias Blockly.ContextMenu.commentDeleteOption
 */
export function commentDeleteOption(comment: WorkspaceCommentSvg):
  LegacyContextMenuOption {
  const deleteOption = {
    text: Msg['REMOVE_COMMENT'],
    enabled: true,
    callback: function () {
      eventUtils.setGroup(true);
      comment.dispose();
      eventUtils.setGroup(false);
    },
  };
  return deleteOption;
}

/**
 * Make a context menu option for duplicating the current workspace comment.
 * @param comment The workspace comment where the
 *     right-click originated.
 * @return A menu option,
 *     containing text, enabled, and a callback.
 * @alias Blockly.ContextMenu.commentDuplicateOption
 */
export function commentDuplicateOption(comment: WorkspaceCommentSvg):
  LegacyContextMenuOption {
  const duplicateOption = {
    text: Msg['DUPLICATE_COMMENT'],
    enabled: true,
    callback: function () {
      clipboard.duplicate(comment);
    },
  };
  return duplicateOption;
}

/**
 * Make a context menu option for adding a comment on the workspace.
 * @param ws The workspace where the right-click
 *     originated.
 * @param e The right-click mouse event.
 * @return A menu option, containing text, enabled, and a callback.
 * @suppress {strictModuleDepCheck,checkTypes} Suppress checks while workspace
 *     comments are not bundled in.
 * @alias Blockly.ContextMenu.workspaceCommentOption
 */
export function workspaceCommentOption(
  ws: WorkspaceSvg, e: Event): ContextMenuOption {
  const { WorkspaceCommentSvg } = goog.module.get('Blockly.WorkspaceCommentSvg');
  if (!WorkspaceCommentSvg) {
    throw Error('Missing require for Blockly.WorkspaceCommentSvg');
  }
  // Helper function to create and position a comment correctly based on the
  // location of the mouse event.
  function addWsComment() {
    const comment = new WorkspaceCommentSvg(
      ws, Msg['WORKSPACE_COMMENT_DEFAULT_TEXT'],
      WorkspaceCommentSvg.DEFAULT_SIZE, WorkspaceCommentSvg.DEFAULT_SIZE);

    const injectionDiv = ws.getInjectionDiv();
    // Bounding rect coordinates are in client coordinates, meaning that they
    // are in pixels relative to the upper left corner of the visible browser
    // window.  These coordinates change when you scroll the browser window.
    const boundingRect = injectionDiv.getBoundingClientRect();

    // The client coordinates offset by the injection div's upper left corner.
    const mouseEvent = e as MouseEvent;
    const clientOffsetPixels = new Coordinate(
      mouseEvent.clientX - boundingRect.left,
      mouseEvent.clientY - boundingRect.top);

    // The offset in pixels between the main workspace's origin and the upper
    // left corner of the injection div.
    const mainOffsetPixels = ws.getOriginOffsetInPixels();

    // The position of the new comment in pixels relative to the origin of the
    // main workspace.
    const finalOffset =
      Coordinate.difference(clientOffsetPixels, mainOffsetPixels);
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
  }

  const wsCommentOption = {
    // Foreign objects don't work in IE.  Don't let the user create comments
    // that they won't be able to edit.
    enabled: !userAgent.IE,
  } as ContextMenuOption;
  wsCommentOption.text = Msg['ADD_COMMENT'];
  wsCommentOption.callback = function () {
    addWsComment();
  };
  return wsCommentOption;
}
