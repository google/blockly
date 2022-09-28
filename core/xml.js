/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview XML reader and writer.
 */
'use strict';

/**
 * XML reader and writer.
 * @namespace Blockly.Xml
 */
goog.module('Blockly.Xml');

const dom = goog.require('Blockly.utils.dom');
const eventUtils = goog.require('Blockly.Events.utils');
const utilsXml = goog.require('Blockly.utils.xml');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Connection} = goog.requireType('Blockly.Connection');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
const {Size} = goog.require('Blockly.utils.Size');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {inputTypes} = goog.require('Blockly.inputTypes');
goog.requireType('Blockly.Comment');
goog.requireType('Blockly.Variables');
goog.requireType('Blockly.WorkspaceComment');
goog.requireType('Blockly.WorkspaceCommentSvg');


/**
 * Encode a block tree as XML.
 * @param {!Workspace} workspace The workspace containing blocks.
 * @param {boolean=} opt_noId True if the encoder should skip the block IDs.
 * @return {!Element} XML DOM element.
 * @alias Blockly.Xml.workspaceToDom
 */
const workspaceToDom = function(workspace, opt_noId) {
  const treeXml = utilsXml.createElement('xml');
  const variablesElement = variablesToDom(
      goog.module.get('Blockly.Variables').allUsedVarModels(workspace));
  if (variablesElement.hasChildNodes()) {
    treeXml.appendChild(variablesElement);
  }
  const comments = workspace.getTopComments(true);
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    treeXml.appendChild(comment.toXmlWithXY(opt_noId));
  }
  const blocks = workspace.getTopBlocks(true);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    treeXml.appendChild(blockToDomWithXY(block, opt_noId));
  }
  return treeXml;
};
exports.workspaceToDom = workspaceToDom;

/**
 * Encode a list of variables as XML.
 * @param {!Array<!VariableModel>} variableList List of all variable
 *     models.
 * @return {!Element} Tree of XML elements.
 * @alias Blockly.Xml.variablesToDom
 */
const variablesToDom = function(variableList) {
  const variables = utilsXml.createElement('variables');
  for (let i = 0; i < variableList.length; i++) {
    const variable = variableList[i];
    const element = utilsXml.createElement('variable');
    element.appendChild(utilsXml.createTextNode(variable.name));
    if (variable.type) {
      element.setAttribute('type', variable.type);
    }
    element.id = variable.getId();
    variables.appendChild(element);
  }
  return variables;
};
exports.variablesToDom = variablesToDom;

/**
 * Encode a block subtree as XML with XY coordinates.
 * @param {!Block} block The root block to encode.
 * @param {boolean=} opt_noId True if the encoder should skip the block ID.
 * @return {!Element|!DocumentFragment} Tree of XML elements or an empty
 *     document fragment if the block was an insertion marker.
 * @alias Blockly.Xml.blockToDomWithXY
 */
const blockToDomWithXY = function(block, opt_noId) {
  if (block.isInsertionMarker()) {  // Skip over insertion markers.
    block = block.getChildren(false)[0];
    if (!block) {
      // Disappears when appended.
      return new DocumentFragment();
    }
  }

  let width;  // Not used in LTR.
  if (block.workspace.RTL) {
    width = block.workspace.getWidth();
  }

  const element = blockToDom(block, opt_noId);
  const xy = block.getRelativeToSurfaceXY();
  element.setAttribute(
      'x', Math.round(block.workspace.RTL ? width - xy.x : xy.x));
  element.setAttribute('y', Math.round(xy.y));
  return element;
};
exports.blockToDomWithXY = blockToDomWithXY;

/**
 * Encode a field as XML.
 * @param {!Field} field The field to encode.
 * @return {?Element} XML element, or null if the field did not need to be
 *     serialized.
 */
const fieldToDom = function(field) {
  if (field.isSerializable()) {
    const container = utilsXml.createElement('field');
    container.setAttribute('name', field.name || '');
    return field.toXml(container);
  }
  return null;
};

/**
 * Encode all of a block's fields as XML and attach them to the given tree of
 * XML elements.
 * @param {!Block} block A block with fields to be encoded.
 * @param {!Element} element The XML element to which the field DOM should be
 *     attached.
 */
const allFieldsToDom = function(block, element) {
  for (let i = 0; i < block.inputList.length; i++) {
    const input = block.inputList[i];
    for (let j = 0; j < input.fieldRow.length; j++) {
      const field = input.fieldRow[j];
      const fieldDom = fieldToDom(field);
      if (fieldDom) {
        element.appendChild(fieldDom);
      }
    }
  }
};

