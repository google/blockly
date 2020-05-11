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
 * The information needed to create a block in the toolbox.
 * @typedef {{
 *            kind:string,
 *            blockxml:(string|Node)
 *          }}
 */
Blockly.utils.toolbox.BlockInfo;

/**
 * The information needed to create a separator in the toolbox.
 * @typedef {{
 *            kind:string,
 *            gap:?number
 *          }}
 */
Blockly.utils.toolbox.SeparatorInfo;

/**
 * The information needed to create a button in the toolbox.
 * @typedef {{
 *            kind:string,
 *            text:string,
 *            callbackkey:string
 *          }}
 */
Blockly.utils.toolbox.ButtonInfo;

/**
 * The information needed to create a label in the toolbox.
 * @typedef {{
 *            kind:string,
 *            text:string
 *          }}
 */
Blockly.utils.toolbox.LabelInfo;

/**
 * The information needed to create a category in the toolbox.
 * @typedef {{
 *            kind:string,
 *            name:string,
 *            categorystyle:?string,
 *            colour:?string,
 *            contents:Array.<Blockly.utils.toolbox.ToolboxInfo>
 *          }}
 */
Blockly.utils.toolbox.CategoryInfo;

/**
 * Any information that can be used to create an item in the toolbox.
 * @typedef {Blockly.utils.toolbox.BlockInfo|
 *           Blockly.utils.toolbox.SeparatorInfo|
 *           Blockly.utils.toolbox.ButtonInfo|
 *           Blockly.utils.toolbox.LabelInfo|
 *           Blockly.utils.toolbox.CategoryInfo}
 */
Blockly.utils.toolbox.ToolboxInfo;

/**
 * All of the different types that can create a toolbox.
 * @typedef {Node|
 *           NodeList|
 *           Array.<Blockly.utils.toolbox.ToolboxInfo>|
 *           Array.<Node>}
 */
Blockly.utils.toolbox.ToolboxDefinition;


/**
 * Parse the provided toolbox definition into a consistent format.
 * @param {Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition of the
 *    toolbox in one of its many forms.
 * @return {!Array.<Blockly.utils.toolbox.ToolboxInfo>} Array of JSON holding
 *    information on toolbox contents.
 * @package
 */
Blockly.utils.toolbox.parseToolboxContents = function(toolboxDef) {
  if (!toolboxDef) {
    return [];
  }
  // If it is an array of JSON, then it is already in the correct format.
  if (Array.isArray(toolboxDef) && toolboxDef.length && !(toolboxDef[0].nodeType)) {
    return /** @type {!Array.<Blockly.utils.toolbox.ToolboxInfo>} */ (toolboxDef);
  }

  return Blockly.utils.toolbox.toolboxXmlToJson_(toolboxDef);
};

/**
 * Convert the xml for a toolbox to JSON.
 * @param {!NodeList|!Node|!Array<Node>} toolboxDef The
 *     definition of the toolbox in one of its many forms.
 * @return {!Array.<Blockly.utils.toolbox.ToolboxInfo>} A list of objects in the
 *    toolbox.
 * @private
 */
Blockly.utils.toolbox.toolboxXmlToJson_ = function(toolboxDef) {
  var arr = [];
  // If it is a node it will have children.
  var childNodes = toolboxDef.childNodes;
  if (!childNodes) {
    // Otherwise the toolboxDef is an array or collection.
    childNodes = toolboxDef;
  }
  for (var i = 0, child; (child = childNodes[i]); i++) {
    if (!child.tagName) {
      continue;
    }
    var obj = {};
    obj['kind'] = child.tagName.toUpperCase();
    // Store the xml for a block
    if (child.tagName.toUpperCase() == 'BLOCK') {
      obj['blockxml'] = Blockly.utils.xml.domToText(child);
    }
    // Get the contents for a category.
    if (child.tagName.toUpperCase() == 'CATEGORY') {
      for (var k = 0; k < child.childNodes.length; k++) {
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
 * Whether or not the toolbox definition has categories or not.
 * @param {Node|Array.<Blockly.utils.toolbox.ToolboxInfo>} toolboxDef The definition
 *    of the toolbox. Either in xml or JSON.
 * @return {boolean} True if the toolbox has categories.
 * @package
 */
Blockly.utils.toolbox.hasCategories = function(toolboxDef) {
  if (Array.isArray(toolboxDef)) {
    // Search for categories
    return !!(toolboxDef.length && toolboxDef[0]['kind'].toUpperCase() == 'CATEGORY');
  } else {
    return !!(toolboxDef && toolboxDef.getElementsByTagName('category').length);
  }
};
