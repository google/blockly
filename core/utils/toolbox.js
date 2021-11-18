/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Utility functions for the toolbox and flyout.
 */
'use strict';

/**
 * Utility functions for the toolbox and flyout.
 * @namespace Blockly.utils.toolbox
 */
goog.module('Blockly.utils.toolbox');

const Xml = goog.require('Blockly.Xml');
const userAgent = goog.require('Blockly.utils.userAgent');
/* eslint-disable-next-line no-unused-vars */
const {ConnectionState} = goog.requireType('Blockly.serialization.blocks');
/* eslint-disable-next-line no-unused-vars */
const {ToolboxCategory} = goog.requireType('Blockly.ToolboxCategory');
/* eslint-disable-next-line no-unused-vars */
const {ToolboxSeparator} = goog.requireType('Blockly.ToolboxSeparator');

/**
 * The information needed to create a block in the toolbox.
 * Note that disabled has a different type for backwards compatibility.
 * @typedef {{
 *            kind:string,
 *            blockxml:(string|!Node|undefined),
 *            type:(string|undefined),
 *            gap:(string|number|undefined),
 *            disabled: (string|boolean|undefined),
 *            enabled: (boolean|undefined),
 *            id: (string|undefined),
 *            x: (number|undefined),
 *            y: (number|undefined),
 *            collapsed: (boolean|undefined),
 *            inline: (boolean|undefined),
 *            data: (string|undefined),
 *            extra-state: (*|undefined),
 *            icons: (!Object<string, *>|undefined),
 *            fields: (!Object<string, *>|undefined),
 *            inputs: (!Object<string, !ConnectionState>|undefined),
 *            next: (!ConnectionState|undefined)
 *          }}
 * @alias Blockly.utils.toolbox.BlockInfo
 */
let BlockInfo;
exports.BlockInfo = BlockInfo;

/**
 * The information needed to create a separator in the toolbox.
 * @typedef {{
 *            kind:string,
 *            id:(string|undefined),
 *            gap:(number|undefined),
 *            cssconfig:(!ToolboxSeparator.CssConfig|undefined)
 *          }}
 * @alias Blockly.utils.toolbox.SeparatorInfo
 */
let SeparatorInfo;
exports.SeparatorInfo = SeparatorInfo;

/**
 * The information needed to create a button in the toolbox.
 * @typedef {{
 *            kind:string,
 *            text:string,
 *            callbackkey:string
 *          }}
 * @alias Blockly.utils.toolbox.ButtonInfo
 */
let ButtonInfo;
exports.ButtonInfo = ButtonInfo;

/**
 * The information needed to create a label in the toolbox.
 * @typedef {{
 *            kind:string,
 *            text:string,
 *            id:(string|undefined)
 *          }}
 * @alias Blockly.utils.toolbox.LabelInfo
 */
let LabelInfo;
exports.LabelInfo = LabelInfo;

/**
 * The information needed to create either a button or a label in the flyout.
 * @typedef {ButtonInfo|
 *           LabelInfo}
 * @alias Blockly.utils.toolbox.ButtonOrLabelInfo
 */
let ButtonOrLabelInfo;
exports.ButtonOrLabelInfo = ButtonOrLabelInfo;

/**
 * The information needed to create a category in the toolbox.
 * @typedef {{
 *            kind:string,
 *            name:string,
 *            contents:!Array<!ToolboxItemInfo>,
 *            id:(string|undefined),
 *            categorystyle:(string|undefined),
 *            colour:(string|undefined),
 *            cssconfig:(!ToolboxCategory.CssConfig|undefined),
 *            hidden:(string|undefined)
 *          }}
 * @alias Blockly.utils.toolbox.StaticCategoryInfo
 */
let StaticCategoryInfo;
exports.StaticCategoryInfo = StaticCategoryInfo;

/**
 * The information needed to create a custom category.
 * @typedef {{
 *            kind:string,
 *            custom:string,
 *            id:(string|undefined),
 *            categorystyle:(string|undefined),
 *            colour:(string|undefined),
 *            cssconfig:(!ToolboxCategory.CssConfig|undefined),
 *            hidden:(string|undefined)
 *          }}
 * @alias Blockly.utils.toolbox.DynamicCategoryInfo
 */
let DynamicCategoryInfo;
exports.DynamicCategoryInfo = DynamicCategoryInfo;

/**
 * The information needed to create either a dynamic or static category.
 * @typedef {StaticCategoryInfo|
 *           DynamicCategoryInfo}
 * @alias Blockly.utils.toolbox.CategoryInfo
 */
let CategoryInfo;
exports.CategoryInfo = CategoryInfo;

/**
 * Any information that can be used to create an item in the toolbox.
 * @typedef {FlyoutItemInfo|
 *           StaticCategoryInfo}
 * @alias Blockly.utils.toolbox.ToolboxItemInfo
 */
let ToolboxItemInfo;
exports.ToolboxItemInfo = ToolboxItemInfo;

/**
 * All the different types that can be displayed in a flyout.
 * @typedef {BlockInfo|
 *           SeparatorInfo|
 *           ButtonInfo|
 *           LabelInfo|
 *           DynamicCategoryInfo}
 * @alias Blockly.utils.toolbox.FlyoutItemInfo
 */