/**
 * Encode a block subtree as XML.
 * @param {!Block} block The root block to encode.
 * @param {boolean=} opt_noId True if the encoder should skip the block ID.
 * @return {!Element|!DocumentFragment} Tree of XML elements or an empty
 *     document fragment if the block was an insertion marker.
 * @alias Blockly.Xml.blockToDom
 */
const blockToDom = function(block, opt_noId) {
  // Skip over insertion markers.
  if (block.isInsertionMarker()) {
    const child = block.getChildren(false)[0];
    if (child) {
      return blockToDom(child);
    } else {
      // Disappears when appended.
      return new DocumentFragment();
    }
  }

  const element = utilsXml.createElement(block.isShadow() ? 'shadow' : 'block');
  element.setAttribute('type', block.type);
  if (!opt_noId) {
    // It's important to use setAttribute here otherwise IE11 won't serialize
    // the block's ID when domToText is called.
    element.setAttribute('id', block.id);
  }
  if (block.mutationToDom) {
    // Custom data for an advanced block.
    const mutation = block.mutationToDom();
    if (mutation && (mutation.hasChildNodes() || mutation.hasAttributes())) {
      element.appendChild(mutation);
    }
  }

  allFieldsToDom(block, element);

  const commentText = block.getCommentText();
  if (commentText) {
    const size = block.commentModel.size;
    const pinned = block.commentModel.pinned;

    const commentElement = utilsXml.createElement('comment');
    commentElement.appendChild(utilsXml.createTextNode(commentText));
    commentElement.setAttribute('pinned', pinned);
    commentElement.setAttribute('h', size.height);
    commentElement.setAttribute('w', size.width);

    element.appendChild(commentElement);
  }

  if (block.data) {
    const dataElement = utilsXml.createElement('data');
    dataElement.appendChild(utilsXml.createTextNode(block.data));
    element.appendChild(dataElement);
  }

  for (let i = 0; i < block.inputList.length; i++) {
    const input = block.inputList[i];
    let container;
    let empty = true;
    if (input.type === inputTypes.DUMMY) {
      continue;
    } else {
      const childBlock = input.connection.targetBlock();
      if (input.type === inputTypes.VALUE) {
        container = utilsXml.createElement('value');
      } else if (input.type === inputTypes.STATEMENT) {
        container = utilsXml.createElement('statement');
      }
      const childShadow = input.connection.getShadowDom();
      if (childShadow && (!childBlock || !childBlock.isShadow())) {
        container.appendChild(cloneShadow(childShadow, opt_noId));
      }
      if (childBlock) {
        const childElem = blockToDom(childBlock, opt_noId);
        if (childElem.nodeType === dom.NodeType.ELEMENT_NODE) {
          container.appendChild(childElem);
          empty = false;
        }
      }
    }
    container.setAttribute('name', input.name);
    if (!empty) {
      element.appendChild(container);
    }
  }
  if (block.inputsInline !== undefined &&
      block.inputsInline !== block.inputsInlineDefault) {
    element.setAttribute('inline', block.inputsInline);
  }
  if (block.isCollapsed()) {
    element.setAttribute('collapsed', true);
  }
  if (!block.isEnabled()) {
    element.setAttribute('disabled', true);
  }
  if (!block.isDeletable() && !block.isShadow()) {
    element.setAttribute('deletable', false);
  }
  if (!block.isMovable() && !block.isShadow()) {
    element.setAttribute('movable', false);
  }
  if (!block.isEditable()) {
    element.setAttribute('editable', false);
  }

  const nextBlock = block.getNextBlock();
  let container;
  if (nextBlock) {
    const nextElem = blockToDom(nextBlock, opt_noId);
    if (nextElem.nodeType === dom.NodeType.ELEMENT_NODE) {
      container = utilsXml.createElement('next');
      container.appendChild(nextElem);
      element.appendChild(container);
    }
  }
  const nextShadow =
      block.nextConnection && block.nextConnection.getShadowDom();
  if (nextShadow && (!nextBlock || !nextBlock.isShadow())) {
    container.appendChild(cloneShadow(nextShadow, opt_noId));
  }

  return element;
};
exports.blockToDom = blockToDom;

/**
 * Deeply clone the shadow's DOM so that changes don't back-wash to the block.
 * @param {!Element} shadow A tree of XML elements.
 * @param {boolean=} opt_noId True if the encoder should skip the block ID.
 * @return {!Element} A tree of XML elements.
 */
