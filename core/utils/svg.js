/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for DOM manipulation.
 * These methods are not specific to Blockly, and could be factored out into
 * a JavaScript framework such as Closure.
 * @author fraser@google.com (Neil Fraser)
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
 * @package
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

/** @type {!Blockly.utils.Svg<!SVGAnimateElement>} */
Blockly.utils.Svg.ANIMATE =
    new Blockly.utils.Svg('animate');

/** @type {!Blockly.utils.Svg<!SVGCircleElement>} */
Blockly.utils.Svg.CIRCLE =
    new Blockly.utils.Svg('circle');

/** @type {!Blockly.utils.Svg<!SVGClipPathElement>} */
Blockly.utils.Svg.CLIPPATH =
    new Blockly.utils.Svg('clipPath');

/** @type {!Blockly.utils.Svg<!SVGDefsElement>} */
Blockly.utils.Svg.DEFS =
    new Blockly.utils.Svg('defs');

/** @type {!Blockly.utils.Svg<!SVGFECompositeElement>} */
Blockly.utils.Svg.FECOMPOSITE =
    new Blockly.utils.Svg('feComposite');

/** @type {!Blockly.utils.Svg<!SVGFEComponentTransferElement>} */
Blockly.utils.Svg.FECOMPONENTTRANSFER =
    new Blockly.utils.Svg('feComponentTransfer');

/** @type {!Blockly.utils.Svg<!SVGFEFloodElement>} */
Blockly.utils.Svg.FEFLOOD =
    new Blockly.utils.Svg('feFlood');

/** @type {!Blockly.utils.Svg<!SVGFEFuncAElement>} */
Blockly.utils.Svg.FEFUNCA =
    new Blockly.utils.Svg('feFuncA');

/** @type {!Blockly.utils.Svg<!SVGFEGaussianBlurElement>} */
Blockly.utils.Svg.FEGAUSSIANBLUR =
    new Blockly.utils.Svg('feGaussianBlur');

/** @type {!Blockly.utils.Svg<!SVGFEPointLightElement>} */
Blockly.utils.Svg.FEPOINTLIGHT =
    new Blockly.utils.Svg('fePointLight');

/** @type {!Blockly.utils.Svg<!SVGFESpecularLightingElement>} */
Blockly.utils.Svg.FESPECULARLIGHTING =
    new Blockly.utils.Svg('feSpecularLighting');

/** @type {!Blockly.utils.Svg<!SVGFilterElement>} */
Blockly.utils.Svg.FILTER =
    new Blockly.utils.Svg('filter');

/** @type {!Blockly.utils.Svg<!SVGForeignObjectElement>} */
Blockly.utils.Svg.FOREIGNOBJECT =
    new Blockly.utils.Svg('foreignObject');

/** @type {!Blockly.utils.Svg<!SVGGElement>} */
Blockly.utils.Svg.G =
    new Blockly.utils.Svg('g');

/** @type {!Blockly.utils.Svg<!SVGImageElement>} */
Blockly.utils.Svg.IMAGE =
    new Blockly.utils.Svg('image');

/** @type {!Blockly.utils.Svg<!SVGLineElement>} */
Blockly.utils.Svg.LINE =
    new Blockly.utils.Svg('line');

/** @type {!Blockly.utils.Svg<!SVGPathElement>} */
Blockly.utils.Svg.PATH =
    new Blockly.utils.Svg('path');

/** @type {!Blockly.utils.Svg<!SVGPatternElement>} */
Blockly.utils.Svg.PATTERN =
    new Blockly.utils.Svg('pattern');

/** @type {!Blockly.utils.Svg<!SVGPolygonElement>} */
Blockly.utils.Svg.POLYGON =
    new Blockly.utils.Svg('polygon');

/** @type {!Blockly.utils.Svg<!SVGRectElement>} */
Blockly.utils.Svg.RECT =
    new Blockly.utils.Svg('rect');

/** @type {!Blockly.utils.Svg<!SVGSVGElement>} */
Blockly.utils.Svg.SVG =
    new Blockly.utils.Svg('svg');

/** @type {!Blockly.utils.Svg<!SVGTextElement>} */
Blockly.utils.Svg.TEXT =
    new Blockly.utils.Svg('text');

/** @type {!Blockly.utils.Svg<!SVGTSpanElement>} */
Blockly.utils.Svg.TSPAN =
    new Blockly.utils.Svg('tspan');
