/**
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility methods.
 * @namespace Blockly.utils
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
 * Halts the propagation of the event without doing anything else.
 * @param e An event.
 * @deprecated
 * @alias Blockly.utils.noEvent
 */
export function noEvent(e: Event) {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn('Blockly.utils.noEvent', 'September 2021', 'September 2022');
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
}

/**
 * Returns true if this event is targeting a text input widget?
 * @param e An event.
 * @return True if text input.
 * @deprecated Use Blockly.browserEvents.isTargetInput instead.
 * @alias Blockly.utils.isTargetInput
 */
export function isTargetInput(e: Event): boolean {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.isTargetInput', 'September 2021', 'September 2022',
          'Blockly.browserEvents.isTargetInput');
  return browserEvents.isTargetInput(e);
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param element SVG element to find the coordinates of.
 * @return Object with .x and .y properties.
 * @deprecated
 * @alias Blockly.utils.getRelativeXY
 */
export function getRelativeXY(element: Element): Coordinate {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.getRelativeXY', 'December 2021', 'December 2022',
          'Blockly.utils.svgMath.getRelativeXY');
  // AnyDuringMigration because:  Property 'getRelativeXY' does not exist on
  // type 'void'.
  return (svgMath as AnyDuringMigration).getRelativeXY(element);
}

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div Blockly was injected into.
 * @param element SVG element to find the coordinates of. If this is not a child
 *     of the div Blockly was injected into, the behaviour is undefined.
 * @return Object with .x and .y properties.
 * @deprecated
 * @alias Blockly.utils.getInjectionDivXY_
 */
function getInjectionDivXY(element: Element): Coordinate {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.getInjectionDivXY_', 'December 2021', 'December 2022',
          'Blockly.utils.svgMath.getInjectionDivXY');
  // AnyDuringMigration because:  Property 'getInjectionDivXY' does not exist on
  // type 'void'.
  return (svgMath as AnyDuringMigration).getInjectionDivXY(element);
}
export const getInjectionDivXY_ = getInjectionDivXY;

/**
 * Returns true this event is a right-click.
 * @param e Mouse event.
 * @return True if right-click.
 * @deprecated Use Blockly.browserEvents.isRightButton instead.
 * @alias Blockly.utils.isRightButton
 */
export function isRightButton(e: Event): boolean {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.isRightButton', 'September 2021', 'September 2022',
          'Blockly.browserEvents.isRightButton');
  return browserEvents.isRightButton(e as MouseEvent);
}

/**
 * Returns the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param e Mouse event.
 * @param svg SVG element.
 * @param matrix Inverted screen CTM to use.
 * @return Object with .x and .y properties.
 * @deprecated Use Blockly.browserEvents.mouseToSvg instead;
 * @alias Blockly.utils.mouseToSvg
 */
export function mouseToSvg(
    e: Event, svg: SVGSVGElement, matrix: SVGMatrix|null): SVGPoint {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.mouseToSvg', 'September 2021', 'September 2022',
          'Blockly.browserEvents.mouseToSvg');
  return browserEvents.mouseToSvg(e as MouseEvent, svg, matrix);
}

/**
 * Returns the scroll delta of a mouse event in pixel units.
 * @param e Mouse event.
 * @return Scroll delta object with .x and .y properties.
 * @deprecated Use Blockly.browserEvents.getScrollDeltaPixels instead.
 * @alias Blockly.utils.getScrollDeltaPixels
 */
export function getScrollDeltaPixels(e: WheelEvent): {x: number, y: number} {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.getScrollDeltaPixels', 'September 2021',
          'September 2022', 'Blockly.browserEvents.getScrollDeltaPixels');
  return browserEvents.getScrollDeltaPixels(e);
}

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%').
 * @param message Text which might contain string table references and
 *     interpolation tokens.
 * @return Array of strings and numbers.
 * @deprecated
 * @alias Blockly.utils.tokenizeInterpolation
 */
export function tokenizeInterpolation(message: string): Array<string|number> {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.tokenizeInterpolation', 'December 2021',
          'December 2022', 'Blockly.utils.parsing.tokenizeInterpolation');
  // AnyDuringMigration because:  Property 'tokenizeInterpolation' does not
  // exist on type 'void'.
  return (parsing as AnyDuringMigration).tokenizeInterpolation(message);
}

/**
 * Replaces string table references in a message, if the message is a string.
 * For example, "%{bky_my_msg}" and "%{BKY_MY_MSG}" will both be replaced with
 * the value in Msg['MY_MSG'].
 * @param message Message, which may be a string that contains string table
 *     references.
 * @return String with message references replaced.
 * @deprecated
 * @alias Blockly.utils.replaceMessageReferences
 */
export function replaceMessageReferences(message: string|
                                         AnyDuringMigration): string {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.replaceMessageReferences', 'December 2021',
          'December 2022', 'Blockly.utils.parsing.replaceMessageReferences');
  // AnyDuringMigration because:  Property 'replaceMessageReferences' does not
  // exist on type 'void'.
  return (parsing as AnyDuringMigration).replaceMessageReferences(message);
}

/**
 * Validates that any %{MSG_KEY} references in the message refer to keys of
 * the Msg string table.
 * @param message Text which might contain string table references.
 * @return True if all message references have matching values.
 *     Otherwise, false.
 * @deprecated
 * @alias Blockly.utils.checkMessageReferences
 */
