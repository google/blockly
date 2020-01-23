/**
 * @license
 * Copyright 2016 Google LLC
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

goog.require('Blockly.Theme');
goog.require('Blockly.Themes.Classic');
goog.require('Blockly.user.keyMap');
goog.require('Blockly.utils.userAgent');
goog.require('Blockly.Xml');


/**
 * Parse the user-specified options, using reasonable defaults where behaviour
 * is unspecified.
 * @param {!Blockly.BlocklyOptions} options Dictionary of options.
 *     Specification: https://developers.google.com/blockly/guides/get-started/web#configuration
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
    var languageTree =
        Blockly.Options.parseToolboxTree(options['toolbox'] || null);
    var hasCategories = Boolean(languageTree &&
        languageTree.getElementsByTagName('category').length);
    var hasTrashcan = options['trashcan'];
    if (hasTrashcan === undefined) {
      hasTrashcan = hasCategories;
    }
    var maxTrashcanContents = options['maxTrashcanContents'];
    if (hasTrashcan) {
      if (maxTrashcanContents === undefined) {
        maxTrashcanContents = 32;
      }
    } else {
      maxTrashcanContents = 0;
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
  toolboxAtStart = toolboxAtStart !== 'end';

  if (horizontalLayout) {
    var toolboxPosition = toolboxAtStart ?
        Blockly.TOOLBOX_AT_TOP : Blockly.TOOLBOX_AT_BOTTOM;
  } else {
    var toolboxPosition = (toolboxAtStart == rtl) ?
        Blockly.TOOLBOX_AT_RIGHT : Blockly.TOOLBOX_AT_LEFT;
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
  var keyMap = options['keyMap'] || Blockly.user.keyMap.createDefaultKeyMap();

  var renderer = options['renderer'] || 'geras';

  this.RTL = rtl;
  this.oneBasedIndex = oneBasedIndex;
  this.collapse = hasCollapse;
  this.comments = hasComments;
  this.disable = hasDisable;
  this.readOnly = readOnly;
  this.maxBlocks = options['maxBlocks'] || Infinity;
  this.maxInstances = options['maxInstances'];
  this.pathToMedia = pathToMedia;
  this.hasCategories = hasCategories;
  this.moveOptions = Blockly.Options.parseMoveOptions(options, hasCategories);
  /** @deprecated  January 2019 */
  this.hasScrollbars = this.moveOptions.scrollbars;
  this.hasTrashcan = hasTrashcan;
  this.maxTrashcanContents = maxTrashcanContents;
  this.hasSounds = hasSounds;
  this.hasCss = hasCss;
  this.horizontalLayout = horizontalLayout;
  this.languageTree = languageTree;
  this.gridOptions = Blockly.Options.parseGridOptions_(options);
  this.zoomOptions = Blockly.Options.parseZoomOptions_(options);
  this.toolboxPosition = toolboxPosition;
  this.theme = Blockly.Options.parseThemeOptions_(options);
  this.keyMap = keyMap;
  this.renderer = renderer;

  /**
   * The SVG element for the grid pattern.
   * Created during injection.
   * @type {!SVGElement}
   */
  this.gridPattern = undefined;

  /**
   * The parent of the current workspace, or null if there is no parent
   * workspace.
   * @type {Blockly.Workspace}
   */
  this.parentWorkspace = options['parentWorkspace'];
};

/**
 * Blockly options.
 * This interface is further described in `typings/blockly-interfaces.d.ts`.
 * @interface
 */
Blockly.BlocklyOptions = function() {};

/**
 * If set, sets the translation of the workspace to match the scrollbars.
 * @param {!Object} xyRatio Contains an x and/or y property which is a float
 *     between 0 and 1 specifying the degree of scrolling.
 * @return {void}
 */
Blockly.Options.prototype.setMetrics;

/**
 * Return an object with the metrics required to size the workspace.
 * @return {!Object} Contains size and position metrics.
 */
Blockly.Options.prototype.getMetrics;

