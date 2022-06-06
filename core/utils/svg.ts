/**
 * @fileoverview Defines the Svg class. Its constants enumerate
 * all SVG tag names used by Blockly.
 */

/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */


/**
 * Defines the Svg class. Its constants enumerate
 * all SVG tag names used by Blockly.
 * @class
 */


/**
 * A name with the type of the SVG element stored in the generic.
 * @alias Blockly.utils.Svg
 */
export class Svg<T> {
  static ANIMATE = new Svg < SVGAnimateElement > ('animate');
  static CIRCLE = new Svg < SVGCircleElement > ('circle');
  static CLIPPATH = new Svg < SVGClipPathElement > ('clipPath');
  static DEFS = new Svg < SVGDefsElement > ('defs');
  static FECOMPOSITE = new Svg < SVGFECompositeElement > ('feComposite');
  static FECOMPONENTTRANSFER =
    new Svg < SVGFEComponentTransferElement > ('feComponentTransfer');
  static FEFLOOD = new Svg < SVGFEFloodElement > ('feFlood');
  static FEFUNCA = new Svg < SVGFEFuncAElement > ('feFuncA');
  static FEGAUSSIANBLUR = new Svg < SVGFEGaussianBlurElement > ('feGaussianBlur');
  static FEPOINTLIGHT = new Svg < SVGFEPointLightElement > ('fePointLight');
  static FESPECULARLIGHTING =
    new Svg < SVGFESpecularLightingElement > ('feSpecularLighting');
  static FILTER = new Svg < SVGFilterElement > ('filter');
  static FOREIGNOBJECT = new Svg < SVGForeignObjectElement > ('foreignObject');
  static G = new Svg < SVGGElement > ('g');
  static IMAGE = new Svg < SVGImageElement > ('image');
  static LINE = new Svg < SVGLineElement > ('line');
  static PATH = new Svg < SVGPathElement > ('path');
  static PATTERN = new Svg < SVGPatternElement > ('pattern');
  static POLYGON = new Svg < SVGPolygonElement > ('polygon');
  static RECT = new Svg < SVGRectElement > ('rect');
  static SVG = new Svg < SVGSVGElement > ('svg');
  static TEXT = new Svg < SVGTextElement > ('text');
  static TSPAN = new Svg < SVGTSpanElement > ('tspan');

  /** @param tagName The SVG element tag name. */
  constructor(private readonly tagName: string) {}

  /**
   * Returns the SVG element tag name.
   * @return The name.
   */
  toString(): string {
    return this.tagName;
  }
}