const cloneShadow = function(shadow, opt_noId) {
  shadow = shadow.cloneNode(true);
  // Walk the tree looking for whitespace.  Don't prune whitespace in a tag.
  let node = shadow;
  let textNode;
  while (node) {
    if (opt_noId && node.nodeName === 'shadow') {
      // Strip off IDs from shadow blocks.  There should never be a 'block' as
      // a child of a 'shadow', so no need to check that.
      node.removeAttribute('id');
    }
    if (node.firstChild) {
      node = node.firstChild;
    } else {
      while (node && !node.nextSibling) {
        textNode = node;
        node = node.parentNode;
        if (textNode.nodeType === dom.NodeType.TEXT_NODE &&
            textNode.data.trim() === '' && node.firstChild !== textNode) {
          // Prune whitespace after a tag.
          dom.removeNode(textNode);
        }
      }
      if (node) {
        textNode = node;
        node = node.nextSibling;
        if (textNode.nodeType === dom.NodeType.TEXT_NODE &&
            textNode.data.trim() === '') {
          // Prune whitespace before a tag.
          dom.removeNode(textNode);
        }
      }
    }
  }
  return shadow;
};

/**
 * Converts a DOM structure into plain text.
 * Currently the text format is fairly ugly: all one line with no whitespace,
 * unless the DOM itself has whitespace built-in.
 * @param {!Node} dom A tree of XML nodes.
 * @return {string} Text representation.
 * @alias Blockly.Xml.domToText
 */
const domToText = function(dom) {
  const text = utilsXml.domToText(dom);
  // Unpack self-closing tags.  These tags fail when embedded in HTML.
  // <block name="foo"/> -> <block name="foo"></block>
  return text.replace(/<(\w+)([^<]*)\/>/g, '<$1$2></$1>');
};
exports.domToText = domToText;

/**
 * Converts a DOM structure into properly indented text.
 * @param {!Node} dom A tree of XML elements.
 * @return {string} Text representation.
 * @alias Blockly.Xml.domToPrettyText
 */
const domToPrettyText = function(dom) {
  // This function is not guaranteed to be correct for all XML.
  // But it handles the XML that Blockly generates.
  const blob = domToText(dom);
  // Place every open and close tag on its own line.
  const lines = blob.split('<');
  // Indent every line.
  let indent = '';
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line[0] === '/') {
      indent = indent.substring(2);
    }
    lines[i] = indent + '<' + line;
    if (line[0] !== '/' && line.slice(-2) !== '/>') {
      indent += '  ';
    }
  }
  // Pull simple tags back together.
  // E.g. <foo></foo>
  let text = lines.join('\n');
  text = text.replace(/(<(\w+)\b[^>]*>[^\n]*)\n *<\/\2>/g, '$1</$2>');
  // Trim leading blank line.
  return text.replace(/^\n/, '');
};
exports.domToPrettyText = domToPrettyText;

/**
 * Converts an XML string into a DOM structure.
 * @param {string} text An XML string.
 * @return {!Element} A DOM object representing the singular child of the
 *     document element.
 * @throws if the text doesn't parse.
 * @alias Blockly.Xml.textToDom
 */
const textToDom = function(text) {
  const doc = utilsXml.textToDomDocument(text);
  if (!doc || !doc.documentElement ||
      doc.getElementsByTagName('parsererror').length) {
    throw Error('textToDom was unable to parse: ' + text);
  }
  return doc.documentElement;
};
exports.textToDom = textToDom;

/**
 * Clear the given workspace then decode an XML DOM and
 * create blocks on the workspace.
 * @param {!Element} xml XML DOM.
 * @param {!WorkspaceSvg} workspace The workspace.
 * @return {!Array<string>} An array containing new block IDs.
 * @alias Blockly.Xml.clearWorkspaceAndLoadFromXml
 */
const clearWorkspaceAndLoadFromXml = function(xml, workspace) {
  workspace.setResizesEnabled(false);
  workspace.clear();
  const blockIds = domToWorkspace(xml, workspace);
  workspace.setResizesEnabled(true);
  return blockIds;
};
exports.clearWorkspaceAndLoadFromXml = clearWorkspaceAndLoadFromXml;

/**
 * Decode an XML DOM and create blocks on the workspace.
 * @param {!Element} xml XML DOM.
 * @param {!Workspace} workspace The workspace.
 * @return {!Array<string>} An array containing new block IDs.
 * @suppress {strictModuleDepCheck} Suppress module check while workspace
 *     comments are not bundled in.
 * @alias Blockly.Xml.domToWorkspace
 */
