/** @fileoverview Base renderer. */


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
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Base renderer.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
import { Block } from 'google3/third_party/javascript/blockly/core/block';
/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from 'google3/third_party/javascript/blockly/core/block_svg';
import { Connection } from 'google3/third_party/javascript/blockly/core/connection';
import { ConnectionType } from 'google3/third_party/javascript/blockly/core/connection_type';
import { InsertionMarkerManager, PreviewType } from 'google3/third_party/javascript/blockly/core/insertion_marker_manager';
/* eslint-disable-next-line no-unused-vars */
import { IRegistrable } from 'google3/third_party/javascript/blockly/core/interfaces/i_registrable';
/* eslint-disable-next-line no-unused-vars */
import { Marker } from 'google3/third_party/javascript/blockly/core/keyboard_nav/marker';
/* eslint-disable-next-line no-unused-vars */
import { RenderedConnection } from 'google3/third_party/javascript/blockly/core/rendered_connection';
import { BlockStyle, Theme } from 'google3/third_party/javascript/blockly/core/theme';
import * as object from 'google3/third_party/javascript/blockly/core/utils/object';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from 'google3/third_party/javascript/blockly/core/workspace_svg';

import { ConstantProvider } from './constants';
import * as debug from './debug';
/* eslint-disable-next-line no-unused-vars */
import { Debug } from './debugger';
import { Drawer } from './drawer';
/* eslint-disable-next-line no-unused-vars */
import { IPathObject } from './i_path_object';
import { RenderInfo } from './info';
import { MarkerSvg } from './marker_svg';
import { PathObject } from './path_object';


/**
 * The base class for a block renderer.
 * @alias Blockly.blockRendering.Renderer
 */
export class Renderer implements IRegistrable {
  /** The renderer's constant provider. */
  protected constants_!: ConstantProvider;

  /** Rendering constant overrides, passed in through options. */
  overrides: object | null = null;

  /** @param name The renderer name. */
  constructor(public name: string) {}

  /**
   * Gets the class name that identifies this renderer.
   * @return The CSS class name.
   */
  getClassName(): string {
    return this.name + '-renderer';
  }

  /**
   * Initialize the renderer.
   * @param theme The workspace theme object.
   * @param opt_rendererOverrides Rendering constant overrides.
   */
  init(theme: Theme, opt_rendererOverrides?: object) {
    this.constants_ = this.makeConstants_();
    if (opt_rendererOverrides) {
      this.overrides = opt_rendererOverrides;
      object.mixin(this.constants_, opt_rendererOverrides);
    }
    this.constants_.setTheme(theme);
    this.constants_.init();
  }

  /**
   * Create any DOM elements that this renderer needs.
   * @param svg The root of the workspace's SVG.
   * @param theme The workspace theme object.
   */
  createDom(svg: SVGElement, theme: Theme) {
    this.constants_.createDom(
      svg, this.name + '-' + theme.name,
      '.' + this.getClassName() + '.' + theme.getClassName());
  }

  /**
   * Refresh the renderer after a theme change.
   * @param svg The root of the workspace's SVG.
   * @param theme The workspace theme object.
   */
  refreshDom(svg: SVGElement, theme: Theme) {
    const previousConstants = this.getConstants();
    previousConstants.dispose();
    this.constants_ = this.makeConstants_();
    if (this.overrides) {
      object.mixin(this.constants_, this.overrides);
    }
    // Ensure the constant provider's random identifier does not change.
    this.constants_.randomIdentifier = previousConstants.randomIdentifier;
    this.constants_.setTheme(theme);
    this.constants_.init();
    this.createDom(svg, theme);
  }

  /**
   * Dispose of this renderer.
   * Delete all DOM elements that this renderer and its constants created.
   */
  dispose() {
    if (this.constants_) {
      this.constants_.dispose();
    }
  }

