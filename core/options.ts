/** @fileoverview Object that controls settings for the workspace. */

/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Object that controls settings for the workspace.
 * @class
 */

import type {BlocklyOptions} from './blockly_options.js';
import * as deprecation from './utils/deprecation.js';
import * as registry from './registry.js';
import {Theme} from './theme.js';
import {Classic} from './theme/classic.js';
import * as idGenerator from './utils/idgenerator.js';
/* eslint-disable-next-line no-unused-vars */
import {Metrics} from './utils/metrics.js';
import * as toolbox from './utils/toolbox.js';
/* eslint-disable-next-line no-unused-vars */
import {WorkspaceSvg} from './workspace_svg.js';


/**
 * Parse the user-specified options, using reasonable defaults where behaviour
 * is unspecified.
 * @alias Blockly.Options
 */
export class Options {
  RTL: boolean;
  oneBasedIndex: boolean;
  collapse: boolean;
  comments: boolean;
  disable: boolean;
  readOnly: boolean;
  maxBlocks: number;
  maxInstances: {[key: string]: number}|null;
  pathToMedia: string;
  hasCategories: boolean;
  moveOptions: MoveOptions;
  hasScrollbars: AnyDuringMigration;
  hasTrashcan: boolean;
  maxTrashcanContents: number;
  hasSounds: boolean;
  hasCss: boolean;
  horizontalLayout: boolean;
  languageTree: toolbox.ToolboxInfo|null;
  gridOptions: GridOptions;
  zoomOptions: ZoomOptions;
  toolboxPosition: toolbox.Position;
  theme: Theme;
  renderer: string;
  rendererOverrides: AnyDuringMigration|null;

  /**
   * The SVG element for the grid pattern.
   * Created during injection.
   */
  gridPattern: SVGElement|null = null;
  parentWorkspace: WorkspaceSvg|null;
  plugins: {
    [key: string]: (new(...p1: AnyDuringMigration[]) => AnyDuringMigration)|
    string
  };

  /**
   * If set, sets the translation of the workspace to match the scrollbars.
   * A function that
   *     sets the translation of the workspace to match the scrollbars. The
   *     argument Contains an x and/or y property which is a float between 0
   *     and 1 specifying the degree of scrolling.
   */
  setMetrics?: ((p1: {x: number, y: number}) => void) = undefined;

  /**
   * A function that returns a metrics
   *     object that describes the current workspace.
   */
  getMetrics?: (() => Metrics) = undefined;