const domToWorkspace = function(xml, workspace) {
  const {Workspace} = goog.module.get('Blockly.Workspace');
  if (xml instanceof Workspace) {
    const swap = xml;
    // Closure Compiler complains here because the arguments are reversed.
    /** @suppress {checkTypes} */
    xml = workspace;
    workspace = swap;
    console.warn(
        'Deprecated call to domToWorkspace, ' +
        'swap the arguments.');
  }

  let width;  // Not used in LTR.
  if (workspace.RTL) {
    width = workspace.getWidth();
  }
  const newBlockIds = [];  // A list of block IDs added by this call.
  dom.startTextWidthCache();
  const existingGroup = eventUtils.getGroup();
  if (!existingGroup) {
    eventUtils.setGroup(true);
  }

  // Disable workspace resizes as an optimization.
  // Assume it is rendered so we can check.
  if (/** @type {!WorkspaceSvg} */ (workspace).setResizesEnabled) {
    /** @type {!WorkspaceSvg} */ (workspace).setResizesEnabled(false);
  }
  let variablesFirst = true;
  try {
    for (let i = 0, xmlChild; (xmlChild = xml.childNodes[i]); i++) {
      const name = xmlChild.nodeName.toLowerCase();
      const xmlChildElement = /** @type {!Element} */ (xmlChild);
      if (name === 'block' ||
          (name === 'shadow' && !eventUtils.getRecordUndo())) {
        // Allow top-level shadow blocks if recordUndo is disabled since
        // that means an undo is in progress.  Such a block is expected
        // to be moved to a nested destination in the next operation.
        const block = domToBlock(xmlChildElement, workspace);
        newBlockIds.push(block.id);
        const blockX = xmlChildElement.hasAttribute('x') ?
            parseInt(xmlChildElement.getAttribute('x'), 10) :
            10;
        const blockY = xmlChildElement.hasAttribute('y') ?
            parseInt(xmlChildElement.getAttribute('y'), 10) :
            10;
        if (!isNaN(blockX) && !isNaN(blockY)) {
          block.moveBy(workspace.RTL ? width - blockX : blockX, blockY);
        }
        variablesFirst = false;
      } else if (name === 'shadow') {
        throw TypeError('Shadow block cannot be a top-level block.');
      } else if (name === 'comment') {
        if (workspace.rendered) {
          const {WorkspaceCommentSvg} =
              goog.module.get('Blockly.WorkspaceCommentSvg');
          if (!WorkspaceCommentSvg) {
            console.warn(
                'Missing require for Blockly.WorkspaceCommentSvg, ' +
                'ignoring workspace comment.');
          } else {
            WorkspaceCommentSvg.fromXmlRendered(
                xmlChildElement,
                /** @type {!WorkspaceSvg} */ (workspace), width);
          }
        } else {
          const {WorkspaceComment} =
              goog.module.get('Blockly.WorkspaceComment');
          if (!WorkspaceComment) {
            console.warn(
                'Missing require for Blockly.WorkspaceComment, ' +
                'ignoring workspace comment.');
          } else {
            WorkspaceComment.fromXml(xmlChildElement, workspace);
          }
        }
      } else if (name === 'variables') {
        if (variablesFirst) {
          domToVariables(xmlChildElement, workspace);
        } else {
          throw Error(
              '\'variables\' tag must exist once before block and ' +
              'shadow tag elements in the workspace XML, but it was found in ' +
              'another location.');
        }
        variablesFirst = false;
      }
    }
  } finally {
    if (!existingGroup) {
      eventUtils.setGroup(false);
    }
    dom.stopTextWidthCache();
  }
  // Re-enable workspace resizing.
  if (/** @type {!WorkspaceSvg} */ (workspace).setResizesEnabled) {
    /** @type {!WorkspaceSvg} */ (workspace).setResizesEnabled(true);
  }
  eventUtils.fire(new (eventUtils.get(eventUtils.FINISHED_LOADING))(workspace));
  return newBlockIds;
};
exports.domToWorkspace = domToWorkspace;

/**
 * Decode an XML DOM and create blocks on the workspace. Position the new
 * blocks immediately below prior blocks, aligned by their starting edge.
 * @param {!Element} xml The XML DOM.
 * @param {!Workspace} workspace The workspace to add to.
 * @return {!Array<string>} An array containing new block IDs.
 * @alias Blockly.Xml.appendDomToWorkspace
 */
