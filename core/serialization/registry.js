/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Contains functions registering serializers (eg blocks,
 *     variables, plugins, etc).
 */
'use strict';

goog.module('Blockly.serialization.registry');
goog.module.declareLegacyNamespace();


// eslint-disable-next-line no-unused-vars
const {ISerializer} = goog.requireType('Blockly.serialization.ISerializer');
const registry = goog.require('Blockly.registry');


/**
 * Registers the given serializer so that it can be used for serialization and
 * deserialization.
 * @param {string} name The name of the serializer to register.
 * @param {ISerializer} serializer The serializer to register.
 */
const register = function(name, serializer) {
  registry.register(registry.Type.SERIALIZER, name, serializer);
};
exports.register = register;

/**
 * Unregisters the serializer associated with the given name.
 * @param {string} name The name of the serializer to unregister.
 */
const unregister = function(name) {
  registry.unregister(registry.Type.SERIALIZER, name);
};
exports.unregister = unregister;