let FlyoutItemInfo;
exports.FlyoutItemInfo = FlyoutItemInfo;

/**
 * The JSON definition of a toolbox.
 * @typedef {{
 *            kind:(string|undefined),
 *            contents:!Array<!ToolboxItemInfo>
 *          }}
 * @alias Blockly.utils.toolbox.ToolboxInfo
 */
let ToolboxInfo;
exports.ToolboxInfo = ToolboxInfo;

/**
 * An array holding flyout items.
 * @typedef {
 *            Array<!FlyoutItemInfo>
 *          }
 * @alias Blockly.utils.toolbox.FlyoutItemInfoArray
 */
let FlyoutItemInfoArray;
exports.FlyoutItemInfoArray = FlyoutItemInfoArray;

/**
 * All of the different types that can create a toolbox.
 * @typedef {Node|
 *           ToolboxInfo|
 *           string}
 * @alias Blockly.utils.toolbox.ToolboxDefinition
 */
let ToolboxDefinition;
exports.ToolboxDefinition = ToolboxDefinition;

/**
 * All of the different types that can be used to show items in a flyout.
 * @typedef {FlyoutItemInfoArray|
 *           NodeList|
 *           ToolboxInfo|
 *           Array<!Node>}
 * @alias Blockly.utils.toolbox.FlyoutDefinition
 */
let FlyoutDefinition;
exports.FlyoutDefinition = FlyoutDefinition;

/**
 * The name used to identify a toolbox that has category like items.
 * This only needs to be used if a toolbox wants to be treated like a category
 * toolbox but does not actually contain any toolbox items with the kind
 * 'category'.
 * @const {string}
 */
const CATEGORY_TOOLBOX_KIND = 'categoryToolbox';

/**
 * The name used to identify a toolbox that has no categories and is displayed
 * as a simple flyout displaying blocks, buttons, or labels.
 * @const {string}
 */
const FLYOUT_TOOLBOX_KIND = 'flyoutToolbox';

/**
 * Position of the toolbox and/or flyout relative to the workspace.
 * @enum {number}
 * @alias Blockly.utils.toolbox.Position
 */
const Position = {
  TOP: 0,
  BOTTOM: 1,
  LEFT: 2,
  RIGHT: 3,
};
exports.Position = Position;

/**
 * Converts the toolbox definition into toolbox JSON.
 * @param {?ToolboxDefinition} toolboxDef The definition
 *     of the toolbox in one of its many forms.
 * @return {?ToolboxInfo} Object holding information
 *     for creating a toolbox.
 * @alias Blockly.utils.toolbox.convertToolboxDefToJson
 * @package
 */
const convertToolboxDefToJson = function(toolboxDef) {
  if (!toolboxDef) {
    return null;
  }

  if (toolboxDef instanceof Element || typeof toolboxDef === 'string') {
    toolboxDef = parseToolboxTree(toolboxDef);
    toolboxDef = convertToToolboxJson(toolboxDef);
  }

  const toolboxJson = /** @type {ToolboxInfo} */ (toolboxDef);
  validateToolbox(toolboxJson);
  return toolboxJson;
};
exports.convertToolboxDefToJson = convertToolboxDefToJson;

/**
 * Validates the toolbox JSON fields have been set correctly.
 * @param {!ToolboxInfo} toolboxJson Object holding
 *     information for creating a toolbox.
 * @throws {Error} if the toolbox is not the correct format.
 */
const validateToolbox = function(toolboxJson) {
  const toolboxKind = toolboxJson['kind'];
  const toolboxContents = toolboxJson['contents'];

  if (toolboxKind) {
    if (toolboxKind !== FLYOUT_TOOLBOX_KIND &&
        toolboxKind !== CATEGORY_TOOLBOX_KIND) {
      throw Error(
          'Invalid toolbox kind ' + toolboxKind + '.' +
          ' Please supply either ' + FLYOUT_TOOLBOX_KIND + ' or ' +
          CATEGORY_TOOLBOX_KIND);
    }
  }
  if (!toolboxContents) {
    throw Error('Toolbox must have a contents attribute.');
  }
};

/**
 * Converts the flyout definition into a list of flyout items.
 * @param {?FlyoutDefinition} flyoutDef The definition of
 *    the flyout in one of its many forms.
 * @return {!FlyoutItemInfoArray} A list of flyout items.
 * @alias Blockly.utils.toolbox.convertFlyoutDefToJsonArray
 * @package
 */
const convertFlyoutDefToJsonArray = function(flyoutDef) {
  if (!flyoutDef) {
    return [];
  }

  if (flyoutDef['contents']) {
    return flyoutDef['contents'];
  }

  // If it is already in the correct format return the flyoutDef.
  if (Array.isArray(flyoutDef) && flyoutDef.length > 0 &&
      !flyoutDef[0].nodeType) {
    return flyoutDef;
  }

  return xmlToJsonArray(/** @type {!Array<Node>|!NodeList} */ (flyoutDef));
};
exports.convertFlyoutDefToJsonArray = convertFlyoutDefToJsonArray;