const appendDomToWorkspace = function(xml, workspace) {
  // First check if we have a WorkspaceSvg, otherwise the blocks have no shape
  // and the position does not matter.
  // Assume it is rendered so we can check.
  if (!/** @type {!WorkspaceSvg} */ (workspace).getBlocksBoundingBox) {
    return domToWorkspace(xml, workspace);
  }

  const bbox = /** @type {!WorkspaceSvg} */ (workspace).getBlocksBoundingBox();
  // Load the new blocks into the workspace and get the IDs of the new blocks.
  const newBlockIds = domToWorkspace(xml, workspace);
  if (bbox && bbox.top !== bbox.bottom) {  // check if any previous block
    let offsetY = 0;  // offset to add to y of the new block
    let offsetX = 0;
    const farY = bbox.bottom;                             // bottom position
    const topX = workspace.RTL ? bbox.right : bbox.left;  // x of bounding box
    // Check position of the new blocks.
    let newLeftX = Infinity;    // x of top left corner
    let newRightX = -Infinity;  // x of top right corner
    let newY = Infinity;        // y of top corner
    const ySeparation = 10;
    for (let i = 0; i < newBlockIds.length; i++) {
      const blockXY =
          workspace.getBlockById(newBlockIds[i]).getRelativeToSurfaceXY();
      if (blockXY.y < newY) {
        newY = blockXY.y;
      }
      if (blockXY.x < newLeftX) {  // if we left align also on x
        newLeftX = blockXY.x;
      }
      if (blockXY.x > newRightX) {  // if we right align also on x
        newRightX = blockXY.x;
      }
    }
    offsetY = farY - newY + ySeparation;
    offsetX = workspace.RTL ? topX - newRightX : topX - newLeftX;
    for (let i = 0; i < newBlockIds.length; i++) {
      const block = workspace.getBlockById(newBlockIds[i]);
      block.moveBy(offsetX, offsetY);
    }
  }
  return newBlockIds;
};
exports.appendDomToWorkspace = appendDomToWorkspace;

/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Workspace} workspace The workspace.
 * @return {!Block} The root block created.
 * @alias Blockly.Xml.domToBlock
 */
const domToBlock = function(xmlBlock, workspace) {
  const {Workspace} = goog.module.get('Blockly.Workspace');
  if (xmlBlock instanceof Workspace) {
    const swap = xmlBlock;
    // Closure Compiler complains here because the arguments are reversed.
    /** @suppress {checkTypes} */
    xmlBlock = /** @type {!Element} */ (workspace);
    workspace = swap;
    console.warn(
        'Deprecated call to domToBlock, ' +
        'swap the arguments.');
  }
  // Create top-level block.
  eventUtils.disable();
  const variablesBeforeCreation = workspace.getAllVariables();
  let topBlock;
  try {
    topBlock = domToBlockHeadless(xmlBlock, workspace);
    // Generate list of all blocks.
    if (workspace.rendered) {
      const topBlockSvg = /** @type {!BlockSvg} */ (topBlock);
      const blocks = topBlock.getDescendants(false);
      topBlockSvg.setConnectionTracking(false);
      // Render each block.
      for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].initSvg();
      }
      for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].render(false);
      }
      // Populating the connection database may be deferred until after the
      // blocks have rendered.
      setTimeout(function() {
        if (!topBlockSvg.disposed) {
          topBlockSvg.setConnectionTracking(true);
        }
      }, 1);
      topBlockSvg.updateDisabled();
      // Allow the scrollbars to resize and move based on the new contents.
      // TODO(@picklesrus): #387. Remove when domToBlock avoids resizing.
      /** @type {!WorkspaceSvg} */ (workspace).resizeContents();
    } else {
      const blocks = topBlock.getDescendants(false);
      for (let i = blocks.length - 1; i >= 0; i--) {
        blocks[i].initModel();
      }
    }
  } finally {
    eventUtils.enable();
  }
  if (eventUtils.isEnabled()) {
    const newVariables =
        goog.module.get('Blockly.Variables')
            .getAddedVariables(workspace, variablesBeforeCreation);
    // Fire a VarCreate event for each (if any) new variable created.
    for (let i = 0; i < newVariables.length; i++) {
      const thisVariable = newVariables[i];
      eventUtils.fire(
          new (eventUtils.get(eventUtils.VAR_CREATE))(thisVariable));
    }
    // Block events come after var events, in case they refer to newly created
    // variables.
    eventUtils.fire(new (eventUtils.get(eventUtils.CREATE))(topBlock));
  }
  return topBlock;
};
exports.domToBlock = domToBlock;

/**
 * Decode an XML list of variables and add the variables to the workspace.
 * @param {!Element} xmlVariables List of XML variable elements.
 * @param {!Workspace} workspace The workspace to which the variable
 *     should be added.
 * @alias Blockly.Xml.domToVariables
 */
