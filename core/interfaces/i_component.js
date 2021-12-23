/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for a workspace component that can be registered with
 * the ComponentManager.
 */

'use strict';

/**
 * Interface for a workspace component that can be registered with
 * the ComponentManager.
 * @namespace Blockly.IComponent
 */
goog.module('Blockly.IComponent');


/**
 * The interface for a workspace component that can be registered with the
 * ComponentManager.
 * @interface
 * @alias Blockly.IComponent
 */
const IComponent = function() {};

/**
 * The unique id for this component that is used to register with the
 * ComponentManager.
 * @type {string}
 */
IComponent.id;

exports.IComponent = IComponent;
