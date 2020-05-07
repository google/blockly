/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for the toolbox and flyout.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.utils.toolbox');


/**
 * A block definition.
 * @typedef {{
 *            contenttype:string,
 *            xmldef:string
 *          }}
 */
Blockly.utils.toolbox.BlockInfo;

/**
 * A separator definition.
 * @typedef {{
 *            contenttype:string,
 *            gap:?number
 *          }}
 */
Blockly.utils.toolbox.SeparatorInfo;

/**
 * A button definition.
 * @typedef {{
 *            contenttype:string,
 *            text:string,
 *            callbackkey:string
 *          }}
 */
Blockly.utils.toolbox.ButtonInfo;

/**
 * A label definition.
 * @typedef {{
 *            contenttype:string,
 *            text:string
 *          }}
 */
Blockly.utils.toolbox.LabelInfo;

/**
 * A toolbox item.
 * @typedef {Blockly.utils.toolbox.BlockInfo|
 *           Blockly.utils.toolbox.SeparatorInfo|
 *           Blockly.utils.toolbox.ButtonInfo|
 *           Blockly.utils.toolbox.LabelInfo}
 */
Blockly.utils.toolbox.ToolboxItem;

/**
 * A category definition.
 * @typedef {{
 *            contenttype:string,
 *            name:string,
 *            categorystyle:?string,
 *            colour:?string,
 *            contents:Array<Blockly.utils.toolbox.ToolboxItem>
 *          }}
 */
Blockly.utils.toolbox.CategoryInfo;

/**
 * Parse the provided toolbox definition into a consistent format.
 * @param {Array|Node|NodeList|null} toolboxDef The definition of the
 *    toolbox in one of its many forms.
 * @return {!Array<Blockly.utils.toolbox.ToolboxItem>} Array of JSON holding
 *    information on toolbox contents.
 * @package
 */
Blockly.utils.toolbox.parseToolbox = function(toolboxDef) {
  if (!toolboxDef) {
    return [];
  }
  // The array can be either an array of xml or an array of JSON.
  if (Array.isArray(toolboxDef)) {
    if (toolboxDef.length && !(toolboxDef[0].nodeType)) {
      return /** @type {!Array<Blockly.utils.toolbox.ToolboxItem>} */ (toolboxDef);
    }
  }

  return Blockly.utils.toolbox.toolboxXmlToJson_(toolboxDef);
};

/**
 * Convert the xml for a toolbox to JSON.
 * @param {!NodeList|!Node|!Array<Blockly.utils.toolbox.ToolboxItem>} toolboxDef The
 *     definition of the toolbox in one of its many forms.
 * @return {!Array<Blockly.utils.toolbox.ToolboxItem>} A list of objects in the
 *    toolbox.
 * @private
 */
Blockly.utils.toolbox.toolboxXmlToJson_ = function(toolboxDef) {
  var arr = [];
  // If it is a node it will have children.
  var childNodes = toolboxDef.children;
  if (!childNodes) {
    // Otherwise the toolboxDef is an array or collection.
    childNodes = toolboxDef;
  }
  for (var i = 0, child; (child = childNodes[i]); i++) {
    if (!child.tagName) {
      continue;
    }
    var obj = {};
    obj['contenttype'] = child.tagName;
    // Store the xml for a block
    if (child.tagName.toUpperCase() === 'BLOCK') {
      obj['xmldef'] = Blockly.utils.xml.domToText(child);
    }
    // Get the contents for a category.
    if (child.tagName.toUpperCase() === 'CATEGORY') {
      for (var k = 0; k < child.children.length; k++) {
        obj['contents'] = Blockly.utils.toolbox.toolboxXmlToJson_(child);
      }
    }
    // Add xml attributes to object
    for (var j = 0; j < child.attributes.length; j++) {
      var attr = child.attributes[j];
      obj[attr.nodeName] = attr.value;
    }
    arr.push(obj);
  }
  return arr;
};

/**
 * Handle the before tree item selected action.
 * @param {Node|Array<Blockly.utils.toolbox.ToolboxItem>} toolboxDef The definition
 *    of the toolbox. Either in xml or JSON.
 * @return {boolean} True if the toolbox input has categories.
 * @package
 */
Blockly.utils.toolbox.hasCategories = function(toolboxDef) {
  if (Array.isArray(toolboxDef)) {
    // Search for categories
    for (var i = 0; i < toolboxDef.length; i++) {
      if (toolboxDef[i]['contenttype'].toUpperCase() === 'CATEGORY') {
        return true;
      }
    }
  } else {
    return Boolean(toolboxDef &&
        toolboxDef.getElementsByTagName('category').length);
  }
  return false;
};