const domToVariables = function(xmlVariables, workspace) {
  for (let i = 0; i < xmlVariables.childNodes.length; i++) {
    const xmlChild = xmlVariables.childNodes[i];
    if (xmlChild.nodeType !== dom.NodeType.ELEMENT_NODE) {
      continue;  // Skip text nodes.
    }
    const type = xmlChild.getAttribute('type');
    const id = xmlChild.getAttribute('id');
    const name = xmlChild.textContent;

    workspace.createVariable(name, type, id);
  }
};
exports.domToVariables = domToVariables;

/**
 * A mapping of nodeName to node for child nodes of xmlBlock.
 * @typedef {{
 *      mutation: !Array<!Element>,
 *      comment: !Array<!Element>,
 *      data: !Array<!Element>,
 *      field: !Array<!Element>,
 *      input: !Array<!Element>,
 *      next: !Array<!Element>
 *    }}
 */
let childNodeTagMap;  // eslint-disable-line no-unused-vars

/**
 * Creates a mapping of childNodes for each supported XML tag for the provided
 * xmlBlock. Logs a warning for any encountered unsupported tags.
 * @param {!Element} xmlBlock XML block element.
 * @return {!childNodeTagMap} The childNode map from nodeName to
 *    node.
 */
const mapSupportedXmlTags = function(xmlBlock) {
  const childNodeMap =
      {mutation: [], comment: [], data: [], field: [], input: [], next: []};
  for (let i = 0; i < xmlBlock.childNodes.length; i++) {
    const xmlChild = xmlBlock.childNodes[i];
    if (xmlChild.nodeType === dom.NodeType.TEXT_NODE) {
      // Ignore any text at the <block> level.  It's all whitespace anyway.
      continue;
    }
    switch (xmlChild.nodeName.toLowerCase()) {
      case 'mutation':
        childNodeMap.mutation.push(xmlChild);
        break;
      case 'comment':
        if (!goog.module.get('Blockly.Comment')) {
          console.warn(
              'Missing require for Comment, ' +
              'ignoring block comment.');
          break;
        }
        childNodeMap.comment.push(xmlChild);
        break;
      case 'data':
        childNodeMap.data.push(xmlChild);
        break;
      case 'title':
        // Titles were renamed to field in December 2013.
        // Fall through.
      case 'field':
        childNodeMap.field.push(xmlChild);
        break;
      case 'value':
      case 'statement':
        childNodeMap.input.push(xmlChild);
        break;
      case 'next':
        childNodeMap.next.push(xmlChild);
        break;
      default:
        // Unknown tag; ignore.  Same principle as HTML parsers.
        console.warn('Ignoring unknown tag: ' + xmlChild.nodeName);
    }
  }
  return childNodeMap;
};

/**
 * Applies mutation tag child nodes to the given block.
 * @param {!Array<!Element>} xmlChildren Child nodes.
 * @param {!Block} block The block to apply the child nodes on.
 * @return {boolean} True if mutation may have added some elements that need
 *    initialization (requiring initSvg call).
 */
const applyMutationTagNodes = function(xmlChildren, block) {
  let shouldCallInitSvg = false;
  for (let i = 0; i < xmlChildren.length; i++) {
    const xmlChild = xmlChildren[i];
    // Custom data for an advanced block.
    if (block.domToMutation) {
      block.domToMutation(xmlChild);
      if (block.initSvg) {
        // Mutation may have added some elements that need initializing.
        shouldCallInitSvg = true;
      }
    }
  }
  return shouldCallInitSvg;
};

/**
 * Applies comment tag child nodes to the given block.
 * @param {!Array<!Element>} xmlChildren Child nodes.
 * @param {!Block} block The block to apply the child nodes on.
 */
const applyCommentTagNodes = function(xmlChildren, block) {
  for (let i = 0; i < xmlChildren.length; i++) {
    const xmlChild = xmlChildren[i];
    const text = xmlChild.textContent;
    const pinned = xmlChild.getAttribute('pinned') === 'true';
    const width = parseInt(xmlChild.getAttribute('w'), 10);
    const height = parseInt(xmlChild.getAttribute('h'), 10);

    block.setCommentText(text);
    block.commentModel.pinned = pinned;
    if (!isNaN(width) && !isNaN(height)) {
      block.commentModel.size = new Size(width, height);
    }

    if (pinned && block.getCommentIcon && !block.isInFlyout) {
      const blockSvg = /** @type {BlockSvg} */ (block);
      setTimeout(function() {
        blockSvg.getCommentIcon().setVisible(true);
      }, 1);
    }
  }
};

