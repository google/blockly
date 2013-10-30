/**
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * http://blockly.googlecode.com/
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

goog.provide('Blockly.ContextMenu');


/**
 * Horizontal padding on either side of each option.
 */
Blockly.ContextMenu.X_PADDING = 20;

/**
 * Vertical height of each option.
 */
Blockly.ContextMenu.Y_HEIGHT = 20;

/**
 * Is a context menu currently showing?
 */
Blockly.ContextMenu.visible = false;

/**
 * Creates the context menu's DOM.  Only needs to be called once.
 * @return {!SVGGElement} The context menu's SVG group.
 */
Blockly.ContextMenu.createDom = function() {
  /*
  <g class="blocklyHidden">
    <rect class="blocklyContextMenuShadow" x="2" y="-2" rx="4" ry="4"/>
    <rect class="blocklyContextMenuBackground" y="-4" rx="4" ry="4"/>
    <g class="blocklyContextMenuOptions">
    </g>
  </g>
  */
  var svgGroup = /** @type {!SVGGElement} */ (
      Blockly.createSvgElement('g', {'class': 'blocklyHidden'}, null));
  Blockly.ContextMenu.svgGroup = svgGroup;
  Blockly.ContextMenu.svgShadow = Blockly.createSvgElement('rect',
      {'class': 'blocklyContextMenuShadow',
      'x': 2, 'y': -2, 'rx': 4, 'ry': 4}, svgGroup);
  Blockly.ContextMenu.svgBackground = Blockly.createSvgElement('rect',
      {'class': 'blocklyContextMenuBackground',
      'y': -4, 'rx': 4, 'ry': 4}, svgGroup);
  Blockly.ContextMenu.svgOptions = Blockly.createSvgElement('g',
      {'class': 'blocklyContextMenuOptions'}, svgGroup);
  return svgGroup;
};

/**
 * Construct the menu based on the list of options and show the menu.
 * @param {!Object} xy Coordinates of anchor point, contains x and y properties.
 * @param {!Array.<Object>} options Array of menu options.
 */
