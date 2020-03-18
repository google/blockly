/**
 * @fileoverview Helper for the toolbox search handler.
 * Checks for any functions made by the user and adds a "execute function x" blocks
 * to the toolbox search.
 * Additionally, update and remove those function blocks that get changed or deleted by the user.
 *
 * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.ToolboxSearchHelper');

goog.require('Blockly.Search');

/**
 * @param {Blockly.ToolboxSearch} parent - The toolbox search handler that this helper will, well, help.
 * @param {Blockly.WorkspaceSvg} workspace - Main Blockly workspace.
 * It's the workspace in which the user will create/edit function blocks.
 */
Blockly.ToolboxSearchHelper = function (parent, workspace) {
  this.workspace_ = workspace;
  this.parent_ = parent;

  var thisObj = this;

  // Add a workspace change listener (so function blocks that get added/removed to the workspace
  // will be available for "execution" in the toolbox
  this.workspace_.addChangeListener(function (event) {
    thisObj.onNewWorkspaceEvent(event);
  });
};

/**
 * Event handler for whenever the Blockly workspace changes.
 * Specifically needed to add or remove FUNCTION blocks to the Search handler's trie
 * whenever the user adds, changes or removes FUNCTION blocks from the workspace.
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

      // If the block was NOT a function definition, we are done. No work needed.
      if (blockData[0] && blockData[1]) {
        if (blockData[0] !== 'procedures_defnoreturn' &&
            blockData[0] !== 'procedures_defreturn') {
          return;
        }

        // Get the function block's information
        var newBlockInfo = this.extractFunctionInfo(event);

        // Set the information about this function block
        blockData[0] = (newBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
        blockData[1] = this.generateFunctionBlock(newBlockInfo[0], newBlockInfo[1], newBlockInfo[2]);

        // Add the block's XML to the trie. Associate it with the block's type for now
        this.parent_.onBlockAdded(blockData[0], blockData[1]);
        // Now, add all of the keywords (the function name and all of the parameters) to the trie.
        this.addFunctionKeywords(blockData[1], newBlockInfo[0], newBlockInfo[1]);
      }
    }
  } else if (event.type === Blockly.Events.DELETE) {
    // If a FUNCTION block was removed from the workspace, remove it's associated keywords from the handler's trie.

    // Decode the XML contents so any child blocks that got removed from the workspace also get removed from the trie,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksRemoved = this.parent_.decodeXmlBlocks(event.oldXml);

    for (i = 0; i < blocksRemoved.length; i++) {
      blockData = blocksRemoved[i];

      // If the removed block is NOT a function block, we are done. No work needed.
      if (blockData[0] && blockData[1]) {
        if (blockData[0] !== 'procedures_defnoreturn' &&
            blockData[0] !== 'procedures_defreturn') {
          return;
        }

        // Get the block's information
        var deletedBlockInfo = this.extractDeletedBlockInfo(event.oldXml);

        // Generate the block type and the XML of the deleted function block
        blockData[0] = (deletedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');
        blockData[1] = this.generateFunctionBlock(deletedBlockInfo[0], deletedBlockInfo[1], deletedBlockInfo[2]);

        // Remove the block from the trie.
        this.parent_.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.CHANGE &&
            (event.element === 'field' || event.element === 'mutation')) {
    // If the function block changed, we need to update its keywords.
    // If the function name changed, we need to replace the old name with the new one
    // If any of the arguments changed, we need to do the same.

    // Get the block that was modified by the user
    var blockInfo = this.workspace_.getBlockById(event.blockId);

    // If the changed block is NOT a function block, we are done. No work needed.
    if (blockInfo.type !== 'procedures_defnoreturn' &&
        blockInfo.type !== 'procedures_defreturn') {
      return;
    }

    // Get the block's information
    var changedBlockInfo = this.extractFunctionInfo(event);

    if (changedBlockInfo[3] !== '' && event.element === 'field') {
      // If the function name changed, generate the XML of the old block with the old function name
      var blockToRemove = this.generateFunctionBlock(changedBlockInfo[3], changedBlockInfo[1], changedBlockInfo[2]);
      var blockToRemoveType = (changedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');

      // And remove that block from the trie
      this.parent_.onBlockRemoved(blockToRemoveType, blockToRemove);
    } else if (changedBlockInfo[4].length > 0 && event.element === 'mutation') {
      // If the arguments changed, generate the XML of the old block with the old arguments
      var blockWithArgsToRemove = this.generateFunctionBlock(changedBlockInfo[0], changedBlockInfo[4], changedBlockInfo[2]);
      var blockWithArgsToRemoveType = (changedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');

      // And remove that block from the trie
      this.parent_.onBlockRemoved(blockWithArgsToRemoveType, blockWithArgsToRemove);
    }

    // Finally, generate the XML of the new function block
    var blockToAdd = this.generateFunctionBlock(changedBlockInfo[0], changedBlockInfo[1], changedBlockInfo[2]);
    var blockToAddType = (changedBlockInfo.hasReturnValue ? 'procedures_callreturn' : 'procedures_callnoreturn');

    // And add the block's XML to the trie. Associate it with the block's type for now
    this.parent_.onBlockAdded(blockToAddType, blockToAdd);
    // Now, add all of the keywords (the function name and all of the parameters) to the trie.
    this.addFunctionKeywords(blockToAdd, changedBlockInfo[0], changedBlockInfo[1]);
  }
};

/**
 * Extracts all vital info about a function - it's name, arguments, and whether it returns or not.
 * Does so after a CREATE or CHANGE Blockly event.
 * Extracts the info from a "function definition" block.
 *
 * @param {Blockly.Event} event - Blockly event that we want to extract the info from.
 *
 * @returns {Array<Object>} - An object which has the function name, the arguments,
 * whether it returns or not, and any old function names and arguments (if they exist).
 */
