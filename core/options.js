/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object that controls settings for the workspace.
 */
'use strict';

/**
 * Object that controls settings for the workspace.
 * @class
 */
goog.module('Blockly.Options');

const idGenerator = goog.require('Blockly.utils.idGenerator');
const registry = goog.require('Blockly.registry');
const toolbox = goog.require('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {BlocklyOptions} = goog.requireType('Blockly.BlocklyOptions');
const {Classic} = goog.require('Blockly.Themes.Classic');
/* eslint-disable-next-line no-unused-vars */
const {Metrics} = goog.requireType('Blockly.utils.Metrics');
const {Theme} = goog.require('Blockly.Theme');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Parse the user-specified options, using reasonable defaults where behaviour
 * is unspecified.
 * @alias Blockly.Options
 */
class Options {
  /**
   * @param {!BlocklyOptions} options Dictionary of options.
   *     Specification:
   * https://developers.google.com/blockly/guides/get-started/web#configuration
   */
  constructor(options) {
    let toolboxJsonDef = null;
    let hasCategories = false;
    let hasTrashcan = false;
    let hasCollapse = false;
    let hasComments = false;
    let hasDisable = false;
    let hasSounds = false;
    const readOnly = !!options['readOnly'];
    if (!readOnly) {
      toolboxJsonDef = toolbox.convertToolboxDefToJson(options['toolbox']);
      hasCategories = toolbox.hasCategories(toolboxJsonDef);
      hasTrashcan = options['trashcan'];
      if (hasTrashcan === undefined) {
        hasTrashcan = hasCategories;
      }
      hasCollapse = options['collapse'];
      if (hasCollapse === undefined) {
        hasCollapse = hasCategories;
      }
      hasComments = options['comments'];
      if (hasComments === undefined) {
        hasComments = hasCategories;
      }
      hasDisable = options['disable'];
      if (hasDisable === undefined) {
        hasDisable = hasCategories;
      }
      hasSounds = options['sounds'];
      if (hasSounds === undefined) {
        hasSounds = true;
      }
    }

    let maxTrashcanContents = options['maxTrashcanContents'];
    if (hasTrashcan) {
      if (maxTrashcanContents === undefined) {
        maxTrashcanContents = 32;
      }
    } else {
      maxTrashcanContents = 0;
    }
    const rtl = !!options['rtl'];
    let horizontalLayout = options['horizontalLayout'];
    if (horizontalLayout === undefined) {
      horizontalLayout = false;
    }
    let toolboxAtStart = options['toolboxPosition'];
    toolboxAtStart = toolboxAtStart !== 'end';

    /** @type {!toolbox.Position} */
    let toolboxPosition;
    if (horizontalLayout) {
      toolboxPosition =
          toolboxAtStart ? toolbox.Position.TOP : toolbox.Position.BOTTOM;
    } else {
      toolboxPosition = (toolboxAtStart === rtl) ? toolbox.Position.RIGHT :
                                                   toolbox.Position.LEFT;
    }

    let hasCss = options['css'];
    if (hasCss === undefined) {
      hasCss = true;
    }
    let pathToMedia = 'https://blockly-demo.appspot.com/static/media/';
    if (options['media']) {
      pathToMedia = options['media'];
    } else if (options['path']) {
      // 'path' is a deprecated option which has been replaced by 'media'.
      pathToMedia = options['path'] + 'media/';
    }
    let oneBasedIndex;
    if (options['oneBasedIndex'] === undefined) {
      oneBasedIndex = true;
    } else {
      oneBasedIndex = !!options['oneBasedIndex'];
    }
    const renderer = options['renderer'] || 'geras';

    const plugins = options['plugins'] || {};

    /** @type {boolean} */
    this.RTL = rtl;
    /** @type {boolean} */
    this.oneBasedIndex = oneBasedIndex;
    /** @type {boolean} */
    this.collapse = hasCollapse;
    /** @type {boolean} */
    this.comments = hasComments;
    /** @type {boolean} */
    this.disable = hasDisable;
    /** @type {boolean} */
    this.readOnly = readOnly;
    /** @type {number} */
    this.maxBlocks = options['maxBlocks'] || Infinity;
    /** @type {?Object<string, number>} */
    this.maxInstances = options['maxInstances'];
    /** @type {string} */
    this.pathToMedia = pathToMedia;
    /** @type {boolean} */
    this.hasCategories = hasCategories;
    /** @type {!Options.MoveOptions} */
    this.moveOptions = Options.parseMoveOptions_(options, hasCategories);
    /** @deprecated  January 2019 */
    this.hasScrollbars = !!this.moveOptions.scrollbars;
    /** @type {boolean} */
    this.hasTrashcan = hasTrashcan;
    /** @type {number} */
    this.maxTrashcanContents = maxTrashcanContents;
    /** @type {boolean} */
    this.hasSounds = hasSounds;
    /** @type {boolean} */
    this.hasCss = hasCss;
    /** @type {boolean} */
    this.horizontalLayout = horizontalLayout;
    /** @type {?toolbox.ToolboxInfo} */
    this.languageTree = toolboxJsonDef;
    /** @type {!Options.GridOptions} */
    this.gridOptions = Options.parseGridOptions_(options);
    /** @type {!Options.ZoomOptions} */
    this.zoomOptions = Options.parseZoomOptions_(options);
    /** @type {!toolbox.Position} */
    this.toolboxPosition = toolboxPosition;
    /** @type {!Theme} */
    this.theme = Options.parseThemeOptions_(options);
    /** @type {string} */
    this.renderer = renderer;
    /** @type {?Object} */
    this.rendererOverrides = options['rendererOverrides'];

    /**
     * The SVG element for the grid pattern.
     * Created during injection.
     * @type {?SVGElement}
     */
    this.gridPattern = null;

    /**
     * The parent of the current workspace, or null if there is no parent
     * workspace.  We can assert that this is of type WorkspaceSvg as opposed to
     * Workspace as this is only used in a rendered workspace.
     * @type {?WorkspaceSvg}
     */
    this.parentWorkspace = options['parentWorkspace'];

    /**
     * Map of plugin type to name of registered plugin or plugin class.
     * @type {!Object<string, (function(new:?, ...?)|string)>}
     */
    this.plugins = plugins;

    /**
     * If set, sets the translation of the workspace to match the scrollbars.
     * @type {undefined|function(!{x:number,y:number}):void} A function that
     *     sets the translation of the workspace to match the scrollbars. The
     *     argument Contains an x and/or y property which is a float between 0
     *     and 1 specifying the degree of scrolling.
     */
    this.setMetrics = undefined;

    /**
     * @type {undefined|function():!Metrics} A function that returns a metrics
     *     object that describes the current workspace.
     */
    this.getMetrics = undefined;
  }

  /**
   * Parse the user-specified move options, using reasonable defaults where
   *    behaviour is unspecified.
   * @param {!Object} options Dictionary of options.
   * @param {boolean} hasCategories Whether the workspace has categories or not.
   * @return {!Options.MoveOptions} Normalized move options.
   * @private
   */
  static parseMoveOptions_(options, hasCategories) {
    const move = options['move'] || {};
    const moveOptions = {};
    if (move['scrollbars'] === undefined &&
        options['scrollbars'] === undefined) {
      moveOptions.scrollbars = hasCategories;
    } else if (typeof move['scrollbars'] === 'object') {
      moveOptions.scrollbars = {};
      moveOptions.scrollbars.horizontal = !!move['scrollbars']['horizontal'];
      moveOptions.scrollbars.vertical = !!move['scrollbars']['vertical'];
      // Convert scrollbars object to boolean if they have the same value.
      // This allows us to easily check for whether any scrollbars exist using
      // !!moveOptions.scrollbars.
      if (moveOptions.scrollbars.horizontal &&
          moveOptions.scrollbars.vertical) {
        moveOptions.scrollbars = true;
      } else if (
          !moveOptions.scrollbars.horizontal &&
          !moveOptions.scrollbars.vertical) {
        moveOptions.scrollbars = false;
      }
    } else {
      moveOptions.scrollbars = !!move['scrollbars'] || !!options['scrollbars'];
    }

    if (!moveOptions.scrollbars || move['wheel'] === undefined) {
      // Defaults to true if single-direction scroll is enabled.
      moveOptions.wheel = typeof moveOptions.scrollbars === 'object';
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
  }

  /**
   * Parse the user-specified zoom options, using reasonable defaults where
   * behaviour is unspecified.  See zoom documentation:
   *   https://developers.google.com/blockly/guides/configure/web/zoom
   * @param {!Object} options Dictionary of options.
   * @return {!Options.ZoomOptions} Normalized zoom options.
   * @private
   */
  static parseZoomOptions_(options) {
    const zoom = options['zoom'] || {};
    const zoomOptions = {};
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
  }

  /**
   * Parse the user-specified grid options, using reasonable defaults where
   * behaviour is unspecified. See grid documentation:
   *   https://developers.google.com/blockly/guides/configure/web/grid
   * @param {!Object} options Dictionary of options.
   * @return {!Options.GridOptions} Normalized grid options.
   * @private
   */
  static parseGridOptions_(options) {
    const grid = options['grid'] || {};
    const gridOptions = {};
    gridOptions.spacing = Number(grid['spacing']) || 0;
    gridOptions.colour = grid['colour'] || '#888';
    gridOptions.length =
        (grid['length'] === undefined) ? 1 : Number(grid['length']);
    gridOptions.snap = gridOptions.spacing > 0 && !!grid['snap'];
    return gridOptions;
  }

  /**
   * Parse the user-specified theme options, using the classic theme as a
   * default. https://developers.google.com/blockly/guides/configure/web/themes
   * @param {!Object} options Dictionary of options.
   * @return {!Theme} A Blockly Theme.
   * @private
   */
  static parseThemeOptions_(options) {
    const theme = options['theme'] || Classic;
    if (typeof theme === 'string') {
      return /** @type {!Theme} */ (
          registry.getObject(registry.Type.THEME, theme));
    } else if (theme instanceof Theme) {
      return /** @type {!Theme} */ (theme);
    }
    return Theme.defineTheme(
        theme.name || ('builtin' + idGenerator.getNextUniqueId()), theme);
  }
}

/**
 * Grid Options.
 * @typedef {{
 *     colour: string,
 *     length: number,
 *     snap: boolean,
 *     spacing: number
 * }}
 */
Options.GridOptions;

/**
 * Move Options.
 * @typedef {{
 *     drag: boolean,
 *     scrollbars: (boolean | !Options.ScrollbarOptions),
 *     wheel: boolean
 * }}
 */
Options.MoveOptions;

/**
 * Scrollbar Options.
 * @typedef {{
 *     horizontal: boolean,
 *     vertical: boolean
 * }}
 */
Options.ScrollbarOptions;

/**
 * Zoom Options.
 * @typedef {{
 *     controls: boolean,
 *     maxScale: number,
 *     minScale: number,
 *     pinch: boolean,
 *     scaleSpeed: number,
 *     startScale: number,
 *     wheel: boolean
 * }}
 */
Options.ZoomOptions;

exports.Options = Options;
