/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common functions used both internally and externally, but which
 * must not be at the top level to avoid circular dependencies.
 */
'use strict';

/**
 * Common functions used both internally and externally, but which
 * must not be at the top level to avoid circular dependencies.
 * @namespace Blockly.common
 */
goog.module('Blockly.common');

const deprecation = goog.require('Blockly.utils.deprecation');
const {Blocks} = goog.require('Blockly.blocks');
/* eslint-disable-next-line no-unused-vars */
const {Connection} = goog.requireType('Blockly.Connection');
/* eslint-disable-next-line no-unused-vars */
const {ICopyable} = goog.requireType('Blockly.ICopyable');
const {Size} = goog.require('Blockly.utils.Size');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');


/**
 * The main workspace most recently used.
 * Set by Blockly.WorkspaceSvg.prototype.markFocused
 * @type {!Workspace}
 */
let mainWorkspace;

/**
 * Returns the last used top level workspace (based on focus).  Try not to use
 * this function, particularly if there are multiple Blockly instances on a
 * page.
 * @return {!Workspace} The main workspace.
 * @alias Blockly.common.getMainWorkspace
 */
const getMainWorkspace = function() {
  return mainWorkspace;
};
exports.getMainWorkspace = getMainWorkspace;

/**
 * Sets last used main workspace.
 * @param {!Workspace} workspace The most recently used top level workspace.
 * @alias Blockly.common.setMainWorkspace
 */
const setMainWorkspace = function(workspace) {
  mainWorkspace = workspace;
};
exports.setMainWorkspace = setMainWorkspace;

/**
 * Currently selected block.
 * @type {?ICopyable}
 */
let selected = null;

/**
 * Returns the currently selected block.
 * @return {?ICopyable} The currently selected block.
 * @alias Blockly.common.getSelected
 */
const getSelected = function() {
  return selected;
};
exports.getSelected = getSelected;

/**
 * Sets the currently selected block.
 * @param {?ICopyable} newSelection The newly selected block.
 * @alias Blockly.common.setSelected
 */
const setSelected = function(newSelection) {
  selected = newSelection;
};
exports.setSelected = setSelected;

/**
 * Container element in which to render the WidgetDiv, DropDownDiv and Tooltip.
 * @type {?Element}
 */
let parentContainer;

/**
 * Get the container element in which to render the WidgetDiv, DropDownDiv and\
 * Tooltip.
 * @return {?Element} The parent container.
 * @alias Blockly.common.getParentContainer
 */
const getParentContainer = function() {
  return parentContainer;
};
exports.getParentContainer = getParentContainer;

/**
 * Set the parent container.  This is the container element that the WidgetDiv,
 * DropDownDiv, and Tooltip are rendered into the first time `Blockly.inject`
 * is called.
 * This method is a NOP if called after the first ``Blockly.inject``.
 * @param {!Element} newParent The container element.
 * @alias Blockly.common.setParentContainer
 */
const setParentContainer = function(newParent) {
  parentContainer = newParent;
};
exports.setParentContainer = setParentContainer;

/**
 * Size the SVG image to completely fill its container. Call this when the view
 * actually changes sizes (e.g. on a window resize/device orientation change).
 * See Blockly.resizeSvgContents to resize the workspace when the contents
 * change (e.g. when a block is added or removed).
 * Record the height/width of the SVG image.
 * @param {!WorkspaceSvg} workspace Any workspace in the SVG.
 * @alias Blockly.common.svgResize
 */
const svgResize = function(workspace) {
  let mainWorkspace = workspace;
  while (mainWorkspace.options.parentWorkspace) {
    mainWorkspace = mainWorkspace.options.parentWorkspace;
  }
  const svg = mainWorkspace.getParentSvg();
  const cachedSize = mainWorkspace.getCachedParentSvgSize();
  const div = svg.parentNode;
  if (!div) {
    // Workspace deleted, or something.
    return;
  }
  const width = div.offsetWidth;
  const height = div.offsetHeight;
  if (cachedSize.width !== width) {
    svg.setAttribute('width', width + 'px');
    mainWorkspace.setCachedParentSvgSize(width, null);
  }
  if (cachedSize.height !== height) {
    svg.setAttribute('height', height + 'px');
    mainWorkspace.setCachedParentSvgSize(null, height);
  }
  mainWorkspace.resize();
};
exports.svgResize = svgResize;