Blockly.ContextMenu.show = function(xy, options) {
  if (!options.length) {
    Blockly.ContextMenu.hide();
    return;
  }
  /* Here's what one option object looks like:
    {text: 'Make It So',
     enabled: true,
     callback: Blockly.MakeItSo}
  */
  // Erase all existing options.
  goog.dom.removeChildren(Blockly.ContextMenu.svgOptions);
  /* Here's the SVG we want for each option:
    <g class="blocklyMenuDiv" transform="translate(0, 0)">
      <rect width="100" height="20"/>
      <text class="blocklyMenuText" x="20" y="15">Make It So</text>
    </g>
  */
  // The menu must be made visible early since otherwise BBox and
  // getComputedTextLength will return 0.
  Blockly.ContextMenu.svgGroup.style.display = 'block';
  var maxWidth = 0;
  var resizeList = [Blockly.ContextMenu.svgBackground,
                    Blockly.ContextMenu.svgShadow];
  for (var x = 0, option; option = options[x]; x++) {
    var gElement = Blockly.ContextMenu.optionToDom(option.text);
    var rectElement = /** @type {SVGRectElement} */ (gElement.firstChild);
    var textElement = /** @type {SVGTextElement} */ (gElement.lastChild);
    Blockly.ContextMenu.svgOptions.appendChild(gElement);

    gElement.setAttribute('transform',
        'translate(0, ' + (x * Blockly.ContextMenu.Y_HEIGHT) + ')');
    resizeList.push(rectElement);
    Blockly.bindEvent_(gElement, 'mousedown', null, Blockly.noEvent);
    if (option.enabled) {
      Blockly.bindEvent_(gElement, 'mouseup', null, option.callback);
      Blockly.bindEvent_(gElement, 'mouseup', null, Blockly.ContextMenu.hide);
    } else {
      gElement.setAttribute('class', 'blocklyMenuDivDisabled');
    }
    // Compute the length of the longest text length.
    maxWidth = Math.max(maxWidth, textElement.getComputedTextLength());
  }
  // Run a second pass to resize all options to the required width.
  maxWidth += Blockly.ContextMenu.X_PADDING * 2;
  for (var x = 0; x < resizeList.length; x++) {
    resizeList[x].setAttribute('width', maxWidth);
  }
  if (Blockly.RTL) {
    // Right-align the text.
    for (var x = 0, gElement;
         gElement = Blockly.ContextMenu.svgOptions.childNodes[x]; x++) {
      var textElement = gElement.lastChild;
      textElement.setAttribute('text-anchor', 'end');
      textElement.setAttribute('x', maxWidth - Blockly.ContextMenu.X_PADDING);
    }
  }
  Blockly.ContextMenu.svgBackground.setAttribute('height',
      options.length * Blockly.ContextMenu.Y_HEIGHT + 8);
  Blockly.ContextMenu.svgShadow.setAttribute('height',
      options.length * Blockly.ContextMenu.Y_HEIGHT + 10);

  // Convert the mouse coordinates into SVG coordinates.
  var anchorX = xy.x;
  var anchorY = xy.y;

  // Measure the menu's size and position it so that it does not go off-screen.
  var bBox = Blockly.ContextMenu.svgGroup.getBBox();
  var svgSize = Blockly.svgSize();
  if (anchorY + bBox.height > svgSize.height) {
    // Falling off the bottom of the screen; flip the menu up.
    anchorY -= bBox.height - 10;
  }
  if (Blockly.RTL) {
    if (anchorX - bBox.width <= 0) {
      anchorX++;
    } else {
      // Falling off the left edge in RTL mode; flip menu to right.
      anchorX -= bBox.width;
    }
  } else {
    if (anchorX + bBox.width > svgSize.width) {
      // Falling off the right edge in LTR mode; flip the menu to left.
      anchorX -= bBox.width;
    } else {
      anchorX++;
    }
  }
  Blockly.ContextMenu.svgGroup.setAttribute('transform',
      'translate(' + anchorX + ', ' + anchorY + ')');
  Blockly.ContextMenu.visible = true;
};

/**
 * Create the DOM nodes for a menu option.
 * @param {string} text The option's text.
 * @return {!Element} <g> node containing the menu option.
 */
Blockly.ContextMenu.optionToDom = function(text) {
  /* Here's the SVG we create:
    <g class="blocklyMenuDiv">
      <rect height="20"/>
      <text class="blocklyMenuText" x="20" y="15">Make It So</text>
    </g>
  */
  var gElement = Blockly.createSvgElement('g', {'class': 'blocklyMenuDiv'},
                                          null);
  var rectElement = Blockly.createSvgElement('rect',
      {'height': Blockly.ContextMenu.Y_HEIGHT}, gElement);
  var textElement = Blockly.createSvgElement('text',
      {'class': 'blocklyMenuText',
      'x': Blockly.ContextMenu.X_PADDING,
      'y': 15}, gElement);
  var textNode = document.createTextNode(text);
  textElement.appendChild(textNode);
  return gElement;
};

/**
 * Hide the context menu.
 */
Blockly.ContextMenu.hide = function() {
  if (Blockly.ContextMenu.visible) {
    Blockly.ContextMenu.svgGroup.style.display = 'none';
    Blockly.ContextMenu.visible = false;
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
    var newBlock = Blockly.Xml.domToBlock_(block.workspace, xml);
    // Move the new block next to the old block.
    var xy = block.getRelativeToSurfaceXY();
    if (Blockly.RTL) {
      xy.x -= Blockly.SNAP_RADIUS;
    } else {
      xy.x += Blockly.SNAP_RADIUS;
    }
    xy.y += Blockly.SNAP_RADIUS * 2;
    newBlock.moveBy(xy.x, xy.y);
    newBlock.select();
  };
};
