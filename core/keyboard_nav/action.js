/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing an action.
 * Used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.Action');


/**
 * Class for a single action.
 * An action describes user intent. (ex go to next or go to previous)
 * @param {string} name The name of the action.
 * @param {string} desc The description of the action.
 * @constructor
 */
Blockly.Action = function(name, desc) {
  this.name = name;
  this.desc = desc;
};
