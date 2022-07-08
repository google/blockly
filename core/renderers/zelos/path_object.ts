/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that owns a block's rendering SVG elements.
 */

/**
 * An object that owns a block's rendering SVG elements.
 * @class
 */


/* eslint-disable-next-line no-unused-vars */


import {BlockSvg} from '../../block_svg';
import {Connection} from '../../connection';
import {BlockStyle} from '../../theme';
import * as dom from '../../utils/dom';
import {Svg} from '../../utils/svg';
import {PathObject as BasePathObject} from '../common/path_object';

import type {ConstantProvider} from './constants';


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @alias Blockly.zelos.PathObject
 */
export class PathObject extends BasePathObject {
  /** The selected path of the block. */
  private svgPathSelected_: SVGElement|null = null;
  private readonly outlines_: {[key: string]: SVGElement};

  /**
   * A set used to determine which outlines were used during a draw pass.  The
   * set is initialized with a reference to all the outlines in
   * `this.outlines_`. Every time we use an outline during the draw pass, the
   * reference is removed from this set.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type '{ [key:
  // string]: number; }'.
  private remainingOutlines_: {[key: string]: number} =
      null as AnyDuringMigration;

  /**
   * The type of block's output connection shape.  This is set when a block
   * with an output connection is drawn.
   */
  outputShapeType = null;

  /** @internal */
  public override constants: ConstantProvider;

  /**
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @param constants The renderer's constants.
   * @internal
   */
  constructor(
      root: SVGElement, style: BlockStyle, constants: ConstantProvider) {
    super(root, style, constants);

    this.constants = constants;

    /** The outline paths on the block. */
    this.outlines_ = Object.create(null);
  }

  override setPath(pathString: string) {
    super.setPath(pathString);
    if (this.svgPathSelected_) {
      this.svgPathSelected_.setAttribute('d', pathString);
    }
  }

  override applyColour(block: BlockSvg) {
    super.applyColour(block);
    // Set shadow stroke colour.
    const parent = block.getParent();
    if (block.isShadow() && parent) {
      this.svgPath.setAttribute('stroke', parent.style.colourTertiary);
    }

    // Apply colour to outlines.
    for (const key in this.outlines_) {
      this.outlines_[key].setAttribute('fill', this.style.colourTertiary);
    }
  }

  override flipRTL() {
    super.flipRTL();
    // Mirror each input outline path.
    for (const key in this.outlines_) {
      this.outlines_[key].setAttribute('transform', 'scale(-1 1)');
    }
  }

  override updateSelected(enable: boolean) {
    this.setClass_('blocklySelected', enable);
    if (enable) {
      if (!this.svgPathSelected_) {
        this.svgPathSelected_ = this.svgPath.cloneNode(true) as SVGElement;
        this.svgPathSelected_.setAttribute('fill', 'none');
        this.svgPathSelected_.setAttribute(
            'filter', 'url(#' + this.constants.selectedGlowFilterId + ')');
        this.svgRoot.appendChild(this.svgPathSelected_);
      }
    } else {
      if (this.svgPathSelected_) {
        this.svgRoot.removeChild(this.svgPathSelected_);
        this.svgPathSelected_ = null;
      }
    }
  }

  override updateReplacementFade(enable: boolean) {
    this.setClass_('blocklyReplaceable', enable);
    if (enable) {
      this.svgPath.setAttribute(
          'filter', 'url(#' + this.constants.replacementGlowFilterId + ')');
    } else {
      this.svgPath.removeAttribute('filter');
    }
  }

  override updateShapeForInputHighlight(conn: Connection, enable: boolean) {
    const name = conn.getParentInput()!.name;
    const outlinePath = this.getOutlinePath_(name);
    if (!outlinePath) {
      return;
    }
    if (enable) {
      outlinePath.setAttribute(
          'filter', 'url(#' + this.constants.replacementGlowFilterId + ')');
    } else {
      outlinePath.removeAttribute('filter');
    }
  }

  /**
   * Method that's called when the drawer is about to draw the block.
   * @internal
   */
  beginDrawing() {
    this.remainingOutlines_ = Object.create(null);
    for (const key in this.outlines_) {
      // The value set here isn't used anywhere, we are just using the
      // object as a Set data structure.
      this.remainingOutlines_[key] = 1;
    }
  }

  /**
   * Method that's called when the drawer is done drawing.
   * @internal
   */
  endDrawing() {
    // Go through all remaining outlines that were not used this draw pass, and
    // remove them.
    if (this.remainingOutlines_) {
      for (const key in this.remainingOutlines_) {
        this.removeOutlinePath_(key);
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type '{
    // [key: string]: number; }'.
    this.remainingOutlines_ = null as AnyDuringMigration;
  }

  /**
   * Set the path generated by the renderer for an outline path on the
   * respective outline path SVG element.
   * @param name The input name.
   * @param pathString The path.
   * @internal
   */
  setOutlinePath(name: string, pathString: string) {
    const outline = this.getOutlinePath_(name);
    outline.setAttribute('d', pathString);
    outline.setAttribute('fill', this.style.colourTertiary);
  }

  /**
   * Create's an outline path for the specified input.
   * @param name The input name.
   * @return The SVG outline path.
   */
  private getOutlinePath_(name: string): SVGElement {
    if (!this.outlines_[name]) {
      this.outlines_[name] = dom.createSvgElement(
          Svg.PATH, {
            'class': 'blocklyOutlinePath',  // IE doesn't like paths without the
            // data definition, set empty
            // default
            'd': '',
          },
          this.svgRoot);
    }
    if (this.remainingOutlines_) {
      delete this.remainingOutlines_[name];
    }
    return this.outlines_[name];
  }

  /**
   * Remove an outline path that is associated with the specified input.
   * @param name The input name.
   */
  private removeOutlinePath_(name: string) {
    this.outlines_[name].parentNode!.removeChild(this.outlines_[name]);
    delete this.outlines_[name];
  }
}
