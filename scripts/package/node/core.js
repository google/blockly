/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blockly core module for Node. It includes blockly-node.js
 *               and adds a helper method for setting the locale.
 */

/* eslint-disable */
'use strict';


// Override textToDomDocument and provide Node.js alternatives to DOMParser and
// XMLSerializer.
if (typeof globalThis.document !== 'object') {
  const {JSDOM} = require('jsdom');
  const {window} = new JSDOM(`<!DOCTYPE html>`);
  Blockly.utils.xml.injectDependencies(window);
}
