/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Geras renderer.
 *
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.geras.Renderer');

import type {BlockSvg} from '../../block_svg.js';
import type {BlockStyle, Theme} from '../../theme.js';
import * as blockRendering from '../common/block_rendering.js';
import type {RenderInfo as BaseRenderInfo} from '../common/info.js';
import {Renderer as BaseRenderer} from '../common/renderer.js';

import {ConstantProvider} from './constants.js';
import {Drawer} from './drawer.js';
import {HighlightConstantProvider} from './highlight_constants.js';
import {RenderInfo} from './info.js';
import {PathObject} from './path_object.js';


/**
 * The geras renderer.
*/
export class Renderer extends BaseRenderer {
  /** The renderer's highlight constant provider. */
  private highlightConstants_: HighlightConstantProvider|null = null;

  /**
   * @param name The renderer name.
   * @internal
   */
  constructor(name: string) {
    super(name);
  }

  /**
   * Initialize the renderer.  Geras has a highlight provider in addition to
   * the normal constant provider.
   *
   * @internal
   */
  override init(
      theme: Theme, opt_rendererOverrides?: {[rendererConstant: string]: any}) {
    super.init(theme, opt_rendererOverrides);
    this.highlightConstants_ = this.makeHighlightConstants_();
    this.highlightConstants_.init();
  }

  override refreshDom(svg: SVGElement, theme: Theme) {
    super.refreshDom(svg, theme);
    this.getHighlightConstants().init();
  }

  override makeConstants_() {
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
  protected override makeDrawer_(block: BlockSvg, info: BaseRenderInfo):
      Drawer {
    return new Drawer(block, (info as RenderInfo));
  }

  /**
   * Create a new instance of a renderer path object.
   *
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @returns The renderer path object.
   * @internal
   */
  override makePathObject(root: SVGElement, style: BlockStyle): PathObject {
    return new PathObject(
        root, style, (this.getConstants() as ConstantProvider));
  }

  /**
   * Create a new instance of the renderer's highlight constant provider.
   *
   * @returns The highlight constant provider.
   */
  protected makeHighlightConstants_(): HighlightConstantProvider {
    return new HighlightConstantProvider((this.getConstants()));
  }

  /**
   * Get the renderer's highlight constant provider.  We assume that when this
   * is called, the renderer has already been initialized.
   *
   * @returns The highlight constant provider.
   * @internal
   */
  getHighlightConstants(): HighlightConstantProvider {
    if (!this.highlightConstants_) {
      throw new Error(
          'Cannot access the highlight constants because init has not ' +
          'been called');
    }
    return this.highlightConstants_;
  }
}

blockRendering.register('geras', Renderer);
