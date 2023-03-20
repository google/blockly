/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.utils');

import type {Block} from './block.js';
import * as browserEvents from './browser_events.js';
import * as common from './common.js';
import * as extensions from './extensions.js';
import * as aria from './utils/aria.js';
import * as arrayUtils from './utils/array.js';
import * as colour from './utils/colour.js';
import {Coordinate} from './utils/coordinate.js';
import * as deprecation from './utils/deprecation.js';
import * as dom from './utils/dom.js';
import * as idGenerator from './utils/idgenerator.js';
import {KeyCodes} from './utils/keycodes.js';
import * as math from './utils/math.js';
import type {Metrics} from './utils/metrics.js';
import * as object from './utils/object.js';
import * as parsing from './utils/parsing.js';
import {Rect} from './utils/rect.js';
import {Size} from './utils/size.js';
import * as stringUtils from './utils/string.js';
import * as style from './utils/style.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';
import * as svgPaths from './utils/svg_paths.js';
import * as toolbox from './utils/toolbox.js';
import * as userAgent from './utils/useragent.js';
import * as xml from './utils/xml.js';
import type {WorkspaceSvg} from './workspace_svg.js';


export {
  aria,
  arrayUtils as array,
  browserEvents,
  colour,
  Coordinate,
  deprecation,
  dom,
  extensions,
  idGenerator,
  KeyCodes,
  math,
  Metrics,
  object,
  parsing,
  Rect,
  Size,
  stringUtils as string,
  style,
  Svg,
  svgMath,
  svgPaths,
  toolbox,
  userAgent,
  xml,
};

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 *
 * @param element SVG element to find the coordinates of.
 * @returns Object with .x and .y properties.
 * @deprecated Use **Blockly.utils.svgMath.getRelativeXY** instead.
 */
