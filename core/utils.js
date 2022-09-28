/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility methods.
 */
'use strict';

/**
 * Utility methods.
 * @namespace Blockly.utils
 */
goog.module('Blockly.utils');

const aria = goog.require('Blockly.utils.aria');
const arrayUtils = goog.require('Blockly.utils.array');
const browserEvents = goog.require('Blockly.browserEvents');
const colourUtils = goog.require('Blockly.utils.colour');
const common = goog.require('Blockly.common');
const deprecation = goog.require('Blockly.utils.deprecation');
const dom = goog.require('Blockly.utils.dom');
const extensions = goog.require('Blockly.Extensions');
const global = goog.require('Blockly.utils.global');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const math = goog.require('Blockly.utils.math');
const object = goog.require('Blockly.utils.object');
const parsing = goog.require('Blockly.utils.parsing');
const stringUtils = goog.require('Blockly.utils.string');
const style = goog.require('Blockly.utils.style');
const svgMath = goog.require('Blockly.utils.svgMath');
const svgPaths = goog.require('Blockly.utils.svgPaths');
const toolbox = goog.require('Blockly.utils.toolbox');
const userAgent = goog.require('Blockly.utils.userAgent');
const xmlUtils = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {KeyCodes} = goog.require('Blockly.utils.KeyCodes');
const {Metrics} = goog.require('Blockly.utils.Metrics');
const {Rect} = goog.require('Blockly.utils.Rect');
const {Size} = goog.require('Blockly.utils.Size');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


exports.aria = aria;
exports.colour = colourUtils;
exports.Coordinate = Coordinate;
exports.deprecation = deprecation;
exports.dom = dom;
exports.global = global.globalThis;
exports.idGenerator = idGenerator;
exports.KeyCodes = KeyCodes;
exports.math = math;
exports.Metrics = Metrics;
exports.object = object;
exports.parsing = parsing;
exports.Rect = Rect;
exports.Size = Size;
exports.string = stringUtils;
exports.style = style;
exports.Svg = Svg;
exports.svgPaths = svgPaths;
exports.svgMath = svgMath;
exports.toolbox = toolbox;
exports.userAgent = userAgent;
exports.xml = xmlUtils;

/**
 * Halts the propagation of the event without doing anything else.
 * @param {!Event} e An event.
 * @deprecated
 * @alias Blockly.utils.noEvent
 */
const noEvent = function(e) {
  deprecation.warn('Blockly.utils.noEvent', 'September 2021', 'September 2022');
  // This event has been handled.  No need to bubble up to the document.
  e.preventDefault();
  e.stopPropagation();
};
exports.noEvent = noEvent;

/**
 * Returns true if this event is targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @deprecated Use Blockly.browserEvents.isTargetInput instead.
 * @alias Blockly.utils.isTargetInput
 */
const isTargetInput = function(e) {
  deprecation.warn(
      'Blockly.utils.isTargetInput', 'September 2021', 'September 2022',
      'Blockly.browserEvents.isTargetInput');
  return browserEvents.isTargetInput(e);
};
exports.isTargetInput = isTargetInput;

/**
 * Return the coordinates of the top-left corner of this element relative to
 * its parent.  Only for SVG elements and children (e.g. rect, g, path).
 * @param {!Element} element SVG element to find the coordinates of.
 * @return {!Coordinate} Object with .x and .y properties.
 * @deprecated
 * @alias Blockly.utils.getRelativeXY
 */
