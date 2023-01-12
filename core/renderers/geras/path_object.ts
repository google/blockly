/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * An object that owns a block's rendering SVG elements.
 *
 * @class
 */
import * as goog from '../../../closure/goog/goog.js';
goog.declareModuleId('Blockly.geras.PathObject');

import type {BlockSvg} from '../../block_svg.js';
import type {BlockStyle} from '../../theme.js';
import * as colour from '../../utils/colour.js';
import * as dom from '../../utils/dom.js';
import {Svg} from '../../utils/svg.js';
import {PathObject as BasePathObject} from '../common/path_object.js';

import type {ConstantProvider} from './constants.js';


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
*/
export class PathObject extends BasePathObject {
  /** @internal */
  svgPathDark: SVGElement;
  /** @internal */
  svgPathLight: SVGElement;

  /**
   * The colour of the dark path on the block in '#RRGGBB' format.
   *
   * @internal
   */
  colourDark = '#000000';

  /**
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @param constants The renderer's constants.
   * @internal
   */
  constructor(
      root: SVGElement, style: BlockStyle,
      public override constants: ConstantProvider) {
    super(root, style, constants);

    /** The dark path of the block. */
    this.svgPathDark = dom.createSvgElement(
        Svg.PATH, {'class': 'blocklyPathDark', 'transform': 'translate(1,1)'});
    // SVG draw order is based on the order of elements (top most = back most)
    // So we need to insert the dark path before the base path to make sure it
    // gets drawn first.
    this.svgRoot.insertBefore(this.svgPathDark, this.svgPath);

    /** The light path of the block. */
    this.svgPathLight = dom.createSvgElement(
        Svg.PATH, {'class': 'blocklyPathLight'}, this.svgRoot);
  }

  override setPath(mainPath: string) {
    this.svgPath.setAttribute('d', mainPath);
    this.svgPathDark.setAttribute('d', mainPath);
  }

  /**
   * Set the highlight path generated by the renderer onto the SVG element.
   *
   * @param highlightPath The highlight path.
   * @internal
   */
  setHighlightPath(highlightPath: string) {
    this.svgPathLight.setAttribute('d', highlightPath);
  }

  override flipRTL() {
    // Mirror the block's path.
    this.svgPath.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }

  override applyColour(block: BlockSvg) {
    this.svgPathLight.style.display = '';
    this.svgPathDark.style.display = '';
    if (!this.style.colourTertiary) {
      throw new Error(
          'The renderer did not properly initialize the tertiary colour of ' +
          'the block style');
    }
    this.svgPathLight.setAttribute('stroke', this.style.colourTertiary);
    this.svgPathDark.setAttribute('fill', this.colourDark);

    super.applyColour(block);

    this.svgPath.setAttribute('stroke', 'none');
  }

  override setStyle(blockStyle: BlockStyle) {
    this.style = blockStyle;
    this.colourDark =
        colour.blend('#000', this.style.colourPrimary, 0.2) || this.colourDark;
  }

  override updateHighlighted(highlighted: boolean) {
    if (highlighted) {
      this.svgPath.setAttribute(
          'filter', 'url(#' + this.constants.embossFilterId + ')');
      this.svgPathLight.style.display = 'none';
    } else {
      this.svgPath.setAttribute('filter', 'none');
      this.svgPathLight.style.display = 'inline';
    }
  }

  override updateShadow_(shadow: boolean) {
    if (shadow) {
      this.svgPathLight.style.display = 'none';
      if (!this.style.colourSecondary) {
        throw new Error(
            'The renderer did not properly initialize the secondary colour ' +
            'of the block style block style');
      }
      this.svgPathDark.setAttribute('fill', this.style.colourSecondary);
      this.svgPath.setAttribute('stroke', 'none');
      this.svgPath.setAttribute('fill', this.style.colourSecondary);
    }
  }

  override updateDisabled_(disabled: boolean) {
    super.updateDisabled_(disabled);
    if (disabled) {
      this.svgPath.setAttribute('stroke', 'none');
    }
  }
}