export function getRelativeXY(element: Element): Coordinate {
  deprecation.warn(
      'Blockly.utils.getRelativeXY', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getRelativeXY');
  return svgMath.getRelativeXY(element);
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div Blockly was injected into.
 *
 * @param element SVG element to find the coordinates of. If this is not a child
 *     of the div Blockly was injected into, the behaviour is undefined.
 * @returns Object with .x and .y properties.
 * @deprecated Use **Blockly.utils.svgMath.getInjectionDivXY** instead.
 */
function getInjectionDivXY(element: Element): Coordinate {
  deprecation.warn(
      'Blockly.utils.getInjectionDivXY_', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getInjectionDivXY');
  return svgMath.getInjectionDivXY(element);
}
export const getInjectionDivXY_ = getInjectionDivXY;

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%').
 *
 * @param message Text which might contain string table references and
 *     interpolation tokens.
 * @returns Array of strings and numbers.
 * @deprecated Use **Blockly.utils.parsing.tokenizeInterpolation** instead.
 */
export function tokenizeInterpolation(message: string): Array<string|number> {
  deprecation.warn(
      'Blockly.utils.tokenizeInterpolation', 'December 2021', 'December 2022',
      'Blockly.utils.parsing.tokenizeInterpolation');
  return parsing.tokenizeInterpolation(message);
}

/**
 * Replaces string table references in a message, if the message is a string.
 * For example, "%{bky_my_msg}" and "%{BKY_MY_MSG}" will both be replaced with
 * the value in Msg['MY_MSG'].
 *
 * @param message Message, which may be a string that contains string table
 *     references.
 * @returns String with message references replaced.
 * @deprecated Use **Blockly.utils.parsing.replaceMessageReferences** instead.
 */
export function replaceMessageReferences(message: string|any): string {
  deprecation.warn(
      'Blockly.utils.replaceMessageReferences', 'December 2021',
      'December 2022', 'Blockly.utils.parsing.replaceMessageReferences');
  return parsing.replaceMessageReferences(message);
}

/**
 * Validates that any %{MSG_KEY} references in the message refer to keys of
 * the Msg string table.
 *
 * @param message Text which might contain string table references.
 * @returns True if all message references have matching values.
 *     Otherwise, false.
 * @deprecated Use **Blockly.utils.parsing.checkMessageReferences** instead.
 */
export function checkMessageReferences(message: string): boolean {
  deprecation.warn(
      'Blockly.utils.checkMessageReferences', 'December 2021', 'December 2022',
      'Blockly.utils.parsing.checkMessageReferences');
  return parsing.checkMessageReferences(message);
}

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 *
 * @returns True if 3D transforms are supported.
 * @deprecated Use **Blockly.utils.svgMath.is3dSupported** instead.
 */
export function is3dSupported(): boolean {
  deprecation.warn(
      'Blockly.utils.is3dSupported', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.is3dSupported');
  return svgMath.is3dSupported();
}

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 *
 * @returns An object containing window width, height, and scroll position in
 *     window coordinates.
 * @deprecated Use **Blockly.utils.svgMath.getViewportBBox** instead.
 * @internal
 */
export function getViewportBBox(): Rect {
  deprecation.warn(
      'Blockly.utils.getViewportBBox', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getViewportBBox');
  return svgMath.getViewportBBox();
}

/**
 * Removes the first occurrence of a particular value from an array.
 *
 * @param arr Array from which to remove value.
 * @param value Value to remove.
 * @returns True if an element was removed.
 * @deprecated Use **Blockly.array.removeElem** instead.
 * @internal
 */
export function arrayRemove<T>(arr: Array<T>, value: T): boolean {
  deprecation.warn(
      'Blockly.utils.arrayRemove', 'December 2021', 'December 2022',
      'Blockly.array.removeElem');
  return arrayUtils.removeElem(arr, value);
}

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 *
 * @returns Object with values 'x' and 'y'.
 * @deprecated Use **Blockly.utils.svgMath.getDocumentScroll** instead.
 */
export function getDocumentScroll(): Coordinate {
  deprecation.warn(
      'Blockly.utils.getDocumentScroll', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getDocumentScroll');
  return svgMath.getDocumentScroll();
}

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 *
 * @param block The block to map.
 * @param opt_stripFollowing Optionally ignore all following statements (blocks
 *     that are not inside a value or statement input of the block).
 * @returns Map of types to type counts for descendants of the bock.
 * @deprecated Use **Blockly.common.getBlockTypeCounts** instead.
 */
export function getBlockTypeCounts(
    block: Block, opt_stripFollowing?: boolean): {[key: string]: number} {
  deprecation.warn(
      'Blockly.utils.getBlockTypeCounts', 'December 2021', 'December 2022',
      'Blockly.common.getBlockTypeCounts');
  return common.getBlockTypeCounts(block, opt_stripFollowing);
}

/**
 * Converts screen coordinates to workspace coordinates.
 *
 * @param ws The workspace to find the coordinates on.
 * @param screenCoordinates The screen coordinates to be converted to workspace
 *     coordinates
 * @deprecated Use **Blockly.utils.svgMath.screenToWsCoordinates** instead.
 * @returns The workspace coordinates.
 */
export function screenToWsCoordinates(
    ws: WorkspaceSvg, screenCoordinates: Coordinate): Coordinate {
  deprecation.warn(
      'Blockly.utils.screenToWsCoordinates', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.screenToWsCoordinates');
  return svgMath.screenToWsCoordinates(ws, screenCoordinates);
}

/**
 * Parse a block colour from a number or string, as provided in a block
 * definition.
 *
 * @param colour HSV hue value (0 to 360), #RRGGBB string, or a message
 *     reference string pointing to one of those two values.
 * @returns An object containing the colour as a #RRGGBB string, and the hue if
 *     the input was an HSV hue value.
 * @throws {Error} If the colour cannot be parsed.
 * @deprecated Use **Blockly.utils.parsing.parseBlockColour** instead.
 */
export function parseBlockColour(colour: number|
                                 string): {hue: number|null, hex: string} {
  deprecation.warn(
      'Blockly.utils.parseBlockColour', 'December 2021', 'December 2022',
      'Blockly.utils.parsing.parseBlockColour');
  return parsing.parseBlockColour(colour);
}

/**
 * Calls a function after the page has loaded, possibly immediately.
 *
 * @param fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 * @deprecated No longer provided by Blockly.
 */
export function runAfterPageLoad(fn: () => void) {
  deprecation.warn(
      'Blockly.utils.runAfterPageLoad', 'December 2021', 'December 2022');
  extensions.runAfterPageLoad(fn);
}
