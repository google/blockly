/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an AST node location SVG.
 */

'use strict';

/**
 * The interface for an AST node location SVG.
 * @namespace Blockly.IASTNodeLocationSvg
 */
goog.declareModuleId('Blockly.IASTNodeLocationSvg');

/* eslint-disable-next-line no-unused-vars */
import {IASTNodeLocation} from './i_ast_node_location.js';


/**
 * An AST node location SVG interface.
 * @interface
 * @extends {IASTNodeLocation}
 * @alias Blockly.IASTNodeLocationSvg
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

export {IASTNodeLocationSvg};
