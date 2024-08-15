/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.zelos.Renderer

import type {BlockSvg} from '../../block_svg.js';
import {ConnectionType} from '../../connection_type.js';
import {InsertionMarkerManager} from '../../insertion_marker_manager.js';
import type {Marker} from '../../keyboard_nav/marker.js';
import type {RenderedConnection} from '../../rendered_connection.js';
import type {BlockStyle} from '../../theme.js';
import * as deprecation from '../../utils/deprecation.js';
import type {WorkspaceSvg} from '../../workspace_svg.js';
import * as blockRendering from '../common/block_rendering.js';
import type {RenderInfo as BaseRenderInfo} from '../common/info.js';
import {Renderer as BaseRenderer} from '../common/renderer.js';
import {ConstantProvider} from './constants.js';
import {Drawer} from './drawer.js';
import {RenderInfo} from './info.js';
import {MarkerSvg} from './marker_svg.js';
import {PathObject} from './path_object.js';

/**
 * The zelos renderer. This renderer emulates Scratch-style and MakeCode-style
 * rendering.
 *
 * Zelos is the ancient Greek spirit of rivalry and emulation.
 */
export class Renderer extends BaseRenderer {
  protected override constants_!: ConstantProvider;

  /**
   * @param name The renderer name.
   */
  constructor(name: string) {
    super(name);
  }

  /**
   * Create a new instance of the renderer's constant provider.
   *
   * @returns The constant provider.
   */
  protected override makeConstants_(): ConstantProvider {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   *
   * @param block The block to measure.
   * @returns The render info object.
   */
  protected override makeRenderInfo_(block: BlockSvg): RenderInfo {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   *
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @returns The drawer.
   */
  protected override makeDrawer_(
    block: BlockSvg,
    info: BaseRenderInfo,
  ): Drawer {
    return new Drawer(block, info as RenderInfo);
  }

  /**
   * Create a new instance of the renderer's cursor drawer.
   *
   * @param workspace The workspace the cursor belongs to.
   * @param marker The marker.
   * @returns The object in charge of drawing the marker.
   */
  override makeMarkerDrawer(
    workspace: WorkspaceSvg,
    marker: Marker,
  ): MarkerSvg {
    return new MarkerSvg(workspace, this.getConstants(), marker);
  }

  /**
   * Create a new instance of a renderer path object.
   *
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @returns The renderer path object.
   */
  override makePathObject(root: SVGElement, style: BlockStyle): PathObject {
    return new PathObject(root, style, this.getConstants() as ConstantProvider);
  }

  /**
   * Get the current renderer's constant provider.  We assume that when this is
   * called, the renderer has already been initialized.
   *
   * @returns The constant provider.
   */
  override getConstants(): ConstantProvider {
    return this.constants_;
  }

  /**
   * @deprecated v10 - This function is no longer respected. A custom
   *    IConnectionPreviewer may be able to fulfill the functionality.
   */
  override getConnectionPreviewMethod(
    closest: RenderedConnection,
    local: RenderedConnection,
    topBlock: BlockSvg,
  ) {
    deprecation.warn(
      'getConnectionPreviewMethod',
      'v10',
      'v12',
      'an IConnectionPreviewer, if it fulfills your use case.',
    );
    if (local.type === ConnectionType.OUTPUT_VALUE) {
      if (!closest.isConnected()) {
        return InsertionMarkerManager.PREVIEW_TYPE.INPUT_OUTLINE;
      }
      // TODO: Returning this is a total hack, because we don't want to show
      //   a replacement fade, we want to show an outline affect.
      //   Sadly zelos does not support showing an outline around filled
      //   inputs, so we have to pretend like the connected block is getting
      //   replaced.
      return InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE;
    }

    return super.getConnectionPreviewMethod(closest, local, topBlock);
  }
}

blockRendering.register('zelos', Renderer);