export function checkMessageReferences(message: string): boolean {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.checkMessageReferences', 'December 2021',
          'December 2022', 'Blockly.utils.parsing.checkMessageReferences');
  // AnyDuringMigration because:  Property 'checkMessageReferences' does not
  // exist on type 'void'.
  return (parsing as AnyDuringMigration).checkMessageReferences(message);
}

/**
 * Generate a unique ID.
 * @return A globally unique ID string.
 * @deprecated Use Blockly.utils.idGenerator.genUid instead.
 * @alias Blockly.utils.genUid
 */
export function genUid(): string {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.genUid', 'September 2021', 'September 2022',
          'Blockly.utils.idGenerator.genUid');
  // AnyDuringMigration because:  Property 'genUid' does not exist on type
  // 'void'.
  return (idGenerator as AnyDuringMigration).genUid();
}

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return True if 3D transforms are supported.
 * @deprecated
 * @alias Blockly.utils.is3dSupported
 */
export function is3dSupported(): boolean {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.is3dSupported', 'December 2021', 'December 2022',
          'Blockly.utils.svgMath.is3dSupported');
  // AnyDuringMigration because:  Property 'is3dSupported' does not exist on
  // type 'void'.
  return (svgMath as AnyDuringMigration).is3dSupported();
}

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return An object containing window width, height, and scroll position in
 *     window coordinates.
 * @alias Blockly.utils.getViewportBBox
 * @deprecated
 * @internal
 */
export function getViewportBBox(): Rect {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.getViewportBBox', 'December 2021', 'December 2022',
          'Blockly.utils.svgMath.getViewportBBox');
  // AnyDuringMigration because:  Property 'getViewportBBox' does not exist on
  // type 'void'.
  return (svgMath as AnyDuringMigration).getViewportBBox();
}

/**
 * Removes the first occurrence of a particular value from an array.
 * @param arr Array from which to remove value.
 * @param value Value to remove.
 * @return True if an element was removed.
 * @alias Blockly.utils.arrayRemove
 * @deprecated
 * @internal
 */
export function arrayRemove(
    arr: AnyDuringMigration[], value: AnyDuringMigration): boolean {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn('Blockly.utils.arrayRemove', 'December 2021', 'December 2022');
  return arrayUtils.removeElem(arr, value);
}

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return Object with values 'x' and 'y'.
 * @deprecated
 * @alias Blockly.utils.getDocumentScroll
 */
export function getDocumentScroll(): Coordinate {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.getDocumentScroll', 'December 2021', 'December 2022',
          'Blockly.utils.svgMath.getDocumentScroll');
  // AnyDuringMigration because:  Property 'getDocumentScroll' does not exist on
  // type 'void'.
  return (svgMath as AnyDuringMigration).getDocumentScroll();
}

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 * @param block The block to map.
 * @param opt_stripFollowing Optionally ignore all following statements (blocks
 *     that are not inside a value or statement input of the block).
 * @return Map of types to type counts for descendants of the bock.
 * @deprecated
 * @alias Blockly.utils.getBlockTypeCounts
 */
export function getBlockTypeCounts(
    block: Block, opt_stripFollowing?: boolean): AnyDuringMigration {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.getBlockTypeCounts', 'December 2021', 'December 2022',
          'Blockly.common.getBlockTypeCounts');
  return common.getBlockTypeCounts(block, opt_stripFollowing);
}

/**
 * Converts screen coordinates to workspace coordinates.
 * @param ws The workspace to find the coordinates on.
 * @param screenCoordinates The screen coordinates to be converted to workspace
 *     coordinates
 * @deprecated
 * @return The workspace coordinates.
 */
export function screenToWsCoordinates(
    ws: WorkspaceSvg, screenCoordinates: Coordinate): Coordinate {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.screenToWsCoordinates', 'December 2021',
          'December 2022', 'Blockly.utils.svgMath.screenToWsCoordinates');
  // AnyDuringMigration because:  Property 'screenToWsCoordinates' does not
  // exist on type 'void'.
  return (svgMath as AnyDuringMigration)
      .screenToWsCoordinates(ws, screenCoordinates);
}

/**
 * Parse a block colour from a number or string, as provided in a block
 * definition.
 * @param colour HSV hue value (0 to 360), #RRGGBB string, or a message
 *     reference string pointing to one of those two values.
 * @return An object containing the colour as a #RRGGBB string, and the hue if
 *     the input was an HSV hue value.
 * @throws {Error} If the colour cannot be parsed.
 * @deprecated
 * @alias Blockly.utils.parseBlockColour
 */
export function parseBlockColour(colour: number|
                                 string): {hue: number|null, hex: string} {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn(
          'Blockly.utils.parseBlockColour', 'December 2021', 'December 2022',
          'Blockly.utils.parsing.parseBlockColour');
  // AnyDuringMigration because:  Property 'parseBlockColour' does not exist on
  // type 'void'.
  return (parsing as AnyDuringMigration).parseBlockColour(colour);
}

/**
 * Calls a function after the page has loaded, possibly immediately.
 * @param fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 * @deprecated
 * @alias Blockly.utils.runAfterPageLoad
 */
export function runAfterPageLoad(fn: () => AnyDuringMigration) {
  // AnyDuringMigration because:  Property 'warn' does not exist on type 'void'.
  (deprecation as AnyDuringMigration)
      .warn('Blockly.utils.runAfterPageLoad', 'December 2021', 'December 2022');
  extensions.runAfterPageLoad(fn);
}