/**
 * Applies data tag child nodes to the given block.
 * @param {!Array<!Element>} xmlChildren Child nodes.
 * @param {!Block} block The block to apply the child nodes on.
 */
const applyDataTagNodes = function(xmlChildren, block) {
  for (let i = 0; i < xmlChildren.length; i++) {
    const xmlChild = xmlChildren[i];
    block.data = xmlChild.textContent;
  }
};

/**
 * Applies field tag child nodes to the given block.
 * @param {!Array<!Element>} xmlChildren Child nodes.
 * @param {!Block} block The block to apply the child nodes on.
 */
const applyFieldTagNodes = function(xmlChildren, block) {
  for (let i = 0; i < xmlChildren.length; i++) {
    const xmlChild = xmlChildren[i];
    const nodeName = xmlChild.getAttribute('name');
    domToField(block, nodeName, xmlChild);
  }
};

/**
 * Finds any enclosed blocks or shadows within this XML node.
 * @param {!Element} xmlNode The XML node to extract child block info from.
 * @return {{childBlockElement: ?Element, childShadowElement: ?Element}} Any
 *    found child block.
 */
const findChildBlocks = function(xmlNode) {
  const childBlockInfo = {childBlockElement: null, childShadowElement: null};
  for (let i = 0; i < xmlNode.childNodes.length; i++) {
    const xmlChild = xmlNode.childNodes[i];
    if (xmlChild.nodeType === dom.NodeType.ELEMENT_NODE) {
      if (xmlChild.nodeName.toLowerCase() === 'block') {
        childBlockInfo.childBlockElement = /** @type {!Element} */ (xmlChild);
      } else if (xmlChild.nodeName.toLowerCase() === 'shadow') {
        childBlockInfo.childShadowElement = /** @type {!Element} */ (xmlChild);
      }
    }
  }
  return childBlockInfo;
};

/**
 * Applies input child nodes (value or statement) to the given block.
 * @param {!Array<!Element>} xmlChildren Child nodes.
 * @param {!Workspace} workspace The workspace containing the given
 *    block.
 * @param {!Block} block The block to apply the child nodes on.
 * @param {string} prototypeName The prototype name of the block.
 */
const applyInputTagNodes = function(
    xmlChildren, workspace, block, prototypeName) {
  for (let i = 0; i < xmlChildren.length; i++) {
    const xmlChild = xmlChildren[i];
    const nodeName = xmlChild.getAttribute('name');
    const input = block.getInput(nodeName);
    if (!input) {
      console.warn(
          'Ignoring non-existent input ' + nodeName + ' in block ' +
          prototypeName);
      break;
    }
    const childBlockInfo = findChildBlocks(xmlChild);
    if (childBlockInfo.childBlockElement) {
      if (!input.connection) {
        throw TypeError('Input connection does not exist.');
      }
      domToBlockHeadless(
          childBlockInfo.childBlockElement, workspace, input.connection, false);
    }
    // Set shadow after so we don't create a shadow we delete immediately.
    if (childBlockInfo.childShadowElement) {
      input.connection.setShadowDom(childBlockInfo.childShadowElement);
    }
  }
};

/**
 * Applies next child nodes to the given block.
 * @param {!Array<!Element>} xmlChildren Child nodes.
 * @param {!Workspace} workspace The workspace containing the given
 *    block.
 * @param {!Block} block The block to apply the child nodes on.
 */
const applyNextTagNodes = function(xmlChildren, workspace, block) {
  for (let i = 0; i < xmlChildren.length; i++) {
    const xmlChild = xmlChildren[i];
    const childBlockInfo = findChildBlocks(xmlChild);
    if (childBlockInfo.childBlockElement) {
      if (!block.nextConnection) {
        throw TypeError('Next statement does not exist.');
      }
      // If there is more than one XML 'next' tag.
      if (block.nextConnection.isConnected()) {
        throw TypeError('Next statement is already connected.');
      }
      // Create child block.
      domToBlockHeadless(
          childBlockInfo.childBlockElement, workspace, block.nextConnection,
          true);
    }
    // Set shadow after so we don't create a shadow we delete immediately.
    if (childBlockInfo.childShadowElement && block.nextConnection) {
      block.nextConnection.setShadowDom(childBlockInfo.childShadowElement);
    }
  }
};


