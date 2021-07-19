/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is selectable.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.module('Blockly.ISelectable');
goog.module.declareLegacyNamespace();

goog.requireType('Blockly.IDeletable');
goog.requireType('Blockly.IMovable');


/**
 * The interface for an object that is selectable.
 * @extends {Blockly.IDeletable}
 * @extends {Blockly.IMovable}
 * @interface
 */
const ISelectable = function() {};

/**
 * @type {string}
 */
ISelectable.prototype.id;

/**
 * Select this.  Highlight it visually.
 * @return {void}
 */
ISelectable.prototype.select;

/**
 * Unselect this.  Unhighlight it visually.
 * @return {void}
 */
ISelectable.prototype.unselect;

exports = ISelectable;