  /**
   * @param options Dictionary of options.
   *     Specification:
   * https://developers.google.com/blockly/guides/get-started/web#configuration
   */
  constructor(options: BlocklyOptions) {
    let toolboxJsonDef = null;
    let hasCategories = false;
    let hasTrashcan = false;
    let hasCollapse = false;
    let hasComments = false;
    let hasDisable = false;
    let hasSounds = false;
    const readOnly = !!(options as AnyDuringMigration)['readOnly'];
    if (!readOnly) {
      toolboxJsonDef = toolbox.convertToolboxDefToJson(
          (options as AnyDuringMigration)['toolbox']);
      hasCategories = toolbox.hasCategories(toolboxJsonDef);
      hasTrashcan = (options as AnyDuringMigration)['trashcan'];
      if (hasTrashcan === undefined) {
        hasTrashcan = hasCategories;
      }
      hasCollapse = (options as AnyDuringMigration)['collapse'];
      if (hasCollapse === undefined) {
        hasCollapse = hasCategories;
      }
      hasComments = (options as AnyDuringMigration)['comments'];
      if (hasComments === undefined) {
        hasComments = hasCategories;
      }
      hasDisable = (options as AnyDuringMigration)['disable'];
      if (hasDisable === undefined) {
        hasDisable = hasCategories;
      }
      hasSounds = (options as AnyDuringMigration)['sounds'];
      if (hasSounds === undefined) {
        hasSounds = true;
      }
    }

    let maxTrashcanContents =
        (options as AnyDuringMigration)['maxTrashcanContents'];
    if (hasTrashcan) {
      if (maxTrashcanContents === undefined) {
        maxTrashcanContents = 32;
      }
    } else {
      maxTrashcanContents = 0;
    }
    const rtl = !!(options as AnyDuringMigration)['rtl'];
    let horizontalLayout = (options as AnyDuringMigration)['horizontalLayout'];
    if (horizontalLayout === undefined) {
      horizontalLayout = false;
    }
    let toolboxAtStart = (options as AnyDuringMigration)['toolboxPosition'];
    toolboxAtStart = toolboxAtStart !== 'end';

    let toolboxPosition: toolbox.Position;
    if (horizontalLayout) {
      toolboxPosition =
          toolboxAtStart ? toolbox.Position.TOP : toolbox.Position.BOTTOM;
    } else {
      toolboxPosition = toolboxAtStart === rtl ? toolbox.Position.RIGHT :
                                                 toolbox.Position.LEFT;
    }

    let hasCss = (options as AnyDuringMigration)['css'];
    if (hasCss === undefined) {
      hasCss = true;
    }
    let pathToMedia = 'https://blockly-demo.appspot.com/static/media/';
    if (options['media']) {
      pathToMedia = options['media'].endsWith('/') ? options['media'] :
                                                     options['media'] + '/';
    } else if ((options as AnyDuringMigration)['path']) {
      // 'path' is a deprecated option which has been replaced by 'media'.
      deprecation.warn('path', 'Nov 2014', 'Jul 2023', 'media');
      pathToMedia = (options as AnyDuringMigration)['path'] + 'media/';
    }
    let oneBasedIndex;
    if ((options as AnyDuringMigration)['oneBasedIndex'] === undefined) {
      oneBasedIndex = true;
    } else {
      oneBasedIndex = !!(options as AnyDuringMigration)['oneBasedIndex'];
    }
    const renderer = (options as AnyDuringMigration)['renderer'] || 'geras';

    const plugins = (options as AnyDuringMigration)['plugins'] || {};

    this.RTL = rtl;
    this.oneBasedIndex = oneBasedIndex;
    this.collapse = hasCollapse;
    this.comments = hasComments;
    this.disable = hasDisable;
    this.readOnly = readOnly;
    this.maxBlocks = (options as AnyDuringMigration)['maxBlocks'] || Infinity;
    this.maxInstances = (options as AnyDuringMigration)['maxInstances'];
    this.pathToMedia = pathToMedia;
    this.hasCategories = hasCategories;
    this.moveOptions = Options.parseMoveOptions_(options, hasCategories);
    /** @deprecated  January 2019 */
    this.hasScrollbars = !!this.moveOptions.scrollbars;
    this.hasTrashcan = hasTrashcan;
    this.maxTrashcanContents = maxTrashcanContents;
    this.hasSounds = hasSounds;
    this.hasCss = hasCss;
    this.horizontalLayout = horizontalLayout;
    this.languageTree = toolboxJsonDef;
    this.gridOptions = Options.parseGridOptions_(options);
    this.zoomOptions = Options.parseZoomOptions_(options);
    this.toolboxPosition = toolboxPosition;
    this.theme = Options.parseThemeOptions_(options);
    this.renderer = renderer;
    this.rendererOverrides =
        (options as AnyDuringMigration)['rendererOverrides'];

    /**
     * The parent of the current workspace, or null if there is no parent
     * workspace.  We can assert that this is of type WorkspaceSvg as opposed to
     * Workspace as this is only used in a rendered workspace.
     */
    this.parentWorkspace = (options as AnyDuringMigration)['parentWorkspace'];

    /** Map of plugin type to name of registered plugin or plugin class. */
    this.plugins = plugins;
  }