/**
 * Decode an XML block tag and create a block (and possibly sub blocks) on the
 * workspace.
 * @param {!Element} xmlBlock XML block element.
 * @param {!Workspace} workspace The workspace.
 * @param {!Connection=} parentConnection The parent connection to
 *    to connect this block to after instantiating.
 * @param {boolean=} connectedToParentNext Whether the provided parent
 *     connection
 *    is a next connection, rather than output or statement.
 * @return {!Block} The root block created.
 */
const domToBlockHeadless = function(
    xmlBlock, workspace, parentConnection, connectedToParentNext) {
  let block = null;
  const prototypeName = xmlBlock.getAttribute('type');
  if (!prototypeName) {
    throw TypeError('Block type unspecified: ' + xmlBlock.outerHTML);
  }
  const id = xmlBlock.getAttribute('id');
  block = workspace.newBlock(prototypeName, id);

  // Preprocess childNodes so tags can be processed in a consistent order.
  const xmlChildNameMap = mapSupportedXmlTags(xmlBlock);

  const shouldCallInitSvg =
      applyMutationTagNodes(xmlChildNameMap.mutation, block);
  applyCommentTagNodes(xmlChildNameMap.comment, block);
  applyDataTagNodes(xmlChildNameMap.data, block);

  // Connect parent after processing mutation and before setting fields.
  if (parentConnection) {
    if (connectedToParentNext) {
      if (block.previousConnection) {
        parentConnection.connect(block.previousConnection);
      } else {
        throw TypeError('Next block does not have previous statement.');
      }
    } else {
      if (block.outputConnection) {
        parentConnection.connect(block.outputConnection);
      } else if (block.previousConnection) {
        parentConnection.connect(block.previousConnection);
      } else {
        throw TypeError(
            'Child block does not have output or previous statement.');
      }
    }
  }

  applyFieldTagNodes(xmlChildNameMap.field, block);
  applyInputTagNodes(xmlChildNameMap.input, workspace, block, prototypeName);
  applyNextTagNodes(xmlChildNameMap.next, workspace, block);

  if (shouldCallInitSvg) {
    // This shouldn't even be called here
    // (ref: https://github.com/google/blockly/pull/4296#issuecomment-884226021
    // But the XML serializer/deserializer is iceboxed so I'm not going to fix
    // it.
    (/** @type {!BlockSvg} */ (block)).initSvg();
  }

  const inline = xmlBlock.getAttribute('inline');
  if (inline) {
    block.setInputsInline(inline === 'true');
  }
  const disabled = xmlBlock.getAttribute('disabled');
  if (disabled) {
    block.setEnabled(disabled !== 'true' && disabled !== 'disabled');
  }
  const deletable = xmlBlock.getAttribute('deletable');
  if (deletable) {
    block.setDeletable(deletable === 'true');
  }
  const movable = xmlBlock.getAttribute('movable');
  if (movable) {
    block.setMovable(movable === 'true');
  }
  const editable = xmlBlock.getAttribute('editable');
  if (editable) {
    block.setEditable(editable === 'true');
  }
  const collapsed = xmlBlock.getAttribute('collapsed');
  if (collapsed) {
    block.setCollapsed(collapsed === 'true');
  }
  if (xmlBlock.nodeName.toLowerCase() === 'shadow') {
    // Ensure all children are also shadows.
    const children = block.getChildren(false);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.isShadow()) {
        throw TypeError('Shadow block not allowed non-shadow child.');
      }
    }
    // Ensure this block doesn't have any variable inputs.
    if (block.getVarModels().length) {
      throw TypeError('Shadow blocks cannot have variable references.');
    }
    block.setShadow(true);
  }
  return block;
};

/**
 * Decode an XML field tag and set the value of that field on the given block.
 * @param {!Block} block The block that is currently being deserialized.
 * @param {string} fieldName The name of the field on the block.
 * @param {!Element} xml The field tag to decode.
 */
const domToField = function(block, fieldName, xml) {
  const field = block.getField(fieldName);
  if (!field) {
    console.warn(
        'Ignoring non-existent field ' + fieldName + ' in block ' + block.type);
    return;
  }
  field.fromXml(xml);
};

/**
 * Remove any 'next' block (statements in a stack).
 * @param {!Element|!DocumentFragment} xmlBlock XML block element or an empty
 *     DocumentFragment if the block was an insertion marker.
 * @alias Blockly.Xml.deleteNext
 */
const deleteNext = function(xmlBlock) {
  for (let i = 0; i < xmlBlock.childNodes.length; i++) {
    const child = xmlBlock.childNodes[i];
    if (child.nodeName.toLowerCase() === 'next') {
      xmlBlock.removeChild(child);
      break;
    }
  }
};
exports.deleteNext = deleteNext;
