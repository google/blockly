/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Object that controls settings for the workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Options');


/**
 * Parse the user-specified options, using reasonable defaults where behaviour
 * is unspecified.
 * @param {!Object} options Dictionary of options.  Specification:
 *   https://developers.google.com/blockly/guides/get-started/web#configuration
 * @constructor
 */
Blockly.Options = function(options) {
  var readOnly = !!options['readOnly'];
  if (readOnly) {
    var languageTree = null;
    var hasCategories = false;
    var hasTrashcan = false;
    var hasCollapse = false;
    var hasComments = false;
    var hasDisable = false;
    var hasSounds = false;
  } else {
    var languageTree = Blockly.Options.parseToolboxTree(options['toolbox']);
    var hasCategories = Boolean(languageTree &&
        languageTree.getElementsByTagName('category').length);
    var hasTrashcan = options['trashcan'];
    if (hasTrashcan === undefined) {
      hasTrashcan = hasCategories;
    }
    var hasCollapse = options['collapse'];
    if (hasCollapse === undefined) {
      hasCollapse = hasCategories;
    }
    var hasComments = options['comments'];
    if (hasComments === undefined) {
      hasComments = hasCategories;
    }
    var hasDisable = options['disable'];
    if (hasDisable === undefined) {
      hasDisable = hasCategories;
    }
    var hasSounds = options['sounds'];
    if (hasSounds === undefined) {
      hasSounds = true;
    }
  }
  var rtl = !!options['rtl'];
  var horizontalLayout = options['horizontalLayout'];
  if (horizontalLayout === undefined) {
    horizontalLayout = false;
  }
  var toolboxAtStart = options['toolboxPosition'];
  if (toolboxAtStart === 'end') {
    toolboxAtStart = false;
  } else {
    toolboxAtStart = true;
  }

  if (horizontalLayout) {
    var toolboxPosition = toolboxAtStart ?
        Blockly.TOOLBOX_AT_TOP : Blockly.TOOLBOX_AT_BOTTOM;
  } else {
    var toolboxPosition = (toolboxAtStart == rtl) ?
        Blockly.TOOLBOX_AT_RIGHT : Blockly.TOOLBOX_AT_LEFT;
  }

  var hasScrollbars = options['scrollbars'];
  if (hasScrollbars === undefined) {
    hasScrollbars = hasCategories;
  }
  var hasCss = options['css'];
  if (hasCss === undefined) {
    hasCss = true;
  }
  var pathToMedia = 'https://blockly-demo.appspot.com/static/media/';
  if (options['media']) {
    pathToMedia = options['media'];
  } else if (options['path']) {
    // 'path' is a deprecated option which has been replaced by 'media'.
    pathToMedia = options['path'] + 'media/';
  }
  if (options['oneBasedIndex'] === undefined) {
    var oneBasedIndex = true;
  } else {
    var oneBasedIndex = !!options['oneBasedIndex'];
  }

  this.RTL = rtl;
  this.oneBasedIndex = oneBasedIndex;
  this.collapse = hasCollapse;
  this.comments = hasComments;
  this.disable = hasDisable;
  this.readOnly = readOnly;
  this.maxBlocks = options['maxBlocks'] || Infinity;
  this.pathToMedia = pathToMedia;
  this.hasCategories = hasCategories;
  this.hasScrollbars = hasScrollbars;
  this.hasTrashcan = hasTrashcan;
  this.hasSounds = hasSounds;
  this.hasCss = hasCss;
  this.horizontalLayout = horizontalLayout;
  this.languageTree = languageTree;
  this.gridOptions = Blockly.Options.parseGridOptions_(options);
  this.zoomOptions = Blockly.Options.parseZoomOptions_(options);
  this.toolboxPosition = toolboxPosition;
};

/**
 * The parent of the current workspace, or null if there is no parent workspace.
 * @type {Blockly.Workspace}
 **/
Blockly.Options.prototype.parentWorkspace = null;

/**
 * If set, sets the translation of the workspace to match the scrollbars.
 */
Blockly.Options.prototype.setMetrics = null;

/**
 * Return an object with the metrics required to size the workspace.
 * @return {Object} Contains size and position metrics, or null.
 */
Blockly.Options.prototype.getMetrics = null;

/**
 * Parse the user-specified zoom options, using reasonable defaults where
 * behaviour is unspecified.  See zoom documentation:
 *   https://developers.google.com/blockly/guides/configure/web/zoom
 * @param {!Object} options Dictionary of options.
 * @return {!Object} A dictionary of normalized options.
 * @private
 */
Blockly.Options.parseZoomOptions_ = function(options) {
  var zoom = options['zoom'] || {};
  var zoomOptions = {};
  if (zoom['controls'] === undefined) {
    zoomOptions.controls = false;
  } else {
    zoomOptions.controls = !!zoom['controls'];
  }
  if (zoom['wheel'] === undefined) {
    zoomOptions.wheel = false;
  } else {
    zoomOptions.wheel = !!zoom['wheel'];
  }
  if (zoom['startScale'] === undefined) {
    zoomOptions.startScale = 1;
  } else {
    zoomOptions.startScale = parseFloat(zoom['startScale']);
  }
  if (zoom['maxScale'] === undefined) {
    zoomOptions.maxScale = 3;
  } else {
    zoomOptions.maxScale = parseFloat(zoom['maxScale']);
  }
  if (zoom['minScale'] === undefined) {
    zoomOptions.minScale = 0.3;
  } else {
    zoomOptions.minScale = parseFloat(zoom['minScale']);
  }
  if (zoom['scaleSpeed'] === undefined) {
    zoomOptions.scaleSpeed = 1.2;
  } else {
    zoomOptions.scaleSpeed = parseFloat(zoom['scaleSpeed']);
  }
  return zoomOptions;
};

/**
 * Parse the user-specified grid options, using reasonable defaults where
 * behaviour is unspecified. See grid documentation:
 *   https://developers.google.com/blockly/guides/configure/web/grid
 * @param {!Object} options Dictionary of options.
 * @return {!Object} A dictionary of normalized options.
 * @private
 */
Blockly.Options.parseGridOptions_ = function(options) {
  var grid = options['grid'] || {};
  var gridOptions = {};
  gridOptions.spacing = parseFloat(grid['spacing']) || 0;
  gridOptions.colour = grid['colour'] || '#888';
  gridOptions.length = parseFloat(grid['length']) || 1;
  gridOptions.snap = gridOptions.spacing > 0 && !!grid['snap'];
  return gridOptions;
};

/**
 * Parse the provided toolbox tree into a consistent DOM format.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 * @return {Node} DOM tree of blocks, or null.
 */
Blockly.Options.parseToolboxTree = function(tree) {
  if (tree) {
    if (typeof tree != 'string') {
      if (typeof XSLTProcessor == 'undefined' && tree.outerHTML) {
        // In this case the tree will not have been properly built by the
        // browser. The HTML will be contained in the element, but it will
        // not have the proper DOM structure since the browser doesn't support
        // XSLTProcessor (XML -> HTML). This is the case in IE 9+.
        tree = tree.outerHTML;
      } else if (!(tree instanceof Element)) {
        tree = null;
      }
    }
    if (typeof tree == 'string') {
      tree = Blockly.Xml.textToDom(tree);
    }
  } else {
    tree = null;
  }
  return tree;
};