  /**
   * Parse the user-specified move options, using reasonable defaults where
   *    behaviour is unspecified.
   * @param options Dictionary of options.
   * @param hasCategories Whether the workspace has categories or not.
   * @return Normalized move options.
   */
  private static parseMoveOptions_(
      options: AnyDuringMigration, hasCategories: boolean): MoveOptions {
    const move = options['move'] || {};
    const moveOptions = {} as MoveOptions;
    if (move['scrollbars'] === undefined &&
        options['scrollbars'] === undefined) {
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'.
      (moveOptions as AnyDuringMigration).scrollbars = hasCategories;
    } else if (typeof move['scrollbars'] === 'object') {
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'.
      (moveOptions as AnyDuringMigration).scrollbars = {};
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'.
      (moveOptions as AnyDuringMigration).scrollbars.horizontal =
          !!move['scrollbars']['horizontal'];
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'.
      (moveOptions as AnyDuringMigration).scrollbars.vertical =
          !!move['scrollbars']['vertical'];
      // Convert scrollbars object to boolean if they have the same value.
      // This allows us to easily check for whether any scrollbars exist using
      // !!moveOptions.scrollbars.
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'. AnyDuringMigration because:  Property 'scrollbars' does not
      // exist on type '{}'.
      if ((moveOptions as AnyDuringMigration).scrollbars.horizontal &&
          (moveOptions as AnyDuringMigration).scrollbars.vertical) {
        // AnyDuringMigration because:  Property 'scrollbars' does not exist on
        // type '{}'.
        (moveOptions as AnyDuringMigration).scrollbars = true;
        // AnyDuringMigration because:  Property 'scrollbars' does not exist on
        // type '{}'. AnyDuringMigration because:  Property 'scrollbars' does
        // not exist on type '{}'.
      } else if (
          !(moveOptions as AnyDuringMigration).scrollbars.horizontal &&
          !(moveOptions as AnyDuringMigration).scrollbars.vertical) {
        // AnyDuringMigration because:  Property 'scrollbars' does not exist on
        // type '{}'.
        (moveOptions as AnyDuringMigration).scrollbars = false;
      }
    } else {
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'.
      (moveOptions as AnyDuringMigration).scrollbars =
          !!move['scrollbars'] || !!options['scrollbars'];
    }

    // AnyDuringMigration because:  Property 'scrollbars' does not exist on type
    // '{}'.
    if (!(moveOptions as AnyDuringMigration).scrollbars ||
        move['wheel'] === undefined) {
      // Defaults to true if single-direction scroll is enabled.
      // AnyDuringMigration because:  Property 'scrollbars' does not exist on
      // type '{}'. AnyDuringMigration because:  Property 'wheel' does not exist
      // on type '{}'.
      (moveOptions as AnyDuringMigration).wheel =
          typeof (moveOptions as AnyDuringMigration).scrollbars === 'object';
    } else {
      // AnyDuringMigration because:  Property 'wheel' does not exist on type
      // '{}'.
      (moveOptions as AnyDuringMigration).wheel = !!move['wheel'];
    }
    // AnyDuringMigration because:  Property 'scrollbars' does not exist on type
    // '{}'.
    if (!(moveOptions as AnyDuringMigration).scrollbars) {
      // AnyDuringMigration because:  Property 'drag' does not exist on type
      // '{}'.
      (moveOptions as AnyDuringMigration).drag = false;
    } else if (move['drag'] === undefined) {
      // Defaults to true if scrollbars is true.
      // AnyDuringMigration because:  Property 'drag' does not exist on type
      // '{}'.
      (moveOptions as AnyDuringMigration).drag = true;
    } else {
      // AnyDuringMigration because:  Property 'drag' does not exist on type
      // '{}'.
      (moveOptions as AnyDuringMigration).drag = !!move['drag'];
    }
    return moveOptions;
  }

