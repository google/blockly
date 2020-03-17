/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Search handler for Blockly. Specifically handles
 * all searches that happen in the main workspace.
 *
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.ToolboxSearchHelper');

goog.require('Blockly.Search');

Blockly.ToolboxSearchHelper = function (parent, workspace) {
  this.workspace_ = workspace;
  this.parent_ = parent;
};

/**
 * Event handler for whenever the Blockly workspace changes.
 * Specifically needed to add or remove blocks to the Search handler's trie
 * whenever the user adds or removes blocks from the workspace.
 *
 * @param {!Blockly.Event} event The Blockly event that got fired because of something changing in Blockly.
 */
Blockly.ToolboxSearchHelper.prototype.onNewWorkspaceEvent = function (event) {
  var i;
  var blockData;

  // If a block was added to the workspace, add it's associated keywords to the handler's trie.
  if (event.type === Blockly.Events.CREATE) {
    // Decode the XML contents so any child blocks that also got added to the workspace get added to the trie as well,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksAdded = this.parent_.decodeXmlBlocks(event.xml);

    for (i = 0; i < blocksAdded.length; i++) {
      blockData = blocksAdded[i];

      if (blockData[0] && blockData[1]) {
        if (blockData[0] !== 'procedures_defnoreturn' &&
            blockData[0] !== 'procedures_defreturn') {
          return;
        }

        var newBlockInfo = this.extractFunctionInfo(event);
        blockData[0] = (newBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
        blockData[1] = this.generateFunctionBlock(newBlockInfo[0], newBlockInfo[1], newBlockInfo[2]);
        this.parent_.onBlockAdded(blockData[0], blockData[1]);
        this.addFunctionKeywords(blockData[1], newBlockInfo[0], newBlockInfo[1]);
      }
    }
  } else if (event.type === Blockly.Events.DELETE) {
    // If a block was removed from the workspace, remove it's associated keywords from the handler's trie.
    // Decode the XML contents so any child blocks that got removed from the workspace also get removed from the trie,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksRemoved = this.parent_.decodeXmlBlocks(event.oldXml);

    for (i = 0; i < blocksRemoved.length; i++) {
      blockData = blocksRemoved[i];

      if (blockData[0] && blockData[1]) {
        if (blockData[0] !== 'procedures_defnoreturn' &&
            blockData[0] !== 'procedures_defreturn') {
          return;
        }

        var deletedBlockInfo = this.extractDeletedBlockInfo(event.oldXml);
        blockData[0] = (deletedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
        blockData[1] = this.generateFunctionBlock(deletedBlockInfo[0], deletedBlockInfo[1], deletedBlockInfo[2]);
        this.parent_.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.CHANGE &&
            (event.element === 'field' || event.element === 'mutation')) {
    var blockInfo = this.workspace_.getBlockById(event.blockId);

    if (blockInfo.type !== 'procedures_defnoreturn' &&
        blockInfo.type !== 'procedures_defreturn') {
      return;
    }

    var changedBlockInfo = this.extractFunctionInfo(event);

    if (changedBlockInfo[3] !== '' && event.element === 'field') {
      var blockToRemove = this.generateFunctionBlock(changedBlockInfo[3], changedBlockInfo[1], changedBlockInfo[2]);
      var blockToRemoveType = (changedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
      this.parent_.onBlockRemoved(blockToRemoveType, blockToRemove);
    } else if (changedBlockInfo[4].length > 0 && event.element === 'mutation') {
      var blockWithArgsToRemove = this.generateFunctionBlock(changedBlockInfo[0], changedBlockInfo[4], changedBlockInfo[2]);
      var blockWithArgsToRemoveType = (changedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
      this.parent_.onBlockRemoved(blockWithArgsToRemoveType, blockWithArgsToRemove);
    }

    var blockToAdd = this.generateFunctionBlock(changedBlockInfo[0], changedBlockInfo[1], changedBlockInfo[2]);
    var blockToAddType = (changedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
    this.parent_.onBlockAdded(blockToAddType, blockToAdd);
    this.addFunctionKeywords(blockToAdd, changedBlockInfo[0], changedBlockInfo[1]);
  }
};

Blockly.ToolboxSearchHelper.prototype.addFunctionKeywords = function (blockXml, funcName, funcArgs) {
  // See if the block has been initialized before
  if (!this.parent_.blocksAdded_[blockXml]) {
    console.warn('the following block wasn\'t added to the search trie before:\n' + blockXml);
    this.parent_.blocksAdded_[blockXml] = [];
  }

  funcArgs.push(funcName);

  for (var i = 0; i < funcArgs.length; i++) {
    const splitText = funcArgs[i].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');

    for (var j = 0; j < splitText.length; j++) {
      const text = splitText[j];

      // Add the keyword to the block's keywords
      if (text && text !== '') {
        // Add a keyword to the search trie
        this.parent_.addToTrie(text, blockXml);

        // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
        this.parent_.blocksAdded_[blockXml].push(text);
      }
    }
  }
};

Blockly.ToolboxSearchHelper.prototype.generateFunctionBlock = function (funcName, funcArgs, hasReturnValue) {
  var blockType = (hasReturnValue) ? 'procedures_callreturn' : 'procedures_callnoreturn';
  // <block type="procedures_callnoreturn" gap="16">
  //   <mutation name="do something">
  //     <arg name="x"></arg>
  //   </mutation>
  // </block>
  var block = Blockly.utils.xml.createElement('block');
  block.setAttribute('type', blockType);

  // Function EXECUTION blocks hold all their info inside a "mutation"
  var mutation = Blockly.utils.xml.createElement('mutation');
  mutation.setAttribute('name', funcName);

  block.appendChild(mutation);

  for (var j = 0; j < funcArgs.length; j++) {
    var arg = Blockly.utils.xml.createElement('arg');
    arg.setAttribute('name', funcArgs[j]);
    mutation.appendChild(arg);
  }

  return Blockly.utils.xml.domToText(block);
};

Blockly.ToolboxSearchHelper.prototype.extractFunctionInfo = function (event) {
  var blockInfo = this.workspace_.getBlockById(event.blockId);
  var funcName = blockInfo.getFieldValue('NAME');
  var hasReturnValue = (blockInfo.type === 'procedures_defreturn');

  var funcArgs = [];

  for (var i = 0; i < blockInfo.arguments_.length; i++) {
    funcArgs.push(blockInfo.arguments_[i]);
  }

  var oldFuncName = '';
  if (event.element && event.element === 'field' && event.name === 'NAME') {
    oldFuncName = event.oldValue;
  }

  var oldArguments = [];
  if (event.element && event.element === 'mutation') {
    var oldMutationChildren = Blockly.Xml.textToDom(event.oldValue).children;
    for (var i = 0; i < oldMutationChildren.length; i++) {
      if (oldMutationChildren[i].tagName === 'arg') {
        oldArguments.push(oldMutationChildren[i].getAttribute('name'));
      }
    }
  }

  return [funcName, funcArgs, hasReturnValue, oldFuncName, oldArguments];
};

Blockly.ToolboxSearchHelper.prototype.extractDeletedBlockInfo = function (oldXml) {
  var funcName = '';
  var funcArgs = [];
  var hasReturnValue = (oldXml.getAttribute('type') === 'procedures_defreturn');

  var children = oldXml.children;
  for (var i = 0; i < children.length; i++) {
    if (children[i].tagName === 'field' && children[i].getAttribute('name') === 'NAME') {
      funcName = children[i].textContent;
      continue;
    }

    if (children[i].tagName === 'mutation') {
      var mutationChildren = children[i].children;
      for (var j = 0; j < mutationChildren.length; j++) {
        if (mutationChildren[i].tagName === 'arg') {
          var argName = mutationChildren[i].getAttribute('name');
          funcArgs.push(argName);
        }
      }
    }
  }

  return [funcName, funcArgs, hasReturnValue];
};