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

// Add a helper method to set the Blockly locale.
Blockly.setLocale = function (locale) {
  Object.keys(locale).forEach(function (k) {
    Blockly.Msg[k] = locale[k];
  });
};

// Override textToDomDocument and provide Node.js alternatives to DOMParser and
// XMLSerializer.
const globalThis = Blockly.utils.global;
if (typeof globalThis.document !== 'object') {
  const jsdom = require('jsdom/lib/jsdom/living');
  globalThis.DOMParser = jsdom.DOMParser;
  globalThis.XMLSerializer = jsdom.XMLSerializer;
  const xmlDocument = Blockly.utils.xml.textToDomDocument(
    `<xml xmlns="${Blockly.utils.xml.NAME_SPACE}"></xml>`);
  Blockly.utils.xml.setDocument(xmlDocument);
}
