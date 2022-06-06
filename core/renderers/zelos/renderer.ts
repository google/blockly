/** @fileoverview Zelos renderer. */

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Zelos renderer.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../../theme';

/* eslint-disable-next-line no-unused-vars */
import { BlockSvg } from '../../block_svg';
import { Connection } from '../../connection';
import { ConnectionType } from '../../connection_type';
import { InsertionMarkerManager } from '../../insertion_marker_manager';
/* eslint-disable-next-line no-unused-vars */
import { Marker } from '../../keyboard_nav/marker';
import { RenderedConnection } from '../../rendered_connection';
import { BlockStyle } from '../../theme';
/* eslint-disable-next-line no-unused-vars */
import { WorkspaceSvg } from '../../workspace_svg';

import * as blockRendering from '../common/block_rendering';
/* eslint-disable-next-line no-unused-vars */
import { RenderInfo as BaseRenderInfo } from '../common/info';
import { Renderer as BaseRenderer } from '../common/renderer';

import { ConstantProvider } from './constants';
import { Drawer } from './drawer';
import { RenderInfo } from './info';
import { MarkerSvg } from './marker_svg';
import { PathObject } from './path_object';


/**
 * The zelos renderer.
 * @alias Blockly.zelos.Renderer
 */
export class Renderer extends BaseRenderer {
  protected override constants_!: ConstantProvider;

  /** @param name The renderer name. */
  constructor(name: string) {
    super(name);
  }

  /**
   * Create a new instance of the renderer's constant provider.
   * @return The constant provider.
   */
  protected override makeConstants_(): ConstantProvider {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param block The block to measure.
   * @return The render info object.
   */
  protected override makeRenderInfo_(block: BlockSvg): RenderInfo {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   * @param block The block to render.
   * @param info An object containing all information needed to render this
   *     block.
   * @return The drawer.
   */
  protected override makeDrawer_(block: BlockSvg, info: BaseRenderInfo):
    Drawer {
    return new Drawer(block, (info as RenderInfo));
  }

  /**
   * Create a new instance of the renderer's cursor drawer.
   * @param workspace The workspace the cursor belongs to.
   * @param marker The marker.
   * @return The object in charge of drawing the marker.
   */
  override makeMarkerDrawer(workspace: WorkspaceSvg, marker: Marker):
    MarkerSvg {
    return new MarkerSvg(workspace, this.getConstants(), marker);
  }

  /**
   * Create a new instance of a renderer path object.
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @return The renderer path object.
   */
  override makePathObject(root: SVGElement, style: BlockStyle): PathObject {
    return new PathObject(
      root, style, (this.getConstants() as ConstantProvider));
  }

  /**
  * Get the current renderer's constant provider.  We assume that when this is
  * called, the renderer has already been initialized.
  * @return The constant provider.
  */
  override getConstants(): ConstantProvider {
    return this.constants_;
  }

  override shouldHighlightConnection(conn: Connection) {
    return conn.type !== ConnectionType.INPUT_VALUE &&
      conn.type !== ConnectionType.OUTPUT_VALUE;
  }

  override getConnectionPreviewMethod(
    closest: RenderedConnection, local: RenderedConnection,
    topBlock: BlockSvg) {
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
