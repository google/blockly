/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a component that is automatically hidden
 * when Blockly.hideChaff is called.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IAutoHideable');


goog.require('Blockly.IPlugin');


/**
 * Interface for a component that can be automatically hidden.
 * @extends {Blockly.IPlugin}
 * @interface
 */
Blockly.IAutoHideable = function() {};

/**
 * Hides the component. Called in Blockly.hideChaff.
 */
Blockly.IAutoHideable.prototype.autoHide;
