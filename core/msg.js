/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Empty name space for the Message singleton.
 */
'use strict';

/**
 * Empty name space for the Message singleton.
 * @namespace Blockly.Msg
 */
goog.module('Blockly.Msg');
goog.module.declareLegacyNamespace();

const {globalThis} = goog.require('Blockly.utils.global');


/**
 * Exported so that if Blockly is compiled with ADVANCED_COMPILATION,
 * the Blockly.Msg object exists for message files included in script tags.
 */
if (!globalThis['Blockly']) {
  globalThis['Blockly'] = {};
}
if (!globalThis['Blockly']['Msg']) {
  globalThis['Blockly']['Msg'] = exports;
}
