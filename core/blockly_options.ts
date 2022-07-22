/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object that defines user-specified options for the workspace.
 */

/**
 * Object that defines user-specified options for the workspace.
 * @namespace Blockly.BlocklyOptions
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.BlocklyOptions');

import {Theme} from './theme.js';
import {Workspace} from './workspace.js';


/**
 * Blockly options.
 * This interface is further described in
 * `typings/parts/blockly-interfaces.d.ts`.
 * @alias Blockly.BlocklyOptions
 */
export interface BlocklyOptions {
  collapse?: boolean;
  comments?: boolean;
  cs?: boolean;
  disable?: boolean;
  grid?: GridOptions;
  horizontalLayout?: boolean;
  maxBlocks?: number;
  maxInstances?: {[blockType: string]: number};
  media?: string;
  move?: MoveOptions;
  oneBasedIndex?: boolean;
  readOnly?: boolean;
  renderer?: string;
  rendererOverrides?: {[rendererConstant: string]: any};
  rtl?: boolean;
  scrollbars?: ScrollbarOptions|boolean;
  sounds?: boolean;
  theme?: Theme;
  toolbox?: string|object|Element;
  toolboxPosition?: string;
  trashcan?: boolean;
  maxTrashcanContents?: boolean;
  plugins?: object;
  zoom?: ZoomOptions;
  parentWorkspace?: Workspace;
}

export interface GridOptions {
  colour?: string;
  length?: number;
  snap?: boolean;
  spacing?: number;
}

export interface MoveOptions {
  drag?: boolean;
  scrollbars?: boolean|ScrollbarOptions;
  wheel?: boolean;
}

export interface ScrollbarOptions {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface ZoomOptions {
  controls?: boolean;
  maxScale?: number;
  minScale?: number;
  pinch?: boolean;
  scaleSpeed?: number;
  startScale?: number;
  wheel?: boolean;
}
