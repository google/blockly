/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The record type for an object containing functions for
 *     serializing part of the workspace.
 */

'use strict';

goog.module('Blockly.serialization.ISerializer');
goog.module.declareLegacyNamespace();

// eslint-disable-next-line no-unused-vars
const Workspace = goog.requireType('Blockly.Workspace');


/**
 * Serializes and deserializes a plugin.
 * @interface
 */
class ISerializer {
  constructor() {
    /**
     * A priority value used to determine the order of deserializing plugins.
     * More positive priorities are deserialized before less positive
     * priorities. Eg if you have priorities (0, -10, 10, 100) the order of
     * deserialiation will be (100, 10, 0, -10).
     * If two plugins have the same priority, they are deserialized in an
     * arbitrary order relative to each other.
     * @type {number}
     */
    this.priority;
  }

  /* eslint-disable no-unused-vars, valid-jsdoc */

  /**
   * Saves the state of the plugin.
   * @param {!Workspace} workspace The workspace the plugin to serialize is
   *     associated with.
   * @return {?} A JS object containing the plugin's state, or null if
   *     there is no state to record.
   */
  save(workspace) {}

  /* eslint-enable valid-jsdoc */

  /**
   * Loads the state of the plugin.
   * @param {?} state The state of the plugin to deserialize. This will always
   *     be non-null.
   * @param {!Workspace} workspace The workspace the plugin to deserialize is
   *     associated with.
   */
  load(state, workspace) {}

  /**
   * Clears the state of the plugin.
   * @param {!Workspace} workspace The workspace the plugin to clear the state
   *     of is associated with.
   */
  clear(workspace) {}

  /* eslint-enable no-unused-vars */
}

exports.ISerializer = ISerializer;