  /**
   * Parse the user-specified zoom options, using reasonable defaults where
   * behaviour is unspecified.  See zoom documentation:
   *   https://developers.google.com/blockly/guides/configure/web/zoom
   * @param options Dictionary of options.
   * @return Normalized zoom options.
   */
  private static parseZoomOptions_(options: AnyDuringMigration): ZoomOptions {
    const zoom = options['zoom'] || {};
    const zoomOptions = {} as ZoomOptions;
    if (zoom['controls'] === undefined) {
      // AnyDuringMigration because:  Property 'controls' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).controls = false;
    } else {
      // AnyDuringMigration because:  Property 'controls' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).controls = !!zoom['controls'];
    }
    if (zoom['wheel'] === undefined) {
      // AnyDuringMigration because:  Property 'wheel' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).wheel = false;
    } else {
      // AnyDuringMigration because:  Property 'wheel' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).wheel = !!zoom['wheel'];
    }
    if (zoom['startScale'] === undefined) {
      // AnyDuringMigration because:  Property 'startScale' does not exist on
      // type '{}'.
      (zoomOptions as AnyDuringMigration).startScale = 1;
    } else {
      // AnyDuringMigration because:  Property 'startScale' does not exist on
      // type '{}'.
      (zoomOptions as AnyDuringMigration).startScale =
          Number(zoom['startScale']);
    }
    if (zoom['maxScale'] === undefined) {
      // AnyDuringMigration because:  Property 'maxScale' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).maxScale = 3;
    } else {
      // AnyDuringMigration because:  Property 'maxScale' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).maxScale = Number(zoom['maxScale']);
    }
    if (zoom['minScale'] === undefined) {
      // AnyDuringMigration because:  Property 'minScale' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).minScale = 0.3;
    } else {
      // AnyDuringMigration because:  Property 'minScale' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).minScale = Number(zoom['minScale']);
    }
    if (zoom['scaleSpeed'] === undefined) {
      // AnyDuringMigration because:  Property 'scaleSpeed' does not exist on
      // type '{}'.
      (zoomOptions as AnyDuringMigration).scaleSpeed = 1.2;
    } else {
      // AnyDuringMigration because:  Property 'scaleSpeed' does not exist on
      // type '{}'.
      (zoomOptions as AnyDuringMigration).scaleSpeed =
          Number(zoom['scaleSpeed']);
    }
    if (zoom['pinch'] === undefined) {
      // AnyDuringMigration because:  Property 'controls' does not exist on type
      // '{}'. AnyDuringMigration because:  Property 'wheel' does not exist on
      // type '{}'. AnyDuringMigration because:  Property 'pinch' does not exist
      // on type '{}'.
      (zoomOptions as AnyDuringMigration).pinch =
          (zoomOptions as AnyDuringMigration).wheel ||
          (zoomOptions as AnyDuringMigration).controls;
    } else {
      // AnyDuringMigration because:  Property 'pinch' does not exist on type
      // '{}'.
      (zoomOptions as AnyDuringMigration).pinch = !!zoom['pinch'];
    }
    return zoomOptions;
  }

  /**
   * Parse the user-specified grid options, using reasonable defaults where
   * behaviour is unspecified. See grid documentation:
   *   https://developers.google.com/blockly/guides/configure/web/grid
   * @param options Dictionary of options.
   * @return Normalized grid options.
   */
  private static parseGridOptions_(options: AnyDuringMigration): GridOptions {
    const grid = options['grid'] || {};
    const gridOptions = {} as GridOptions;
    // AnyDuringMigration because:  Property 'spacing' does not exist on type
    // '{}'.
    (gridOptions as AnyDuringMigration).spacing = Number(grid['spacing']) || 0;
    // AnyDuringMigration because:  Property 'colour' does not exist on type
    // '{}'.
    (gridOptions as AnyDuringMigration).colour = grid['colour'] || '#888';
    // AnyDuringMigration because:  Property 'length' does not exist on type
    // '{}'.
    (gridOptions as AnyDuringMigration).length =
        grid['length'] === undefined ? 1 : Number(grid['length']);
    // AnyDuringMigration because:  Property 'spacing' does not exist on type
    // '{}'. AnyDuringMigration because:  Property 'snap' does not exist on type
    // '{}'.
    (gridOptions as AnyDuringMigration).snap =
        (gridOptions as AnyDuringMigration).spacing > 0 && !!grid['snap'];
    return gridOptions;
  }

  /**
   * Parse the user-specified theme options, using the classic theme as a
   * default. https://developers.google.com/blockly/guides/configure/web/themes
   * @param options Dictionary of options.
   * @return A Blockly Theme.
   */
  private static parseThemeOptions_(options: AnyDuringMigration): Theme {
    const theme = options['theme'] || Classic;
    if (typeof theme === 'string') {
      return registry.getObject(registry.Type.THEME, theme) as Theme;
    } else if (theme instanceof Theme) {
      return theme;
    }
    return Theme.defineTheme(
        theme.name || 'builtin' + idGenerator.getNextUniqueId(), theme);
  }
}
export interface GridOptions {
  colour: string;
  length: number;
  snap: boolean;
  spacing: number;
}
export interface MoveOptions {
  drag: boolean;
  scrollbars: boolean|ScrollbarOptions;
  wheel: boolean;
}
export interface ScrollbarOptions {
  horizontal: boolean;
  vertical: boolean;
}
export interface ZoomOptions {
  controls: boolean;
  maxScale: number;
  minScale: number;
  pinch: boolean;
  scaleSpeed: number;
  startScale: number;
  wheel: boolean;
}
