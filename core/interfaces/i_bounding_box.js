/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a bounding box.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IBoundingBox');

goog.requireType('Blockly.utils.Rect');


/**
 * A bounding box interface.
 * @interface
 */
Blockly.IBoundingBox = function() {};

/**
 * Returns the coordinates of a bounding box describing the dimensions of this
 * element.
 * Coordinate system: workspace coordinates.
 * @return {!Blockly.utils.Rect} Object with coordinates of the bounding box.
 */
Blockly.IBoundingBox.prototype.getBoundingRectangle;