  /**
   * Create a new instance of the renderer's constant provider.
   * @return The constant provider.
   */
  protected makeConstants_(): ConstantProvider {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param block The block to measure.
   * @return The render info object.
   */
  protected makeRenderInfo_(block: BlockSvg): RenderInfo {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @return The drawer.
   */
  protected makeDrawer_(block: BlockSvg, info: RenderInfo): Drawer {
    return new Drawer(block, info);
  }

  /**
   * Create a new instance of the renderer's debugger.
   * @return The renderer debugger.
   * @suppress {strictModuleDepCheck} Debug renderer only included in
   * playground.
   */
  protected makeDebugger_(): Debug {
    // AnyDuringMigration because:  Property 'get' does not exist on type
    // '(name: string) => void'.
    const { Debug } =
      (goog.module as AnyDuringMigration).get('Blockly.blockRendering.Debug');
    if (!Debug) {
      throw Error('Missing require for Blockly.blockRendering.Debug');
    }
    return new Debug(this.getConstants());
  }

  /**
   * Create a new instance of the renderer's marker drawer.
   * @param workspace The workspace the marker belongs to.
   * @param marker The marker.
   * @return The object in charge of drawing the marker.
   */
  makeMarkerDrawer(workspace: WorkspaceSvg, marker: Marker): MarkerSvg {
    return new MarkerSvg(workspace, this.getConstants(), marker);
  }

  /**
   * Create a new instance of a renderer path object.
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @return The renderer path object.
   */
  makePathObject(root: SVGElement, style: BlockStyle): IPathObject {
    return new PathObject(root, style, (this.constants_));
  }

  /**
   * Get the current renderer's constant provider.  We assume that when this is
   * called, the renderer has already been initialized.
   * @return The constant provider.
   */
  getConstants(): ConstantProvider {
    return this.constants_;
  }

  /**
   * Determine whether or not to highlight a connection.
   * @param _conn The connection to determine whether or not to highlight.
   * @return True if we should highlight the connection.
   */
  shouldHighlightConnection(_conn: Connection): boolean {
    return true;
  }

  /**
   * Checks if an orphaned block can connect to the "end" of the topBlock's
   * block-clump. If the clump is a row the end is the last input. If the clump
   * is a stack, the end is the last next connection. If the clump is neither,
   * then this returns false.
   * @param topBlock The top block of the block clump we want to try and connect
   *     to.
   * @param orphanBlock The orphan block that wants to find a home.
   * @param localType The type of the connection being dragged.
   * @return Whether there is a home for the orphan or not.
   */
  orphanCanConnectAtEnd(
    topBlock: BlockSvg, orphanBlock: BlockSvg, localType: number): boolean {
    const orphanConnection = localType === ConnectionType.OUTPUT_VALUE ?
      orphanBlock.outputConnection :
      orphanBlock.previousConnection;
    return !!Connection.getConnectionForOrphanedConnection(
      topBlock as Block, orphanConnection as Connection);
  }

  /**
   * Chooses a connection preview method based on the available connection, the
   * current dragged connection, and the block being dragged.
   * @param closest The available connection.
   * @param local The connection currently being dragged.
   * @param topBlock The block currently being dragged.
   * @return The preview type to display.
   */
  getConnectionPreviewMethod(
    closest: RenderedConnection, local: RenderedConnection,
    topBlock: BlockSvg): PreviewType {
    if (local.type === ConnectionType.OUTPUT_VALUE ||
      local.type === ConnectionType.PREVIOUS_STATEMENT) {
      if (!closest.isConnected() ||
        this.orphanCanConnectAtEnd(
          topBlock, closest.targetBlock() as BlockSvg, local.type)) {
        return InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER;
      }
      return InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE;
    }

    return InsertionMarkerManager.PREVIEW_TYPE.INSERTION_MARKER;
  }

  /**
   * Render the block.
   * @param block The block to render.
   */
  render(block: BlockSvg) {
    if (debug.isDebuggerEnabled() && !block.renderingDebugger) {
      block.renderingDebugger = this.makeDebugger_();
    }
    const info = this.makeRenderInfo_(block);
    info.measure();
    this.makeDrawer_(block, info).draw();
  }
}
