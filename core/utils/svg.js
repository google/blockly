/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the Svg class. Its constants enumerate
 * all SVG tag names used by Blockly.
 */
'use strict';

/**
 * Defines the Svg class. Its constants enumerate
 * all SVG tag names used by Blockly.
 * @class
 */
goog.module('Blockly.utils.Svg');


/**
 * A name with the type of the SVG element stored in the generic.
 * @template T
 * @alias Blockly.utils.Svg
 */
class Svg {
  /**
   * @param {string} tagName The SVG element tag name.
   * @package
   */
  constructor(tagName) {
    /**
     * @type {string}
     * @private
     */
    this.tagName_ = tagName;
  }

  /**
   * Returns the SVG element tag name.
   * @return {string} The name.
   */
  toString() {
    return this.tagName_;
  }
}

/**
 * @type {!Svg<!SVGAnimateElement>}
 * @package
 */
Svg.ANIMATE = new Svg('animate');

/**
 * @type {!Svg<!SVGCircleElement>}
 * @package
 */
Svg.CIRCLE = new Svg('circle');

/**
 * @type {!Svg<!SVGClipPathElement>}
 * @package
 */
Svg.CLIPPATH = new Svg('clipPath');

/**
 * @type {!Svg<!SVGDefsElement>}
 * @package
 */
Svg.DEFS = new Svg('defs');

/**
 * @type {!Svg<!SVGFECompositeElement>}
 * @package
 */
Svg.FECOMPOSITE = new Svg('feComposite');

/**
 * @type {!Svg<!SVGFEComponentTransferElement>}
 * @package
 */
Svg.FECOMPONENTTRANSFER = new Svg('feComponentTransfer');

/**
 * @type {!Svg<!SVGFEFloodElement>}
 * @package
 */
Svg.FEFLOOD = new Svg('feFlood');

/**
 * @type {!Svg<!SVGFEFuncAElement>}
 * @package
 */
Svg.FEFUNCA = new Svg('feFuncA');

/**
 * @type {!Svg<!SVGFEGaussianBlurElement>}
 * @package
 */
Svg.FEGAUSSIANBLUR = new Svg('feGaussianBlur');

/**
 * @type {!Svg<!SVGFEPointLightElement>}
 * @package
 */
Svg.FEPOINTLIGHT = new Svg('fePointLight');

/**
 * @type {!Svg<!SVGFESpecularLightingElement>}
 * @package
 */
Svg.FESPECULARLIGHTING = new Svg('feSpecularLighting');

/**
 * @type {!Svg<!SVGFilterElement>}
 * @package
 */
Svg.FILTER = new Svg('filter');

/**
 * @type {!Svg<!SVGForeignObjectElement>}
 * @package
 */
Svg.FOREIGNOBJECT = new Svg('foreignObject');

/**
 * @type {!Svg<!SVGGElement>}
 * @package
 */
Svg.G = new Svg('g');

/**
 * @type {!Svg<!SVGImageElement>}
 * @package
 */
Svg.IMAGE = new Svg('image');

/**
 * @type {!Svg<!SVGLineElement>}
 * @package
 */
Svg.LINE = new Svg('line');

/**
 * @type {!Svg<!SVGPathElement>}
 * @package
 */
Svg.PATH = new Svg('path');

/**
 * @type {!Svg<!SVGPatternElement>}
 * @package
 */
Svg.PATTERN = new Svg('pattern');

/**
 * @type {!Svg<!SVGPolygonElement>}
 * @package
 */
Svg.POLYGON = new Svg('polygon');

/**
 * @type {!Svg<!SVGRectElement>}
 * @package
 */
Svg.RECT = new Svg('rect');

/**
 * @type {!Svg<!SVGSVGElement>}
 * @package
 */
Svg.SVG = new Svg('svg');

/**
 * @type {!Svg<!SVGTextElement>}
 * @package
 */
Svg.TEXT = new Svg('text');

/**
 * @type {!Svg<!SVGTSpanElement>}
 * @package
 */
Svg.TSPAN = new Svg('tspan');

exports.Svg = Svg;
