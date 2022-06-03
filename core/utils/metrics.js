/** @fileoverview Workspace metrics definitions. */


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
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Workspace metrics definitions.
 * @namespace Blockly.utils.Metrics
 */


/** @alias Blockly.utils.Metrics */
export interface Metrics {
  /** Height of the visible portion of the workspace. */
  viewHeight: number;

  /** Width of the visible portion of the workspace. */
  viewWidth: number;

  /** Height of the content. */
  contentHeight: number;

  /** Width of the content. */
  contentWidth: number;

  /** Height of the scroll area. */
  scrollHeight: number;

  /** Width of the scroll area. */
  scrollWidth: number;

  /**
   * Top-edge of the visible portion of the workspace, relative to the workspace
   * origin.
   */
  viewTop: number;

  /**
   * Left-edge of the visible portion of the workspace, relative to the
   * workspace origin.
   */
  viewLeft: number;

  /** Top-edge of the content, relative to the workspace origin. */
  contentTop: number;

  /** Left-edge of the content relative to the workspace origin. */
  contentLeft: number;

  /** Top-edge of the scroll area, relative to the workspace origin. */
  scrollTop: number;

  /** Left-edge of the scroll area relative to the workspace origin. */
  scrollLeft: number;

  /**
   * Top-edge of the visible portion of the workspace, relative to the
   * blocklyDiv.
   */
  absoluteTop: number;

  /**
   * Left-edge of the visible portion of the workspace, relative to the
   * blocklyDiv.
   */
  absoluteLeft: number;

  /**
   * Height of the Blockly div (the view + the toolbox, simple of otherwise).
   */
  svgHeight: number;

  /** Width of the Blockly div (the view + the toolbox, simple or otherwise). */
  svgWidth: number;

  /** Width of the toolbox, if it exists.  Otherwise zero. */
  toolboxWidth: number;

  /** Height of the toolbox, if it exists.  Otherwise zero. */
  toolboxHeight: number;

  /** Top, bottom, left or right. Use TOOLBOX_AT constants to compare. */
  toolboxPosition: number;

  /** Width of the flyout if it is always open.  Otherwise zero. */
  flyoutWidth: number;

  /** Height of the flyout if it is always open.  Otherwise zero. */
  flyoutHeight: number;
}
