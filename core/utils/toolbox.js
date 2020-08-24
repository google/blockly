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
 *            contents:Array<Blockly.utils.toolbox.ToolboxItem>,
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
Blockly.utils.toolbox.ToolboxItem;

/**
 * The JSON definition of a toolbox.
 * @typedef {{
 *            contents:!Array<Blockly.utils.toolbox.ToolboxItem>
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
 * @typedef {Array<Blockly.utils.toolbox.FlyoutItem>|
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
Blockly.utils.toolbox.FlyoutItem;

/**
 * The name used to identify a toolbox that has category like items.
 * This only needs to be used if a toolbox wants to be treated like a category
 * toolbox but does not actually contain any toolbox items with the kind
 * 'category'.
 * @const {string}
 */
Blockly.utils.toolbox.CATEGORY_TOOLBOX_KIND = 'categoryToolbox';

/**
 * The name used to identify a toolbox that has no categories and is displayed
 * as a simple flyout displaying blocks, buttons, or labels.
 * @const {string}
 */
Blockly.utils.toolbox.FLYOUT_TOOLBOX_KIND = 'flyoutToolbox';

/**
 * Parse the provided toolbox definition into a consistent format.
 * @param {Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition
 *     of the toolbox in one of its many forms.
 * @return {!Blockly.utils.toolbox.ToolboxJson} Object holding information
 *     for creating a toolbox.
 * @package
 */
Blockly.utils.toolbox.convertToolboxToJSON = function(toolboxDef) {
  if (toolboxDef && Array.isArray(toolboxDef['contents'])) {
    return /** @type {!Blockly.utils.toolbox.ToolboxJson} */ (toolboxDef);
  }
  var contents = Blockly.utils.toolbox.convertToolboxContentsToJSON(toolboxDef) || [];
  var toolboxJson = {'contents': contents};
  if (toolboxDef instanceof Node) {
    Blockly.utils.toolbox.addAttributes_(toolboxDef, toolboxJson);
  }
  return toolboxJson;
};

/**
 * Converts the toolbox contents to JSON.
 * @param {Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The definition
 *     of the toolbox in one of its many forms.
 * @return {Array<Blockly.utils.toolbox.FlyoutItem>|
 *          Array<Blockly.utils.toolbox.ToolboxItem>} The contents of the
 *          toolbox.
 * @package
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
    return contents;
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
 * @package
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
 * @return {!Array<Blockly.utils.toolbox.FlyoutItem>|
 *          !Array<Blockly.utils.toolbox.ToolboxItem>} A list of objects in
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
    Blockly.utils.toolbox.addAttributes_(child, obj);
    arr.push(obj);
  }
  return arr;
};

/**
 * Adds the attributes on the node to the given object.
 * @param {!Node} node The node to copy the attributes from.
 * @param {!Object} obj The object to copy the attributes to.
 * @private
 */
Blockly.utils.toolbox.addAttributes_ = function(node, obj) {
  for (var j = 0; j < node.attributes.length; j++) {
    var attr = node.attributes[j];
    if (attr.nodeName.indexOf('css-') > -1) {
      obj['cssConfig'] = obj['cssConfig'] || {};
      obj['cssConfig'][attr.nodeName.replace('css-', '')] = attr.value;
    } else {
      obj[attr.nodeName] = attr.value;
    }
  }
};

/**
 * Whether or not the toolbox definition has categories.
 * @param {!Blockly.utils.toolbox.ToolboxDefinition} toolboxDef The
 *     definition of the toolbox. Either in xml or JSON.
 * @return {boolean} True if the toolbox has categories.
 * @package
 */
Blockly.utils.toolbox.hasCategories = function(toolboxDef) {
  var toolboxKind = toolboxDef['kind'];
  if (toolboxKind) {
    if (toolboxKind != Blockly.utils.toolbox.FLYOUT_TOOLBOX_KIND &&
      toolboxKind != Blockly.utils.toolbox.CATEGORY_TOOLBOX_KIND) {
      throw Error('Invalid toolbox kind ' + toolboxKind + '.' +
        ' Please supply either ' +
        Blockly.utils.toolbox.FLYOUT_TOOLBOX_KIND + ' or ' +
        Blockly.utils.toolbox.CATEGORY_TOOLBOX_KIND);
    }
    return toolboxKind == Blockly.utils.toolbox.CATEGORY_TOOLBOX_KIND;
  }

  var toolboxContents = toolboxDef['contents'] || toolboxDef;
  if (Array.isArray(toolboxContents)) {
    var categories = toolboxContents.filter(function(item) {
      return item['kind'].toUpperCase() == 'CATEGORY';
    });
    return !!categories.length;
  } else {
    return !!(toolboxDef && toolboxDef.getElementsByTagName('category').length);
  }
};

/**
 * Parse the provided toolbox tree into a consistent DOM format.
 * @param {?Node|?string} toolboxDef DOM tree of blocks, or text representation
 *    of same.
 * @return {?Node} DOM tree of blocks, or null.
 */
Blockly.utils.toolbox.parseToolboxTree = function(toolboxDef) {
  if (toolboxDef) {
    if (typeof toolboxDef != 'string') {
      if (Blockly.utils.userAgent.IE && toolboxDef.outerHTML) {
        // In this case the tree will not have been properly built by the
        // browser. The HTML will be contained in the element, but it will
        // not have the proper DOM structure since the browser doesn't support
        // XSLTProcessor (XML -> HTML).
        toolboxDef = toolboxDef.outerHTML;
      } else if (!(toolboxDef instanceof Element)) {
        toolboxDef = null;
      }
    }
    if (typeof toolboxDef == 'string') {
      toolboxDef = Blockly.Xml.textToDom(toolboxDef);
      if (toolboxDef.nodeName.toLowerCase() != 'xml') {
        throw TypeError('Toolbox should be an <xml> document.');
      }
    }
  } else {
    toolboxDef = null;
  }
  return toolboxDef;
};