/**
 * Whether or not the toolbox definition has categories.
 * @param {?ToolboxInfo} toolboxJson Object holding
 *     information for creating a toolbox.
 * @return {boolean} True if the toolbox has categories.
 * @alias Blockly.utils.toolbox.hasCategories
 * @package
 */
const hasCategories = function(toolboxJson) {
  if (!toolboxJson) {
    return false;
  }

  const toolboxKind = toolboxJson['kind'];
  if (toolboxKind) {
    return toolboxKind === CATEGORY_TOOLBOX_KIND;
  }

  const categories = toolboxJson['contents'].filter(function(item) {
    return item['kind'].toUpperCase() === 'CATEGORY';
  });
  return !!categories.length;
};
exports.hasCategories = hasCategories;

/**
 * Whether or not the category is collapsible.
 * @param {!CategoryInfo} categoryInfo Object holing
 *    information for creating a category.
 * @return {boolean} True if the category has subcategories.
 * @alias Blockly.utils.toolbox.isCategoryCollapsible
 * @package
 */
const isCategoryCollapsible = function(categoryInfo) {
  if (!categoryInfo || !categoryInfo['contents']) {
    return false;
  }

  const categories = categoryInfo['contents'].filter(function(item) {
    return item['kind'].toUpperCase() === 'CATEGORY';
  });
  return !!categories.length;
};
exports.isCategoryCollapsible = isCategoryCollapsible;

/**
 * Parses the provided toolbox definition into a consistent format.
 * @param {Node} toolboxDef The definition of the toolbox in one of its many
 *     forms.
 * @return {!ToolboxInfo} Object holding information
 *     for creating a toolbox.
 */
const convertToToolboxJson = function(toolboxDef) {
  const contents = xmlToJsonArray(
      /** @type {!Node|!Array<Node>} */ (toolboxDef));
  const toolboxJson = {'contents': contents};
  if (toolboxDef instanceof Node) {
    addAttributes(toolboxDef, toolboxJson);
  }
  return toolboxJson;
};

/**
 * Converts the xml for a toolbox to JSON.
 * @param {!Node|!Array<Node>|!NodeList} toolboxDef The
 *     definition of the toolbox in one of its many forms.
 * @return {!FlyoutItemInfoArray|
 *          !Array<ToolboxItemInfo>} A list of objects in
 *          the toolbox.
 */
const xmlToJsonArray = function(toolboxDef) {
  const arr = [];
  // If it is a node it will have children.
  let childNodes = toolboxDef.childNodes;
  if (!childNodes) {
    // Otherwise the toolboxDef is an array or collection.
    childNodes = toolboxDef;
  }
  for (let i = 0, child; (child = childNodes[i]); i++) {
    if (!child.tagName) {
      continue;
    }
    const obj = {};
    const tagName = child.tagName.toUpperCase();
    obj['kind'] = tagName;

    // Store the XML for a block.
    if (tagName === 'BLOCK') {
      obj['blockxml'] = child;
    } else if (child.childNodes && child.childNodes.length > 0) {
      // Get the contents of a category
      obj['contents'] = xmlToJsonArray(child);
    }

    // Add XML attributes to object
    addAttributes(child, obj);
    arr.push(obj);
  }
  return arr;
};

/**
 * Adds the attributes on the node to the given object.
 * @param {!Node} node The node to copy the attributes from.
 * @param {!Object} obj The object to copy the attributes to.
 */
const addAttributes = function(node, obj) {
  for (let j = 0; j < node.attributes.length; j++) {
    const attr = node.attributes[j];
    if (attr.nodeName.indexOf('css-') > -1) {
      obj['cssconfig'] = obj['cssconfig'] || {};
      obj['cssconfig'][attr.nodeName.replace('css-', '')] = attr.value;
    } else {
      obj[attr.nodeName] = attr.value;
    }
  }
};

/**
 * Parse the provided toolbox tree into a consistent DOM format.
 * @param {?Node|?string} toolboxDef DOM tree of blocks, or text representation
 *    of same.
 * @return {?Node} DOM tree of blocks, or null.
 * @alias Blockly.utils.toolbox.parseToolboxTree
 */
const parseToolboxTree = function(toolboxDef) {
  if (toolboxDef) {
    if (typeof toolboxDef !== 'string') {
      if (userAgent.IE && toolboxDef.outerHTML) {
        // In this case the tree will not have been properly built by the
        // browser. The HTML will be contained in the element, but it will
        // not have the proper DOM structure since the browser doesn't support
        // XSLTProcessor (XML -> HTML).
        toolboxDef = toolboxDef.outerHTML;
      } else if (!(toolboxDef instanceof Element)) {
        toolboxDef = null;
      }
    }
    if (typeof toolboxDef === 'string') {
      toolboxDef = Xml.textToDom(toolboxDef);
      if (toolboxDef.nodeName.toLowerCase() !== 'xml') {
        throw TypeError('Toolbox should be an <xml> document.');
      }
    }
  } else {
    toolboxDef = null;
  }
  return toolboxDef;
};
exports.parseToolboxTree = parseToolboxTree;
