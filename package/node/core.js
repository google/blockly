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
  Blockly.Msg = Blockly.Msg || {};
  Object.keys(locale).forEach(function (k) {
    Blockly.Msg[k] = locale[k];
  });
};

// Override textToDomDocument and provide Node.js alternatives to DOMParser and
// XMLSerializer.
if (typeof Blockly.utils.global.document !== 'object') {
  Blockly.utils.global.DOMParser = require("jsdom/lib/jsdom/living").DOMParser;
  Blockly.utils.global.XMLSerializer = require("jsdom/lib/jsdom/living").XMLSerializer;
  var doc = Blockly.utils.xml.textToDomDocument(
    '<xml xmlns="https://developers.google.com/blockly/xml"></xml>');
  Blockly.utils.xml.document = function() {
    return doc;
  };
}
