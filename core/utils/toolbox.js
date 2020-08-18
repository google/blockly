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


goog.requireType('Blockly.ToolboxCategory');
goog.requireType('Blockly.ToolboxSeparator');

/**
 * The information needed to create a block in the toolbox.
 * @typedef {{
 *            kind:string,
 *            blockxml:(?string|Node),
 *            type: ?string,
 *            gap: (?string|?number),
 *            disabled: (?string|?boolean)
 *          }}
 */
Blockly.utils.toolbox.BlockJson;

/**
 * The information needed to create a separator in the toolbox.
 * @typedef {{
 *            kind:string,
 *            id:?string,
 *            gap:?number,
 *            cssConfig:?Blockly.ToolboxSeparator.CssConfig
 *          }}
 */
Blockly.utils.toolbox.SeparatorJson;

/**
 * The information needed to create a button in the toolbox.
 * @typedef {{
 *            kind:string,
 *            text:string,
 *            callbackkey:string
 *          }}
 */
Blockly.utils.toolbox.ButtonJson;

/**
 * The information needed to create a label in the toolbox.
 * @typedef {{
 *            kind:string,
 *            id:?string,
 *            text:string
 *          }}
 */
Blockly.utils.toolbox.LabelJson;

/**
 * The information needed to create a category in the toolbox.
 * @typedef {{
 *            kind:string,
 *            name:string,
 *            id:?string,
 *            categorystyle:?string,
 *            colour:?string,
 *            cssConfig:?Blockly.ToolboxCategory.CssConfig,
 *            custom:?string,
 *            contents:Array<Blockly.utils.toolbox.ToolboxItems>,
 *            hidden:?string
 *          }}
 */
Blockly.utils.toolbox.CategoryJson;

/**
 * Any information that can be used to create an item in the toolbox.
 * @typedef {Blockly.utils.toolbox.BlockJson|
 *           Blockly.utils.toolbox.SeparatorJson|
 *           Blockly.utils.toolbox.ButtonJson|
 *           Blockly.utils.toolbox.LabelJson|
 *           Blockly.utils.toolbox.CategoryJson}
 */
Blockly.utils.toolbox.ToolboxItems;

/**
 * The JSON definition of a toolbox.
 * @typedef {{
 *            contents:!Array<Blockly.utils.toolbox.ToolboxItems>
 *          }}
 */
Blockly.utils.toolbox.ToolboxJson;

/**
 * All of the different types that can create a toolbox.
 * @typedef {Node|
 *           Blockly.utils.toolbox.ToolboxJson|
 *           Array<Node>|
 *           string}
 */
Blockly.utils.toolbox.ToolboxDefinition;

/**
 * All of the different types that can be used to show items in a flyout.
 * @typedef {Array<Blockly.utils.toolbox.FlyoutItems>|
 *           Blockly.utils.toolbox.ToolboxDefinition}
 */
Blockly.utils.toolbox.FlyoutDefinition;

/**
 * All the different types that can be displayed in a flyout.
 * @typedef {Blockly.utils.toolbox.BlockJson|
 *           Blockly.utils.toolbox.SeparatorJson|
 *           Blockly.utils.toolbox.ButtonJson|
 *           Blockly.utils.toolbox.LabelJson}
 */
Blockly.utils.toolbox.FlyoutItems;

/**
 * Parse the provided toolbox definition into a consistent format.
 * @param {Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition
 *     of the toolbox in one of its many forms.
 * @return {!Blockly.utils.toolbox.ToolboxJson} Object holding information
 *     for creating a toolbox.
 * @package
 */
Blockly.utils.toolbox.convertToolboxToJSON = function(toolboxDef) {
  var contents = Blockly.utils.toolbox.convertToolboxContentsToJSON(toolboxDef) || [];
  return {'contents' : contents};
};

/**
 * Converts the toolbox contents to JSON.
 * @param {Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition
 *     of the toolbox in one of its many forms.
 * @return {Array<Blockly.utils.toolbox.FlyoutItems>|
 *          Array<Blockly.utils.toolbox.ToolboxItems>} The contents of the
 *          toolbox.
 */
Blockly.utils.toolbox.convertToolboxContentsToJSON = function(toolboxDef) {
  if (!toolboxDef) {
    return null;
  }
  var contents = toolboxDef['contents'] || toolboxDef;
  // If it is an array of JSON, then it is already in the correct format.
  if (Blockly.utils.toolbox.isCorrectFormat(contents)) {
    if (Blockly.utils.toolbox.hasCategories(toolboxDef)) {
      // TODO: Remove after #3985 has been looked into.
      console.warn('Due to some performance issues, defining a toolbox using' +
          ' JSON is not ready yet. Please define your toolbox using xml.');
    }
    return /** @type {!Array<Blockly.utils.toolbox.FlyoutItems>|!Array<Blockly.utils.toolbox.ToolboxItems>} */ (contents);
  }

  return Blockly.utils.toolbox.toolboxXmlToJson_(
      /** @type {!Node|!Array<Node>} */ (toolboxDef));
};

/**
 * Returns true if the toolbox definition is already in the correct format
 * @param {?Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition
 *     of the toolbox in one of its many forms.
 * @return {boolean} True if the toolbox definition is already in the correct
 *     format.
 */
Blockly.utils.toolbox.isCorrectFormat = function(toolboxDef) {
  return !!(toolboxDef &&
      Array.isArray(toolboxDef) &&
      toolboxDef.length &&
      !(toolboxDef[0].nodeType));
};

/**
 * Convert the xml for a toolbox to JSON.
 * @param {!Node|!Array<Node>} toolboxDef The
 *     definition of the toolbox in one of its many forms.
 * @return {!Array<Blockly.utils.toolbox.FlyoutItems>|
 *          !Array<Blockly.utils.toolbox.ToolboxItems>} A list of objects in
 *     the toolbox.
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
    var tagName = child.tagName.toUpperCase();
    obj['kind'] = tagName;

    // Store the xml for a block
    if (tagName == 'BLOCK') {
      obj['blockxml'] = child;
    } else if (tagName == 'CATEGORY') {
      // Get the contents of a category
      obj['contents'] = Blockly.utils.toolbox.toolboxXmlToJson_(child);
    }

    // Add xml attributes to object
    for (var j = 0; j < child.attributes.length; j++) {
      var attr = child.attributes[j];
      if (attr.nodeName.indexOf('css-') > -1) {
        obj['cssConfig'] = obj['cssConfig'] || {};
        obj['cssConfig'][attr.nodeName.replace('css-', '')] = attr.value;
      } else {
        obj[attr.nodeName] = attr.value;
      }
    }
    arr.push(obj);
  }
  return arr;
};

/**
 * Whether or not the toolbox definition has categories or not.
 * @param {!Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The
 *     definition of the toolbox. Either in xml or JSON.
 * @return {boolean} True if the toolbox has categories.
 * @package
 */
Blockly.utils.toolbox.hasCategories = function(toolboxDef) {
  var toolboxContents = toolboxDef['contents'] || toolboxDef;
  if (Array.isArray(toolboxContents)) {
    return !!(toolboxContents.length && toolboxContents[0]['kind'].toUpperCase() == 'CATEGORY');
  } else {
    return !!(toolboxDef && toolboxDef.getElementsByTagName('category').length);
  }
};