/**
 * All of the connections on blocks that are currently being dragged.
 * @type {!Array<!Connection>}
 */
exports.draggingConnections = [];

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 * @param {!Block} block The block to map.
 * @param {boolean=} opt_stripFollowing Optionally ignore all following
 *    statements (blocks that are not inside a value or statement input
 *    of the block).
 * @return {!Object} Map of types to type counts for descendants of the bock.
 * @alias Blockly.common.getBlockTypeCounts
 */
const getBlockTypeCounts = function(block, opt_stripFollowing) {
  const typeCountsMap = Object.create(null);
  const descendants = block.getDescendants(true);
  if (opt_stripFollowing) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
      const index = descendants.indexOf(nextBlock);
      descendants.splice(index, descendants.length - index);
    }
  }
  for (let i = 0, checkBlock; (checkBlock = descendants[i]); i++) {
    if (typeCountsMap[checkBlock.type]) {
      typeCountsMap[checkBlock.type]++;
    } else {
      typeCountsMap[checkBlock.type] = 1;
    }
  }
  return typeCountsMap;
};
exports.getBlockTypeCounts = getBlockTypeCounts;

/**
 * Size the workspace when the contents change.  This also updates
 * scrollbars accordingly.
 * @param {!WorkspaceSvg} workspace The workspace to resize.
 * @alias Blockly.resizeSvgContents
 */
const resizeSvgContents = function(workspace) {
  workspace.resizeContents();
};
exports.resizeSvgContents = resizeSvgContents;

/**
 * Returns the dimensions of the specified SVG image.
 * @param {!SVGElement} svg SVG image.
 * @return {!Size} Contains width and height properties.
 * @deprecated Use workspace.setCachedParentSvgSize. (2021 March 5)
 * @alias Blockly.svgSize
 */
const svgSize = function(svg) {
  // When removing this function, remove svg.cachedWidth_ and svg.cachedHeight_
  // from setCachedParentSvgSize.
  // The deprecated name is `Blockly.svgSize` because this function used to be
  // declared in Blockly.js.
  deprecation.warn(
      'Blockly.svgSize', 'March 2021', 'March 2022',
      'workspace.getCachedParentSvgSize');
  svg = /** @type {?} */ (svg);
  return new Size(svg.cachedWidth_, svg.cachedHeight_);
};
exports.svgSize = svgSize;

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @deprecated Use Blockly.common.getMainWorkspace().hideChaff()
 * @param {boolean=} opt_onlyClosePopups Whether only popups should be closed.
 * @alias Blockly.hideChaff
 */
const hideChaff = function(opt_onlyClosePopups) {
  // The deprecated name is `Blockly.hideChaff` because this function used to
  // be declared in Blockly.js
  deprecation.warn('Blockly.hideChaff', 'September 2021', 'September 2022');
  getMainWorkspace().hideChaff(opt_onlyClosePopups);
};
exports.hideChaff = hideChaff;

/**
 * Helper function for defining a block from JSON.  The resulting function has
 * the correct value of jsonDef at the point in code where jsonInit is called.
 * @param {!Object} jsonDef The JSON definition of a block.
 * @return {function()} A function that calls jsonInit with the correct value
 *     of jsonDef.
 */
const jsonInitFactory = function(jsonDef) {
  return function() {
    this.jsonInit(jsonDef);
  };
};

/**
 * Define blocks from an array of JSON block definitions, as might be generated
 * by the Blockly Developer Tools.
 * @param {!Array<!Object>} jsonArray An array of JSON block definitions.
 * @alias Blockly.defineBlocksWithJsonArray
 */
const defineBlocksWithJsonArray = function(jsonArray) {
  for (let i = 0; i < jsonArray.length; i++) {
    const elem = jsonArray[i];
    if (!elem) {
      console.warn(
          'Block definition #' + i + ' in JSON array is ' + elem + '. ' +
          'Skipping.');
    } else {
      const typename = elem.type;
      if (!typename) {
        console.warn(
            'Block definition #' + i +
            ' in JSON array is missing a type attribute. Skipping.');
      } else {
        if (Blocks[typename]) {
          console.warn(
              'Block definition #' + i + ' in JSON array' +
              ' overwrites prior definition of "' + typename + '".');
        }
        Blocks[typename] = {init: jsonInitFactory(elem)};
      }
    }
  }
};
exports.defineBlocksWithJsonArray = defineBlocksWithJsonArray;
