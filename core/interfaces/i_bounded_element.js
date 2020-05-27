/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a bounded element.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IBoundedElement');

goog.requireType('Blockly.utils.Rect');


/**
 * A bounded element interface.
 * @interface
 */
Blockly.IBoundedElement = function() {};

/**
 * Returns the coordinates of a bounded element describing the dimensions of the
 * element.
 * Coordinate system: workspace coordinates.
 * @return {!Blockly.utils.Rect} Object with coordinates of the bounded element.
 */
Blockly.IBoundedElement.prototype.getBoundingRectangle;