const getRelativeXY = function(element) {
  deprecation.warn(
      'Blockly.utils.getRelativeXY', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getRelativeXY');
  return svgMath.getRelativeXY(element);
};
exports.getRelativeXY = getRelativeXY;

/**
 * Return the coordinates of the top-left corner of this element relative to
 * the div Blockly was injected into.
 * @param {!Element} element SVG element to find the coordinates of. If this is
 *     not a child of the div Blockly was injected into, the behaviour is
 *     undefined.
 * @return {!Coordinate} Object with .x and .y properties.
 * @deprecated
 * @alias Blockly.utils.getInjectionDivXY_
 */
const getInjectionDivXY = function(element) {
  deprecation.warn(
      'Blockly.utils.getInjectionDivXY_', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getInjectionDivXY');
  return svgMath.getInjectionDivXY(element);
};
exports.getInjectionDivXY_ = getInjectionDivXY;

/**
 * Returns true this event is a right-click.
 * @param {!Event} e Mouse event.
 * @return {boolean} True if right-click.
 * @deprecated Use Blockly.browserEvents.isRightButton instead.
 * @alias Blockly.utils.isRightButton
 */
const isRightButton = function(e) {
  deprecation.warn(
      'Blockly.utils.isRightButton', 'September 2021', 'September 2022',
      'Blockly.browserEvents.isRightButton');
  return browserEvents.isRightButton(e);
};
exports.isRightButton = isRightButton;

/**
 * Returns the converted coordinates of the given mouse event.
 * The origin (0,0) is the top-left corner of the Blockly SVG.
 * @param {!Event} e Mouse event.
 * @param {!Element} svg SVG element.
 * @param {?SVGMatrix} matrix Inverted screen CTM to use.
 * @return {!SVGPoint} Object with .x and .y properties.
 * @deprecated Use Blockly.browserEvents.mouseToSvg instead;
 * @alias Blockly.utils.mouseToSvg
 */
const mouseToSvg = function(e, svg, matrix) {
  deprecation.warn(
      'Blockly.utils.mouseToSvg', 'September 2021', 'September 2022',
      'Blockly.browserEvents.mouseToSvg');
  return browserEvents.mouseToSvg(e, svg, matrix);
};
exports.mouseToSvg = mouseToSvg;

/**
 * Returns the scroll delta of a mouse event in pixel units.
 * @param {!Event} e Mouse event.
 * @return {{x: number, y: number}} Scroll delta object with .x and .y
 *    properties.
 * @deprecated Use Blockly.browserEvents.getScrollDeltaPixels instead.
 * @alias Blockly.utils.getScrollDeltaPixels
 */
const getScrollDeltaPixels = function(e) {
  deprecation.warn(
      'Blockly.utils.getScrollDeltaPixels', 'September 2021', 'September 2022',
      'Blockly.browserEvents.getScrollDeltaPixels');
  return browserEvents.getScrollDeltaPixels(e);
};
exports.getScrollDeltaPixels = getScrollDeltaPixels;

/**
 * Parse a string with any number of interpolation tokens (%1, %2, ...).
 * It will also replace string table references (e.g., %{bky_my_msg} and
 * %{BKY_MY_MSG} will both be replaced with the value in
 * Msg['MY_MSG']). Percentage sign characters '%' may be self-escaped
 * (e.g., '%%').
 * @param {string} message Text which might contain string table references and
 *     interpolation tokens.
 * @return {!Array<string|number>} Array of strings and numbers.
 * @deprecated
 * @alias Blockly.utils.tokenizeInterpolation
 */
const tokenizeInterpolation = function(message) {
  deprecation.warn(
      'Blockly.utils.tokenizeInterpolation', 'December 2021', 'December 2022',
      'Blockly.utils.parsing.tokenizeInterpolation');
  return parsing.tokenizeInterpolation(message);
};
exports.tokenizeInterpolation = tokenizeInterpolation;

/**
 * Replaces string table references in a message, if the message is a string.
 * For example, "%{bky_my_msg}" and "%{BKY_MY_MSG}" will both be replaced with
 * the value in Msg['MY_MSG'].
 * @param {string|?} message Message, which may be a string that contains
 *     string table references.
 * @return {string} String with message references replaced.
 * @deprecated
 * @alias Blockly.utils.replaceMessageReferences
 */
const replaceMessageReferences = function(message) {
  deprecation.warn(
      'Blockly.utils.replaceMessageReferences', 'December 2021',
      'December 2022', 'Blockly.utils.parsing.replaceMessageReferences');
  return parsing.replaceMessageReferences(message);
};
exports.replaceMessageReferences = replaceMessageReferences;

/**
 * Validates that any %{MSG_KEY} references in the message refer to keys of
 * the Msg string table.
 * @param {string} message Text which might contain string table references.
 * @return {boolean} True if all message references have matching values.
 *     Otherwise, false.
 * @deprecated
 * @alias Blockly.utils.checkMessageReferences
 */
const checkMessageReferences = function(message) {
  deprecation.warn(
      'Blockly.utils.checkMessageReferences', 'December 2021', 'December 2022',
      'Blockly.utils.parsing.checkMessageReferences');
  return parsing.checkMessageReferences(message);
};
exports.checkMessageReferences = checkMessageReferences;

/**
 * Generate a unique ID.
 * @return {string} A globally unique ID string.
 * @deprecated Use Blockly.utils.idGenerator.genUid instead.
 * @alias Blockly.utils.genUid
 */
const genUid = function() {
  deprecation.warn(
      'Blockly.utils.genUid', 'September 2021', 'September 2022',
      'Blockly.utils.idGenerator.genUid');
  return idGenerator.genUid();
};
exports.genUid = genUid;

/**
 * Check if 3D transforms are supported by adding an element
 * and attempting to set the property.
 * @return {boolean} True if 3D transforms are supported.
 * @deprecated
 * @alias Blockly.utils.is3dSupported
 */
const is3dSupported = function() {
  deprecation.warn(
      'Blockly.utils.is3dSupported', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.is3dSupported');
  return svgMath.is3dSupported();
};
exports.is3dSupported = is3dSupported;

/**
 * Get the position of the current viewport in window coordinates.  This takes
 * scroll into account.
 * @return {!Rect} An object containing window width, height, and
 *     scroll position in window coordinates.
 * @alias Blockly.utils.getViewportBBox
 * @deprecated
 * @package
 */
const getViewportBBox = function() {
  deprecation.warn(
      'Blockly.utils.getViewportBBox', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getViewportBBox');
  return svgMath.getViewportBBox();
};
exports.getViewportBBox = getViewportBBox;

/**
 * Removes the first occurrence of a particular value from an array.
 * @param {!Array} arr Array from which to remove value.
 * @param {*} value Value to remove.
 * @return {boolean} True if an element was removed.
 * @alias Blockly.utils.arrayRemove
 * @deprecated
 * @package
 */
const arrayRemove = function(arr, value) {
  deprecation.warn(
      'Blockly.utils.arrayRemove', 'December 2021', 'December 2022');
  return arrayUtils.removeElem(arr, value);
};
exports.arrayRemove = arrayRemove;

/**
 * Gets the document scroll distance as a coordinate object.
 * Copied from Closure's goog.dom.getDocumentScroll.
 * @return {!Coordinate} Object with values 'x' and 'y'.
 * @deprecated
 * @alias Blockly.utils.getDocumentScroll
 */
const getDocumentScroll = function() {
  deprecation.warn(
      'Blockly.utils.getDocumentScroll', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.getDocumentScroll');
  return svgMath.getDocumentScroll();
};
exports.getDocumentScroll = getDocumentScroll;

/**
 * Get a map of all the block's descendants mapping their type to the number of
 *    children with that type.
 * @param {!Block} block The block to map.
 * @param {boolean=} opt_stripFollowing Optionally ignore all following
 *    statements (blocks that are not inside a value or statement input
 *    of the block).
 * @return {!Object} Map of types to type counts for descendants of the bock.
 * @deprecated
 * @alias Blockly.utils.getBlockTypeCounts
 */
const getBlockTypeCounts = function(block, opt_stripFollowing) {
  deprecation.warn(
      'Blockly.utils.getBlockTypeCounts', 'December 2021', 'December 2022',
      'Blockly.common.getBlockTypeCounts');
  return common.getBlockTypeCounts(block, opt_stripFollowing);
};
exports.getBlockTypeCounts = getBlockTypeCounts;

/**
 * Converts screen coordinates to workspace coordinates.
 * @param {!WorkspaceSvg} ws The workspace to find the coordinates on.
 * @param {!Coordinate} screenCoordinates The screen coordinates to
 * be converted to workspace coordinates
 * @deprecated
 * @return {!Coordinate} The workspace coordinates.
 */
const screenToWsCoordinates = function(ws, screenCoordinates) {
  deprecation.warn(
      'Blockly.utils.screenToWsCoordinates', 'December 2021', 'December 2022',
      'Blockly.utils.svgMath.screenToWsCoordinates');
  return svgMath.screenToWsCoordinates(ws, screenCoordinates);
};
exports.screenToWsCoordinates = screenToWsCoordinates;

/**
 * Parse a block colour from a number or string, as provided in a block
 * definition.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 * @return {{hue: ?number, hex: string}} An object containing the colour as
 *     a #RRGGBB string, and the hue if the input was an HSV hue value.
 * @throws {Error} If the colour cannot be parsed.
 * @deprecated
 * @alias Blockly.utils.parseBlockColour
 */
const parseBlockColour = function(colour) {
  deprecation.warn(
      'Blockly.utils.parseBlockColour', 'December 2021', 'December 2022',
      'Blockly.utils.parsing.parseBlockColour');
  return parsing.parseBlockColour(colour);
};
exports.parseBlockColour = parseBlockColour;

/**
 * Calls a function after the page has loaded, possibly immediately.
 * @param {function()} fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 * @deprecated
 * @alias Blockly.utils.runAfterPageLoad
 */
const runAfterPageLoad = function(fn) {
  deprecation.warn(
      'Blockly.utils.runAfterPageLoad', 'December 2021', 'December 2022');
  extensions.runAfterPageLoad(fn);
};
exports.runAfterPageLoad = runAfterPageLoad;