Blockly.ToolboxSearchHelper.prototype.extractFunctionInfo = function (event) {
  // Get the block from the workspace
  var blockInfo = this.workspace_.getBlockById(event.blockId);

  // If the block isn't found or if it's not a function block, do nothing.
  if (!blockInfo ||
     (blockInfo.type !== 'procedures_defnoreturn' &&
      blockInfo.type !== 'procedures_defreturn')) {
    // Return an empty state
    return ['', [], false, '', []];
  }

  // Get the function's name from the NAME field
  var funcName = blockInfo.getFieldValue('NAME');

  // Get the type of the function - whether it returns or not
  var hasReturnValue = (blockInfo.type === 'procedures_defreturn');

  // Initialize the arguments array
  var funcArgs = [];

  // Go through any arguments the function has and add them
  // NOTE: Local copy because I ran into some reference issues when I wrote funcArgs = blockInfo.arguments_;
  for (var i = 0; i < blockInfo.arguments_.length; i++) {
    funcArgs.push(blockInfo.arguments_[i]);
  }

  // If the block was changed, and the function name was changed, get the old one
  var oldFuncName = '';
  if (event.element && event.element === 'field' && event.name === 'NAME') {
    oldFuncName = event.oldValue;
  }

  // If the block was changed, and the function's arguments changed, get the old ones
  var oldArguments = [];
  if (event.element && event.element === 'mutation') {
    // Get the old XML of the arguments
    var oldMutationChildren = Blockly.Xml.textToDom(event.oldValue).children;

    // Iterate through the old arguments and add them to the list
    for (var j = 0; j < oldMutationChildren.length; j++) {
      if (oldMutationChildren[j].tagName === 'arg') {
        oldArguments.push(oldMutationChildren[j].getAttribute('name'));
      }
    }
  }

  // Return the final result
  return [funcName, funcArgs, hasReturnValue, oldFuncName, oldArguments];
};

