/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Defines the Blockly.utils.Svg class. Its constants enumerate
 * all SVG tag names used by Blockly.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * @name Blockly.utils.Svg
 * @namespace
 */
goog.provide('Blockly.utils.Svg');


/**
 * A name with the type of the SVG element stored in the generic.
 * @param {string} tagName The SVG element tag name.
 * @constructor
 * @template T
 * @private
 */
Blockly.utils.Svg = function(tagName) {
  /**
   * @type {string}
   * @private
   */
  this.tagName_ = tagName;
};

/**
 * Returns the SVG element tag name.
 * @return {string} The name.
 * @override
 */
Blockly.utils.Svg.prototype.toString = function() {
  return this.tagName_;
};

/** @type {!Blockly.utils.Svg<!SVGAnimateElement>}
 * @package
 */
Blockly.utils.Svg.ANIMATE =
    new Blockly.utils.Svg('animate');

/** @type {!Blockly.utils.Svg<!SVGCircleElement>}
* @package
 */
Blockly.utils.Svg.CIRCLE =
    new Blockly.utils.Svg('circle');

/** @type {!Blockly.utils.Svg<!SVGClipPathElement>}
 * @package
 */
Blockly.utils.Svg.CLIPPATH =
    new Blockly.utils.Svg('clipPath');

/** @type {!Blockly.utils.Svg<!SVGDefsElement>}
 * @package
 */
Blockly.utils.Svg.DEFS =
    new Blockly.utils.Svg('defs');

/** @type {!Blockly.utils.Svg<!SVGFECompositeElement>}
 * @package
 */
Blockly.utils.Svg.FECOMPOSITE =
    new Blockly.utils.Svg('feComposite');

/** @type {!Blockly.utils.Svg<!SVGFEComponentTransferElement>}
 * @package
 */
Blockly.utils.Svg.FECOMPONENTTRANSFER =
    new Blockly.utils.Svg('feComponentTransfer');

/** @type {!Blockly.utils.Svg<!SVGFEFloodElement>}
 * @package
 */
Blockly.utils.Svg.FEFLOOD =
    new Blockly.utils.Svg('feFlood');

/** @type {!Blockly.utils.Svg<!SVGFEFuncAElement>}
 * @package
 */
Blockly.utils.Svg.FEFUNCA =
    new Blockly.utils.Svg('feFuncA');

/** @type {!Blockly.utils.Svg<!SVGFEGaussianBlurElement>}
 * @package
 */
Blockly.utils.Svg.FEGAUSSIANBLUR =
    new Blockly.utils.Svg('feGaussianBlur');

/** @type {!Blockly.utils.Svg<!SVGFEPointLightElement>}
 * @package
 */
Blockly.utils.Svg.FEPOINTLIGHT =
    new Blockly.utils.Svg('fePointLight');

/** @type {!Blockly.utils.Svg<!SVGFESpecularLightingElement>}
 * @package
 */
Blockly.utils.Svg.FESPECULARLIGHTING =
    new Blockly.utils.Svg('feSpecularLighting');

/** @type {!Blockly.utils.Svg<!SVGFilterElement>}
 * @package
 */
Blockly.utils.Svg.FILTER =
    new Blockly.utils.Svg('filter');

/** @type {!Blockly.utils.Svg<!SVGForeignObjectElement>}
 * @package
 */
Blockly.utils.Svg.FOREIGNOBJECT =
    new Blockly.utils.Svg('foreignObject');

/** @type {!Blockly.utils.Svg<!SVGGElement>}
 * @package
 */
Blockly.utils.Svg.G =
    new Blockly.utils.Svg('g');

/** @type {!Blockly.utils.Svg<!SVGImageElement>}
 * @package
 */
Blockly.utils.Svg.IMAGE =
    new Blockly.utils.Svg('image');

/** @type {!Blockly.utils.Svg<!SVGLineElement>}
 * @package
 */
Blockly.utils.Svg.LINE =
    new Blockly.utils.Svg('line');

/** @type {!Blockly.utils.Svg<!SVGPathElement>}
 * @package
 */
Blockly.utils.Svg.PATH =
    new Blockly.utils.Svg('path');

/** @type {!Blockly.utils.Svg<!SVGPatternElement>}
 * @package
 */
Blockly.utils.Svg.PATTERN =
    new Blockly.utils.Svg('pattern');

/** @type {!Blockly.utils.Svg<!SVGPolygonElement>}
 * @package
 */
Blockly.utils.Svg.POLYGON =
    new Blockly.utils.Svg('polygon');

/** @type {!Blockly.utils.Svg<!SVGRectElement>}
 * @package
 */
Blockly.utils.Svg.RECT =
    new Blockly.utils.Svg('rect');

/** @type {!Blockly.utils.Svg<!SVGSVGElement>}
 * @package
 */
Blockly.utils.Svg.SVG =
    new Blockly.utils.Svg('svg');

/** @type {!Blockly.utils.Svg<!SVGTextElement>}
 * @package
 */
Blockly.utils.Svg.TEXT =
    new Blockly.utils.Svg('text');

/** @type {!Blockly.utils.Svg<!SVGTSpanElement>}
 * @package
 */
Blockly.utils.Svg.TSPAN =
    new Blockly.utils.Svg('tspan');
