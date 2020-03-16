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

goog.provide('Blockly.ToolboxSearch');

goog.require('Blockly.Search');

/**
 * Initializes the search handler and its associated GUI.
 *
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 */
Blockly.ToolboxSearch = function (workspace) {
  // Initialize the search handler
  Blockly.ToolboxSearch.superClass_.constructor.call(
    this, workspace);

  var thisObj = this;

  // Add a workspace change listener (so function blocks that get added/removed to the workspace
  // will be available for "execution" in the toolbox
  this.workspace_.addChangeListener(function (event) {
    thisObj.onNewWorkspaceEvent(event);
  });
};
Blockly.utils.object.inherits(Blockly.ToolboxSearch, Blockly.Search);

Blockly.ToolboxSearch.prototype.init_ = function () {
  // Create flyout options.
  var flyoutWorkspaceOptions = {
    scrollbars: true,
    disabledPatternId: this.workspace_.options.disabledPatternId,
    parentWorkspace: this.workspace_,
    RTL: this.workspace_.RTL,
    oneBasedIndex: this.workspace_.options.oneBasedIndex,
    renderer: this.workspace_.options.renderer
  };

  // Create vertical or horizontal flyout.
  if (this.workspace_.horizontalLayout) {
    flyoutWorkspaceOptions.toolboxPosition =
        this.workspace_.toolboxPosition === Blockly.TOOLBOX_AT_TOP
          ? Blockly.TOOLBOX_AT_BOTTOM : Blockly.TOOLBOX_AT_TOP;
    if (!Blockly.HorizontalFlyout) {
      throw Error('Missing require for Blockly.HorizontalFlyout');
    }
    this.flyout_ = new Blockly.HorizontalFlyout(flyoutWorkspaceOptions);
  } else {
    flyoutWorkspaceOptions.toolboxPosition =
      this.workspace_.toolboxPosition === Blockly.TOOLBOX_AT_RIGHT
        ? Blockly.TOOLBOX_AT_LEFT : Blockly.TOOLBOX_AT_RIGHT;
    if (!Blockly.VerticalFlyout) {
      throw Error('Missing require for Blockly.VerticalFlyout');
    }
    this.flyout_ = new Blockly.VerticalFlyout(flyoutWorkspaceOptions);
  }

  Blockly.utils.dom.insertAfter(this.flyout_.createDom('svg'),
    this.workspace_.getParentSvg());
  this.flyout_.init(this.workspace_);
  this.flyout_.isBlockCreatable_ = function () {
    // All blocks, including disabled ones, can be dragged from the
    // search flyout.
    return true;
  };
};

/**
 * Event handler for whenever the Blockly workspace changes.
 * Specifically needed to add or remove blocks to the Search handler's trie
 * whenever the user adds or removes blocks from the workspace.
 *
 * @param {!Blockly.Event} event The Blockly event that got fired because of something changing in Blockly.
 */