/**
 * After a DELETE Blockly event, extracts all vital info about a function -
 * it's name, arguments, and whether it returns or not.
 *
 * Similar function to `extractFunctionInfo` but different since the event gives us old information -
 * the block doesn't exist anymore, so it cannot be retrieved from the workspace.
 *
 * @param {Blockly.Event} event - Blockly event that we want to extract the info from.
 *
 * @returns {Array<Object>} - An object which has the function name, the arguments,
 * whether it returns or not.
 */
Blockly.ToolboxSearchHelper.prototype.extractDeletedBlockInfo = function (oldXml) {
  // Define the object that will be returned
  var funcName = '';
  var funcArgs = [];
  var hasReturnValue = (oldXml.getAttribute('type') === 'procedures_defreturn');

  // Go through all children of the block's XML
  var children = oldXml.children;
  for (var i = 0; i < children.length; i++) {
    // If the child is the NAME field, it's the function name
    if (children[i].tagName === 'field' && children[i].getAttribute('name') === 'NAME') {
      funcName = children[i].textContent;
      continue;
    }

    // If the child is a mutation, it's the arguments.
    if (children[i].tagName === 'mutation') {
      var mutationChildren = children[i].children;

      // Iterate through the arguments
      for (var j = 0; j < mutationChildren.length; j++) {
        if (mutationChildren[i].tagName === 'arg') {
          var argName = mutationChildren[i].getAttribute('name');
          funcArgs.push(argName);
        }
      }
    }
  }

  // Return the final result
  return [funcName, funcArgs, hasReturnValue];
};

/**
 * Adds all "dynamic" words of a function block to the toolbox search's trie.
 * This is needed since the "execute" function block is NOT the definition block that the user dragged.
 * Also, it's needed since the toolbox search does not usually work with dynamic words, just static.
 *
 * @param {String} blockXml - The XML of the "execute function" block.
 * @param {String} funcName - The name of the function that blockXml defines and executes.
 * @param {Array<String>} funcArgs - An array of all arguments that the function has.
 */
Blockly.ToolboxSearchHelper.prototype.addFunctionKeywords = function (blockXml, funcName, funcArgs) {
  // See if the block has been initialized before
  if (!this.parent_.blocksAdded_[blockXml]) {
    console.warn('the following block wasn\'t added to the search trie before:\n' + blockXml);
    this.parent_.blocksAdded_[blockXml] = [];
  }

  // Add the function's name to the array (just so we don't create another list)
  funcArgs.push(funcName);

  // Go through all keywords
  for (var i = 0; i < funcArgs.length; i++) {
    // Clean up the string and split it in separate words
    const splitText = funcArgs[i].trim().toLowerCase().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').split(' ');

    // Iterate through each word
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

/**
 * Generate the XML of a "execute function" block based on its name, type and arguments.
 *
 * @todo Experiment with using strings directly, instead of XML manipulation.
 *
 * @param {String} funcName - Name of the function.
 * @param {Array<String>} funcArgs - An array of all the arguments that the function has. Empty if no arguments.
 * @param {boolean} hasReturnValue - Whether executing this function returns something or if the function is void.
 *
 * @returns {String} String of the XML representation of the "execute function" block.
 */
Blockly.ToolboxSearchHelper.prototype.generateFunctionBlock = function (funcName, funcArgs, hasReturnValue) {
  var blockType = (hasReturnValue) ? 'procedures_callreturn' : 'procedures_callnoreturn';

  // Create the block in XML
  var block = Blockly.utils.xml.createElement('block');

  // Set the block's type (procedures_callreturn or procedures_callnoreturn)
  block.setAttribute('type', blockType);

  // Add the function name (Note: execution blocks hold the function name inside a mutation)
  var mutation = Blockly.utils.xml.createElement('mutation');
  mutation.setAttribute('name', funcName);

  // Add the function name as a child of the block
  block.appendChild(mutation);

  // Go through the arguments and add them to the XML
  for (var j = 0; j < funcArgs.length; j++) {
    var arg = Blockly.utils.xml.createElement('arg');
    arg.setAttribute('name', funcArgs[j]);
    mutation.appendChild(arg);
  }

  // Stringify the XML and return it
  return Blockly.utils.xml.domToText(block);
};
