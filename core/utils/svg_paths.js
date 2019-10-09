/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Methods for creating parts of SVG path strings.  See
 * developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * @name Blockly.utils.svgPaths
 * @namespace
 */
goog.provide('Blockly.utils.svgPaths');


/**
 * Create a string representing the given x, y pair.  It does not matter whether
 * the coordinate is relative or absolute.  The result has leading
 * and trailing spaces, and separates the x and y coordinates with a comma but
 * no space.
 * @param {number} x The x coordinate.
 * @param {number} y The y coordinate.
 * @return {string} A string of the format ' x,y '
 * @public
 */
Blockly.utils.svgPaths.point = function(x, y) {
  return ' ' + x + ',' + y + ' ';
};

/**
 * Draw a curbic or quadratic curve.  See
 * developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Cubic_B%C3%A9zier_Curve
 * These coordinates are unitless and hence in the user coordinate system.
 * @param {string} command The command to use.
 *     Should be one of: c, C, s, S, q, Q.
 * @param {!Array.<string>} points  An array containing all of the points to pass to the
 *     curve command, in order.  The points are represented as strings of the
 *     format ' x, y '.
 * @return {string} A string defining one or more Bezier curves.  See the MDN
 *     documentation for exact format.
 * @public
 */
Blockly.utils.svgPaths.curve = function(command, points) {
  return ' ' + command + points.join('');
};

/**
 * Move the cursor to the given position without drawing a line.
 * The coordinates are absolute.
 * These coordinates are unitless and hence in the user coordinate system.
 * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
 * @param {number} x The absolute x coordinate.
 * @param {number} y The absolute y coordinate.
 * @return {string} A string of the format ' M x,y '
 * @public
 */
Blockly.utils.svgPaths.moveTo = function(x, y) {
  return ' M ' + x + ',' + y + ' ';
};

/**
 * Move the cursor to the given position without drawing a line.
 * Coordinates are relative.
 * These coordinates are unitless and hence in the user coordinate system.
 * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
 * @param {number} dx The relative x coordinate.
 * @param {number} dy The relative y coordinate.
 * @return {string} A string of the format ' m dx,dy '
 * @public
 */
Blockly.utils.svgPaths.moveBy = function(dx, dy) {
  return ' m ' + dx + ',' + dy + ' ';
};

/**
 * Draw a line from the current point to the end point, which is the current
 * point shifted by dx along the x-axis and dy along the y-axis.
 * These coordinates are unitless and hence in the user coordinate system.
 * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
 * @param {number} dx The relative x coordinate.
 * @param {number} dy The relative y coordinate.
 * @return {string} A string of the format ' l dx,dy '
 * @public
 */
Blockly.utils.svgPaths.lineTo = function(dx, dy) {
  return ' l ' + dx + ',' + dy + ' ';
};

/**
 * Draw multiple lines connecting all of the given points in order.  This is
 * equivalent to a series of 'l' commands.
 * These coordinates are unitless and hence in the user coordinate system.
 * See developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#Line_commands
 * @param {!Array.<string>} points An array containing all of the points to
 *     draw lines to, in order.  The points are represented as strings of the
 *     format ' dx,dy '.
 * @return {string} A string of the format ' l (dx,dy)+ '
 * @public
 */
Blockly.utils.svgPaths.line = function(points) {
  return ' l' + points.join('');
};

/**
 * Draw a horizontal or vertical line.
 * The first argument specifies the direction and whether the given position is
 * relative or absolute.
 * These coordinates are unitless and hence in the user coordinate system.
 * See developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#LineTo_path_commands
 * @param {string} command The command to prepend to the coordinate.  This
 *     should be one of: V, v, H, h.
 * @param {number} val The coordinate to pass to the command.  It may be
 *     absolute or relative.
 * @return {string} A string of the format ' command val '
 * @public
 */
Blockly.utils.svgPaths.lineOnAxis = function(command, val) {
  return ' ' + command + ' ' + val + ' ';
};

/**
 * Draw an elliptical arc curve.
 * These coordinates are unitless and hence in the user coordinate system.
 * See developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d#Elliptical_Arc_Curve
 * @param {string} command The command string.  Either 'a' or 'A'.
 * @param {string} flags The flag string.  See the MDN documentation for a
 *     description and examples.
 * @param {number} radius The radius of the arc to draw.
 * @param {string} point The point to move the cursor to after drawing the arc,
 *     specified either in absolute or relative coordinates depending on the
 *     command.
 * @return {string} A string of the format 'command radius radius flags point'
 * @public
 */
Blockly.utils.svgPaths.arc = function(command, flags, radius, point) {
  return command + ' ' + radius + ' ' + radius + ' ' + flags + point;
};
