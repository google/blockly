/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Zelos renderer.
 */
'use strict';

/**
 * Zelos renderer.
 * @class
 */
goog.declareModuleId('Blockly.zelos.Renderer');

import * as blockRendering from '../common/block_rendering.js';
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
import {ConnectionType} from '../../connection_type.js';
import {ConstantProvider} from './constants.js';
import {Drawer} from './drawer.js';
import {InsertionMarkerManager} from '../../insertion_marker_manager.js';
import {MarkerSvg} from './marker_svg.js';
/* eslint-disable-next-line no-unused-vars */
const {Marker} = goog.requireType('Blockly.Marker');
import {PathObject} from './path_object.js';
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo: BaseRenderInfo} = goog.requireType('Blockly.blockRendering.RenderInfo');
import {RenderInfo} from './info.js';
import {Renderer as BaseRenderer} from '../common/renderer.js';
/* eslint-disable-next-line no-unused-vars */
const {Theme} = goog.requireType('Blockly.Theme');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * The zelos renderer.
 * @extends {BaseRenderer}
 * @alias Blockly.zelos.Renderer
 */
class Renderer extends BaseRenderer {
  /**
   * @param {string} name The renderer name.
   * @package
   */
  constructor(name) {
    super(name);
  }

  /**
   * Create a new instance of the renderer's constant provider.
   * @return {!ConstantProvider} The constant provider.
   * @protected
   * @override
   */
  makeConstants_() {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param {!BlockSvg} block The block to measure.
   * @return {!RenderInfo} The render info object.
   * @protected
   * @override
   */
  makeRenderInfo_(block) {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   * @param {!BlockSvg} block The block to render.
   * @param {!BaseRenderInfo} info An object containing all
   *   information needed to render this block.
   * @return {!Drawer} The drawer.
   * @protected
   * @override
   */
  makeDrawer_(block, info) {
    return new Drawer(
        block,
        /** @type {!RenderInfo} */ (info));
  }

  /**
   * Create a new instance of the renderer's cursor drawer.
   * @param {!WorkspaceSvg} workspace The workspace the cursor belongs to.
   * @param {!Marker} marker The marker.
   * @return {!MarkerSvg} The object in charge of drawing
   *     the marker.
   * @package
   * @override
   */
  makeMarkerDrawer(workspace, marker) {
    return new MarkerSvg(workspace, this.getConstants(), marker);
  }

  /**
   * Create a new instance of a renderer path object.
   * @param {!SVGElement} root The root SVG element.
   * @param {!Theme.BlockStyle} style The style object to use for
   *     colouring.
   * @return {!PathObject} The renderer path object.
   * @package
   * @override
   */
  makePathObject(root, style) {
    return new PathObject(
        root, style,
        /** @type {!ConstantProvider} */ (this.getConstants()));
  }

  /**
   * @override
   */
  shouldHighlightConnection(conn) {
    return conn.type !== ConnectionType.INPUT_VALUE &&
        conn.type !== ConnectionType.OUTPUT_VALUE;
  }

  /**
   * @override
   */
  getConnectionPreviewMethod(closest, local, topBlock) {
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

export {Renderer};
