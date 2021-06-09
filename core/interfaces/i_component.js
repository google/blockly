/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a workspace component that can be registered with
 * the ComponentManager.
 * @author kozbial@google.com (Monica Kozbial)
 */

'use strict';

goog.provide('Blockly.IComponent');


/**
 * The interface for a workspace component that can be registered with the
 * ComponentManager.
 * @interface
 */
Blockly.IComponent = function() {};

/**
 * The unique id for this component.
 * @type {string}
 */
Blockly.IComponent.id;
