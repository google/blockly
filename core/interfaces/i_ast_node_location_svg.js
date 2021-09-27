/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an AST node location SVG.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.module('Blockly.IASTNodeLocationSvg');

/* eslint-disable-next-line no-unused-vars */
const IASTNodeLocation = goog.requireType('Blockly.IASTNodeLocation');


/**
 * An AST node location SVG interface.
 * @interface
 * @extends {IASTNodeLocation}
 */
const IASTNodeLocationSvg = function() {};

/**
 * Add the marker SVG to this node's SVG group.
 * @param {SVGElement} markerSvg The SVG root of the marker to be added to the
 *     SVG group.
 */
IASTNodeLocationSvg.prototype.setMarkerSvg;

/**
 * Add the cursor SVG to this node's SVG group.
 * @param {SVGElement} cursorSvg The SVG root of the cursor to be added to the
 *     SVG group.
 */
IASTNodeLocationSvg.prototype.setCursorSvg;

exports = IASTNodeLocationSvg;
