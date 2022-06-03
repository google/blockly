/** @fileoverview An object that owns a block's rendering SVG elements. */


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
 * An object that owns a block's rendering SVG elements.
 * @class
 */
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import 'google3/third_party/javascript/blockly/core/theme';

import { BlockSvg } from 'google3/third_party/javascript/blockly/core/block_svg';
import { Connection } from 'google3/third_party/javascript/blockly/core/connection';
import { BlockStyle } from 'google3/third_party/javascript/blockly/core/theme';
import * as dom from 'google3/third_party/javascript/blockly/core/utils/dom';
import { Svg } from 'google3/third_party/javascript/blockly/core/utils/svg';

import { PathObject as BasePathObject } from '../common/path_object';

/* eslint-disable-next-line no-unused-vars */
import { ConstantProvider } from './constants';


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @alias Blockly.zelos.PathObject
 */
export class PathObject extends BasePathObject {
  /** The selected path of the block. */
  private svgPathSelected_: SVGElement | null = null;
  private readonly outlines_: { [key: string]: SVGElement };

  /**
   * A set used to determine which outlines were used during a draw pass.  The
   * set is initialized with a reference to all the outlines in
   * `this.outlines_`. Every time we use an outline during the draw pass, the
   * reference is removed from this set.
   */
  // AnyDuringMigration because:  Type 'null' is not assignable to type '{ [key:
  // string]: number; }'.
  private remainingOutlines_: { [key: string]: number } =
    null as AnyDuringMigration;

  /**
   * The type of block's output connection shape.  This is set when a block
   * with an output connection is drawn.
   */
  outputShapeType = null;

  /**
   * @param root The root SVG element.
   * @param style The style object to use for colouring.
   * @param constants The renderer's constants.
   */
  constructor(
    root: SVGElement, style: BlockStyle,
    public override constants: ConstantProvider) {
    super(root, style, constants);

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

  /** Method that's called when the drawer is about to draw the block. */
  beginDrawing() {
    this.remainingOutlines_ = Object.create(null);
    for (const key in this.outlines_) {
      // The value set here isn't used anywhere, we are just using the
      // object as a Set data structure.
      this.remainingOutlines_[key] = 1;
    }
  }

  /** Method that's called when the drawer is done drawing. */
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
