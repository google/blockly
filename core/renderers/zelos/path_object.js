/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that owns a block's rendering SVG elements.
 */

'use strict';

/**
 * An object that owns a block's rendering SVG elements.
 * @class
 */
goog.module('Blockly.zelos.PathObject');

const dom = goog.require('Blockly.utils.dom');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.zelos.ConstantProvider');
const {PathObject: BasePathObject} = goog.require('Blockly.blockRendering.PathObject');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {Theme} = goog.requireType('Blockly.Theme');


/**
 * An object that handles creating and setting each of the SVG elements
 * used by the renderer.
 * @alias Blockly.zelos.PathObject
 */
class PathObject extends BasePathObject {
  /**
   * @param {!SVGElement} root The root SVG element.
   * @param {!Theme.BlockStyle} style The style object to use for
   *     colouring.
   * @param {!ConstantProvider} constants The renderer's constants.
   * @package
   */
  constructor(root, style, constants) {
    super(root, style, constants);

    /**
     * The renderer's constant provider.
     * @type {!ConstantProvider}
     */
    this.constants = constants;

    /**
     * The selected path of the block.
     * @type {?SVGElement}
     * @private
     */
    this.svgPathSelected_ = null;

    /**
     * The outline paths on the block.
     * @type {!Object<string, !SVGElement>}
     * @private
     */
    this.outlines_ = Object.create(null);

    /**
     * A set used to determine which outlines were used during a draw pass.  The
     * set is initialized with a reference to all the outlines in
     * `this.outlines_`. Every time we use an outline during the draw pass, the
     * reference is removed from this set.
     * @type {Object<string, number>}
     * @private
     */
    this.remainingOutlines_ = null;

    /**
     * The type of block's output connection shape.  This is set when a block
     * with an output connection is drawn.
     * @package
     */
    this.outputShapeType = null;
  }

  /**
   * @override
   */
  setPath(pathString) {
    super.setPath(pathString);
    if (this.svgPathSelected_) {
      this.svgPathSelected_.setAttribute('d', pathString);
    }
  }

  /**
   * @override
   */
  applyColour(block) {
    super.applyColour(block);
    // Set shadow stroke colour.
    if (block.isShadow() && block.getParent()) {
      this.svgPath.setAttribute(
          'stroke', block.getParent().style.colourTertiary);
    }

    // Apply colour to outlines.
    for (const key in this.outlines_) {
      this.outlines_[key].setAttribute('fill', this.style.colourTertiary);
    }
  }

  /**
   * @override
   */
  flipRTL() {
    super.flipRTL();
    // Mirror each input outline path.
    for (const key in this.outlines_) {
      this.outlines_[key].setAttribute('transform', 'scale(-1 1)');
    }
  }

  /**
   * @override
   */
  updateSelected(enable) {
    this.setClass_('blocklySelected', enable);
    if (enable) {
      if (!this.svgPathSelected_) {
        this.svgPathSelected_ =
            /** @type {!SVGElement} */ (this.svgPath.cloneNode(true));
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

  /**
   * @override
   */
  updateReplacementFade(enable) {
    this.setClass_('blocklyReplaceable', enable);
    if (enable) {
      this.svgPath.setAttribute(
          'filter', 'url(#' + this.constants.replacementGlowFilterId + ')');
    } else {
      this.svgPath.removeAttribute('filter');
    }
  }

  /**
   * @override
   */
  updateShapeForInputHighlight(conn, enable) {
    const name = conn.getParentInput().name;
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
   * @package
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
   * @package
   */
  endDrawing() {
    // Go through all remaining outlines that were not used this draw pass, and
    // remove them.
    if (this.remainingOutlines_) {
      for (const key in this.remainingOutlines_) {
        this.removeOutlinePath_(key);
      }
    }
    this.remainingOutlines_ = null;
  }

  /**
   * Set the path generated by the renderer for an outline path on the
   * respective outline path SVG element.
   * @param {string} name The input name.
   * @param {string} pathString The path.
   * @package
   */
  setOutlinePath(name, pathString) {
    const outline = this.getOutlinePath_(name);
    outline.setAttribute('d', pathString);
    outline.setAttribute('fill', this.style.colourTertiary);
  }

  /**
   * Create's an outline path for the specified input.
   * @param {string} name The input name.
   * @return {!SVGElement} The SVG outline path.
   * @private
   */
  getOutlinePath_(name) {
    if (!this.outlines_[name]) {
      this.outlines_[name] = dom.createSvgElement(
          Svg.PATH, {
            'class': 'blocklyOutlinePath',
            // IE doesn't like paths without the data definition, set empty
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
   * @param {string} name The input name.
   * @private
   */
  removeOutlinePath_(name) {
    this.outlines_[name].parentNode.removeChild(this.outlines_[name]);
    delete this.outlines_[name];
  }
}

exports.PathObject = PathObject;
