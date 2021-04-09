/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that can delete a block that is
 *   dropped on top of it.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IDeleteArea');

goog.requireType('Blockly.utils.Rect');


/**
 * Interface for a component that can delete a block that is dropped on top of it.
 * @interface
 */
Blockly.IDeleteArea = function() {};

/**
 * Return the deletion rectangle.
 * @return {Blockly.utils.Rect} Rectangle in which to delete.
 */
Blockly.IDeleteArea.prototype.getClientRect;