/**
 * Parse the user-specified move options, using reasonable defaults where
 *    behaviour is unspecified.
 * @param {!Object} options Dictionary of options.
 * @param {boolean} hasCategories Whether the workspace has categories or not.
 * @return {!Object} A dictionary of normalized options.
 * @private
 */
Blockly.Options.parseMoveOptions = function(options, hasCategories) {
  var move = options['move'] || {};
  var moveOptions = {};
  if (move['scrollbars'] === undefined && options['scrollbars'] === undefined) {
    moveOptions.scrollbars = hasCategories;
  } else {
    moveOptions.scrollbars = !!move['scrollbars'] || !!options['scrollbars'];
  }
  if (!moveOptions.scrollbars || move['wheel'] === undefined) {
    // Defaults to false so that developers' settings don't appear to change.
    moveOptions.wheel = false;
  } else {
    moveOptions.wheel = !!move['wheel'];
  }
  if (!moveOptions.scrollbars) {
    moveOptions.drag = false;
  } else if (move['drag'] === undefined) {
    // Defaults to true if scrollbars is true.
    moveOptions.drag = true;
  } else {
    moveOptions.drag = !!move['drag'];
  }
  return moveOptions;
};

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
    zoomOptions.startScale = Number(zoom['startScale']);
  }
  if (zoom['maxScale'] === undefined) {
    zoomOptions.maxScale = 3;
  } else {
    zoomOptions.maxScale = Number(zoom['maxScale']);
  }
  if (zoom['minScale'] === undefined) {
    zoomOptions.minScale = 0.3;
  } else {
    zoomOptions.minScale = Number(zoom['minScale']);
  }
  if (zoom['scaleSpeed'] === undefined) {
    zoomOptions.scaleSpeed = 1.2;
  } else {
    zoomOptions.scaleSpeed = Number(zoom['scaleSpeed']);
  }
  if (zoom['pinch'] === undefined) {
    zoomOptions.pinch = zoomOptions.wheel || zoomOptions.controls;
  } else {
    zoomOptions.pinch = !!zoom['pinch'];
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
  gridOptions.spacing = Number(grid['spacing']) || 0;
  gridOptions.colour = grid['colour'] || '#888';
  gridOptions.length =
      (grid['length'] === undefined) ? 1 : Number(grid['length']);
  gridOptions.snap = gridOptions.spacing > 0 && !!grid['snap'];
  return gridOptions;
};

/**
 * Parse the user-specified theme options, using the classic theme as a default.
 *   https://developers.google.com/blockly/guides/configure/web/themes
 * @param {!Object} options Dictionary of options.
 * @return {!Blockly.Theme} A Blockly Theme.
 * @private
 */
Blockly.Options.parseThemeOptions_ = function(options) {
  var theme = options['theme'] || Blockly.Themes.Classic;
  if (theme instanceof Blockly.Theme) {
    return /** @type {!Blockly.Theme} */ (theme);
  }
  return new Blockly.Theme('builtin',
      theme['blockStyles'], theme['categoryStyles'], theme['componentStyles']);
};

/**
 * Parse the provided toolbox tree into a consistent DOM format.
 * @param {Node|string} tree DOM tree of blocks, or text representation of same.
 * @return {Node} DOM tree of blocks, or null.
 */
Blockly.Options.parseToolboxTree = function(tree) {
  if (tree) {
    if (typeof tree != 'string') {
      if (Blockly.utils.userAgent.IE && tree.outerHTML) {
        // In this case the tree will not have been properly built by the
        // browser. The HTML will be contained in the element, but it will
        // not have the proper DOM structure since the browser doesn't support
        // XSLTProcessor (XML -> HTML).
        tree = tree.outerHTML;
      } else if (!(tree instanceof Element)) {
        tree = null;
      }
    }
    if (typeof tree == 'string') {
      tree = Blockly.Xml.textToDom(tree);
      if (tree.nodeName.toLowerCase() != 'xml') {
        throw TypeError('Toolbox should be an <xml> document.');
      }
    }
  } else {
    tree = null;
  }
  return tree;
};
