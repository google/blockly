/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods for SVG math.
 */

/**
 * Utility methods realted to figuring out positions of SVG elements.
 * @namespace Blockly.utils.svgMath
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils.svgMath');

import type {WorkspaceSvg} from '../workspace_svg.js';

import {Coordinate} from './coordinate.js';
import * as deprecation from './deprecation.js';
import {Rect} from './rect.js';
import {Size} from './size.js';
import * as style from './style.js';


/**
 * Static regex to pull the x,y values out of an SVG translate() directive.
 * Note that Firefox and IE (9,10) return 'translate(12)' instead of
 * 'translate(12, 0)'.
 * Note that IE (9,10) returns 'translate(16 8)' instead of 'translate(16, 8)'.
 * Note that IE has been reported to return scientific notation (0.123456e-42).
 */
const XY_REGEX: RegExp = /translate\(\s*([-+\d.e]+)([ ,]\s*([-+\d.e]+)\s*)?/;

/**
 * Static regex to pull the x,y values out of a translate() or translate3d()
 * style property.
 * Accounts for same exceptions as XY_REGEX.
 */
const XY_STYLE_REGEX: RegExp =
    /transform:\s*translate(?:3d)?\(\s*([-+\d.e]+)\s*px([ ,]\s*([-+\d.e]+)\s*px)?/;

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param element SVG element to find the coordinates of.
 * @return Object with .x and .y properties.
 * @alias Blockly.utils.svgMath.getRelativeXY
 */
export function getRelativeXY(element: Element): Coordinate {
  const xy = new Coordinate(0, 0);
  // First, check for x and y attributes.
  // Checking for the existence of x/y properties is faster than getAttribute.
  // However, x/y contains an SVGAnimatedLength object, so rely on getAttribute
  // to get the number.
  const x = (element as any).x && element.getAttribute('x');
  const y = (element as any).y && element.getAttribute('y');
  if (x) {
    xy.x = parseInt(x, 10);
  }
  if (y) {
    xy.y = parseInt(y, 10);
  }
  // Second, check for transform="translate(...)" attribute.
  const transform = element.getAttribute('transform');
  const r = transform && transform.match(XY_REGEX);
  if (r) {
    xy.x += Number(r[1]);
    if (r[3]) {
      xy.y += Number(r[3]);
    }
  }

  // Then check for style = transform: translate(...) or translate3d(...)
  const style = element.getAttribute('style');
  if (style && style.indexOf('translate') > -1) {
    const styleComponents = style.match(XY_STYLE_REGEX);
    if (styleComponents) {
      xy.x += Number(styleComponents[1]);
      if (styleComponents[3]) {
        xy.y += Number(styleComponents[3]);
      }
    }
  }
  return xy;
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div Blockly was injected into.
 * @param element SVG element to find the coordinates of. If this is not a child
 *     of the div Blockly was injected into, the behaviour is undefined.
 * @return Object with .x and .y properties.
 * @alias Blockly.utils.svgMath.getInjectionDivXY
 */
export function getInjectionDivXY(element: Element): Coordinate {
  let x = 0;
  let y = 0;
  while (element) {
    const xy = getRelativeXY(element);
    x = x + xy.x;
    y = y + xy.y;
    const classes = element.getAttribute('class') || '';
    if ((' ' + classes + ' ').indexOf(' injectionDiv ') !== -1) {
      break;
    }
    element = element.parentNode as Element;
  }
  return new Coordinate(x, y);
}

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return True if 3D transforms are supported.
 * @alias Blockly.utils.svgMath.is3dSupported
 */
export function is3dSupported(): boolean {
  // AnyDuringMigration because:  Property 'cached_' does not exist on type '()
  // => boolean'.
  if ((is3dSupported as AnyDuringMigration).cached_ !== undefined) {
    // AnyDuringMigration because:  Property 'cached_' does not exist on type
    // '() => boolean'.
    return (is3dSupported as AnyDuringMigration).cached_;
  }
  // CC-BY-SA Lorenzo Polidori
  // stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
  if (!globalThis['getComputedStyle']) {
    return false;
  }

  const el = document.createElement('p');
  let has3d = 'none';
  const transforms = {
    'webkitTransform': '-webkit-transform',
    'OTransform': '-o-transform',
    'msTransform': '-ms-transform',
    'MozTransform': '-moz-transform',
    'transform': 'transform',
  };

  // Add it to the body to get the computed style.
  document.body.insertBefore(el, null);

  for (const t in transforms) {
    if ((el.style as AnyDuringMigration)[t] !== undefined) {
      (el.style as AnyDuringMigration)[t] = 'translate3d(1px,1px,1px)';
      const computedStyle = globalThis['getComputedStyle'](el);
      if (!computedStyle) {
        // getComputedStyle in Firefox returns null when Blockly is loaded
        // inside an iframe with display: none.  Returning false and not
        // caching is3dSupported means we try again later.  This is most likely
        // when users are interacting with blocks which should mean Blockly is
        // visible again.
        // See https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        document.body.removeChild(el);
        return false;
      }
      has3d =
          computedStyle.getPropertyValue((transforms as AnyDuringMigration)[t]);
    }
  }
  document.body.removeChild(el);
  // AnyDuringMigration because:  Property 'cached_' does not exist on type '()
  // => boolean'.
  (is3dSupported as AnyDuringMigration).cached_ = has3d !== 'none';
  // AnyDuringMigration because:  Property 'cached_' does not exist on type '()
  // => boolean'.
  return (is3dSupported as AnyDuringMigration).cached_;
}

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return An object containing window width, height, and scroll position in
 *     window coordinates.
 * @alias Blockly.utils.svgMath.getViewportBBox
 * @internal
 */
export function getViewportBBox(): Rect {
  // Pixels, in window coordinates.
  const scrollOffset = style.getViewportPageOffset();
  return new Rect(
      scrollOffset.y, document.documentElement.clientHeight + scrollOffset.y,
      scrollOffset.x, document.documentElement.clientWidth + scrollOffset.x);
}

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return Object with values 'x' and 'y'.
 * @alias Blockly.utils.svgMath.getDocumentScroll
 */
export function getDocumentScroll(): Coordinate {
  const el = document.documentElement;
  const win = window;
  return new Coordinate(
      win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop);
}

/**
 * Converts screen coordinates to workspace coordinates.
 * @param ws The workspace to find the coordinates on.
 * @param screenCoordinates The screen coordinates to be converted to workspace
 *     coordinates
 * @return The workspace coordinates.
 * @alias Blockly.utils.svgMath.screenToWsCoordinates
 */
export function screenToWsCoordinates(
    ws: WorkspaceSvg, screenCoordinates: Coordinate): Coordinate {
  const screenX = screenCoordinates.x;
  const screenY = screenCoordinates.y;

  const injectionDiv = ws.getInjectionDiv();
  // Bounding rect coordinates are in client coordinates, meaning that they
  // are in pixels relative to the upper left corner of the visible browser
  // window.  These coordinates change when you scroll the browser window.
  const boundingRect = injectionDiv.getBoundingClientRect();

  // The client coordinates offset by the injection div's upper left corner.
  const clientOffsetPixels =
      new Coordinate(screenX - boundingRect.left, screenY - boundingRect.top);

  // The offset in pixels between the main workspace's origin and the upper
  // left corner of the injection div.
  const mainOffsetPixels = ws.getOriginOffsetInPixels();

  // The position of the new comment in pixels relative to the origin of the
  // main workspace.
  const finalOffsetPixels =
      Coordinate.difference(clientOffsetPixels, mainOffsetPixels);
  // The position in main workspace coordinates.
  const finalOffsetMainWs = finalOffsetPixels.scale(1 / ws.scale);
  return finalOffsetMainWs;
}

/**
 * Returns the dimensions of the specified SVG image.
 * @param svg SVG image.
 * @return Contains width and height properties.
 * @deprecated Use workspace.getCachedParentSvgSize. (2021 March 5)
 * @alias Blockly.utils.svgMath.svgSize
 */
export function svgSize(svg: SVGElement): Size {
  // When removing this function, remove svg.cachedWidth_ and svg.cachedHeight_
  // from setCachedParentSvgSize.
  // The deprecated name is `Blockly.svgSize` because this function used to be
  // declared in Blockly.js.
  deprecation.warn(
      'Blockly.svgSize', 'March 2021', 'March 2022',
      'workspace.getCachedParentSvgSize');
  svg = svg as AnyDuringMigration;
  return new Size(
      Number(svg.getAttribute('data-cached-width')),
      Number(svg.getAttribute('data-cached-height')));
}

export const TEST_ONLY = {
  XY_REGEX,
  XY_STYLE_REGEX,
};