Blockly.ToolboxSearch.prototype.onNewWorkspaceEvent = function (event) {
  var i;
  var blockData;

  // If a block was added to the workspace, add it's associated keywords to the handler's trie.
  if (event.type === Blockly.Events.CREATE) {
    // Decode the XML contents so any child blocks that also got added to the workspace get added to the trie as well,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksAdded = this.decodeXmlBlocks(event.xml);

    for (i = 0; i < blocksAdded.length; i++) {
      blockData = blocksAdded[i];

      if (blockData[0] && blockData[1]) {
        if (blockData[0] !== 'procedures_defnoreturn' &&
            blockData[0] !== 'procedures_defreturn') {
          return;
        }

        
        var info1 = this.extractFunctionInfo(event);
        console.log(info1);
        // this.onBlockAdded(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.DELETE) {
    // If a block was removed from the workspace, remove it's associated keywords from the handler's trie.
    // Decode the XML contents so any child blocks that got removed from the workspace also get removed from the trie,
    // e.g. for procedure blocks that hold multiple children inside them.
    var blocksRemoved = this.decodeXmlBlocks(event.oldXml);

    for (i = 0; i < blocksRemoved.length; i++) {
      blockData = blocksRemoved[i];

      if (blockData[0] && blockData[1]) {
        if (blockData[0] !== 'procedures_defnoreturn' &&
            blockData[0] !== 'procedures_defreturn') {
          return;
        }

        var info2 = this.extractDeletedBlockInfo(event.oldXml);
        console.log(info2);
        // this.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  } else if (event.type === Blockly.Events.CHANGE &&
            (event.element === 'field' || event.element === 'mutation')) {
    var blockInfo = this.workspace_.getBlockById(event.blockId);

    if (blockInfo.type !== 'procedures_defnoreturn' &&
        blockInfo.type !== 'procedures_defreturn') {
      return;
    }
    
    var info3 = this.extractFunctionInfo(event);
    console.log(info3);

    // var changedField = blockInfo.getField(event.name);
    var newName = event.newValue;
    var oldName = event.oldValue;

    // var name = procedureList[i][0];
    //   var args = procedureList[i][1];
    //   // <block type="procedures_callnoreturn" gap="16">
    //   //   <mutation name="do something">
    //   //     <arg name="x"></arg>
    //   //   </mutation>
    //   // </block>
    //   var block = Blockly.utils.xml.createElement('block');
    //   block.setAttribute('type', templateName);
    //   block.setAttribute('gap', 16);
    //   var mutation = Blockly.utils.xml.createElement('mutation');
    //   mutation.setAttribute('name', name);
    //   block.appendChild(mutation);
    //   for (var j = 0; j < args.length; j++) {
    //     var arg = Blockly.utils.xml.createElement('arg');
    //     arg.setAttribute('name', args[j]);
    //     mutation.appendChild(arg);
    //   }
    //   xmlList.push(block);
  }
};

Blockly.ToolboxSearch.prototype.extractFunctionInfo = function (event) {
  var blockInfo = this.workspace_.getBlockById(event.blockId);
  var funcName = blockInfo.getField('NAME');
  var funcArgs = blockInfo.arguments_;
  var hasReturnValue = (blockInfo.type === 'procedures_defreturn');

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

  return [funcName, oldFuncName, funcArgs, oldArguments, hasReturnValue];
};

Blockly.ToolboxSearch.prototype.extractDeletedBlockInfo = function (oldXml) {
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

/**
 * Adds a new block to the toolbox search handler's trie.
 * Extends the logic of its parent class (@see search.js) by including all "dropdown" options to the search.
 *
 * @param {!String} type The type ID of the block, e.g. "fable_play_sound".
 * @param {!String} val The block itself. Similar to addToTrie, will either be XML or the unique block ID.
 */
Blockly.ToolboxSearch.prototype.onBlockAdded = function (type, val) {
  Blockly.ToolboxSearch.superClass_.onBlockAdded.call(this, type, val);

  // If there are any extra keywords, add them to the trie. Otherwise, warn in the console.
  if (Blockly.Blocks[type].StaticToolboxSearchKeywords) {
    var extraKeys = Blockly.Blocks[type].StaticToolboxSearchKeywords;

    // See if the block has been initialized before
    if (!this.blocksAdded_[val]) {
      this.blocksAdded_[val] = [];
    }

    for (var j = 0; j < extraKeys.length; j++) {
      // Add a keyword to the search trie
      this.addToTrie(extraKeys[j], val);

      // Add the reverse information as well, i.e. add the keyword to the block's list of keywords
      this.blocksAdded_[val].push(extraKeys[j]);
    }
  } else {
    console.warn('Extra static keywords not found for block ' + type);
  }
};

/**
 * Inspect the contents of the trash.
 */
Blockly.ToolboxSearch.prototype.runSearch = function (inputVal) {
  var matchingBlocks = Blockly.WorkspaceSearch.superClass_.runSearch.call(this, inputVal);

  // // Create a label for the search results category
  // // TODO: Localization
  // var labelText = 'Search results:';
  // if (matchingBlocks.length === 0) {
  //   labelText = 'No results found';
  // }
  // var label = '<label web-class="subcategoryClass" text="' + labelText + '"></label>';

  // // Add the label to the flyout of results. Put it in the beginning.
  // matchingBlocks.splice(0, 0, label);

  for (let i = 0; i < matchingBlocks.length; i++) {
    matchingBlocks[i] = Blockly.Xml.textToDom(matchingBlocks[i]);
  }

  // Show the resulting XML in the flyout
  if (matchingBlocks.length > 0) {
    this.flyout_.show(matchingBlocks);
    this.flyout_.scrollToStart();

    return this.flyout_.workspace_.topBlocks_;
  }

  return [];
};
