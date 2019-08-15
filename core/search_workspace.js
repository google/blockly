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
 * @fileoverview Utility functions for handling searches within the Toolbox.
  * @author ivan@shaperobotics.com
 */
'use strict';

goog.provide('Blockly.SearchWorkspace');

goog.require('Blockly.Search');
// goog.require('goog.structs.Set');
// goog.require('goog.structs.Trie');
// goog.require('goog.ui.LabelInput');
// goog.require('goog.ui.tree.TreeNode');

 /**
 * Initializes the search button.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 * @param {!Blockly.Toolbox} toolbox The toolbox containing the search category.
 */
Blockly.SearchWorkspace = function(workspace) {
  Blockly.SearchWorkspace.superClass_.constructor.call(
    this, workspace);

  var thisObj = this;

  this.searchMenu_ = document.getElementById("workspaceSearchDiv");
  
  this.searchInput_ = document.getElementById("workspaceSearchInput");

  this.resultsNumberHolder_ = document.getElementById("resultsCount");
    
  this.buttonsHolder_ = document.getElementById("buttonsHolder");
  this.prevButton_ = document.getElementById("prevWorkspaceHolder");
  this.nextButton_ = document.getElementById("nextWorkspaceHolder");
  // let closeButton = document.getElementById("closeWorkspaceHolder");


  this.resultsNumberHolder_.style.minWidth = "0px";
  this.resultsNumberHolder_.style.maxWidth = "0px";
  this.buttonsHolder_.style.maxWidth = "0px";

  // thisObj.searchInput_ = document.createElement("input");
  // thisObj.searchInput_.setAttribute("id", "workspaceSearchInput");
  // thisObj.searchInput_.setAttribute("placeholder", "Search");
  // thisObj.searchInput_.setAttribute("type", "search");

  // document.getElementById("workspaceSearchInputHolder").appendChild(thisObj.searchInput_);
  this.workspace_.addChangeListener(function(event) {
    thisObj.onNewWorkspaceEvent(event); 
  });

  this.searchInput_.addEventListener("keydown", function(event) {
    event.stopPropagation();
  });

  this.searchInput_.addEventListener("click", function(event) {
    event.stopPropagation();

    thisObj.resultsNumberHolder_.style.minWidth = "50px";
    thisObj.resultsNumberHolder_.style.maxWidth = "50px";
    thisObj.buttonsHolder_.style.maxWidth = "140px";
  });

  this.searchInput_.addEventListener("blur", function(event) {
    if (event.relatedTarget && 
      ((event.relatedTarget.id && event.relatedTarget.id == "workspaceSearchDiv") || 
      (event.relatedTarget.id && event.relatedTarget.id == "resultsCount") || 
      (event.relatedTarget.id && event.relatedTarget.id == "prevWorkspaceHolder") || 
      (event.relatedTarget.id && event.relatedTarget.id == "nextWorkspaceHolder") || 
      (event.relatedTarget.id && event.relatedTarget.id == "closeWorkspaceHolder"))) {
        event.stopPropagation();
        thisObj.focusSearchField();
        return;
      }
      
      thisObj.onBlur(event);
  });

  this.searchInput_.addEventListener("search", function(event) {
    event.preventDefault();
    
    if (thisObj.searchInput_.value.length == 0) {
      thisObj.searchInput_.blur();
      thisObj.onBlur(event);
      return;
    }

    // thisObj.executeSearchOnKeyUp(event, thisObj);
  });

  this.searchInput_.addEventListener("keyup", function(event) {
    thisObj.executeSearchOnKeyUp(event, thisObj);
  });


  this.nextButton_.addEventListener("click", function(event) { 
    event.preventDefault();
    thisObj.showNextResult(true);
  });

  this.prevButton_.addEventListener("click", function(event) { 
    event.preventDefault();
    thisObj.showNextResult(false);
  });

  // closeButton.addEventListener("click", function(event) { 
  //   event.preventDefault();
  //   thisObj.searchInput_.blur();
  //   thisObj.onBlur(event);
  // });
};
goog.inherits(Blockly.SearchWorkspace, Blockly.Search);

// Blockly.SearchWorkspace.prototype.onNewWorkspaceEvent = function(event) {
//   if (event.type == Blockly.Events.CREATE) {
//     for (var i = 0; i < event.ids.length; i++) {
//       var id = event.ids[i];
//       var block = this.workspace_.getBlockById(id);

//       if (block) {
//         this.onBlockAdded(block.type, block.id);
//       }
//     }
//   }
//   else if (event.type == Blockly.Events.DELETE) {
//     Blockly.Events.disable();

//     // for (var i = 0; i < event.ids.length; i++) {
//     var block = Blockly.Xml.domToBlockHeadless_(event.oldXml, this.workspace_);
//     if (block) {
//       this.onBlockRemoved(block.type, block.id);
//       block.dispose();
//     }

//     Blockly.Events.enable();
//   }
// };

Blockly.SearchWorkspace.prototype.onNewWorkspaceEvent = function(event) {
  if (event.type == Blockly.Events.CREATE) {
    var blocksAdded = this.decodeXmlBlocks(event.xml);

    for (var i = 0; i < blocksAdded.length; i++) {
      var blockData = blocksAdded[i];

      if (blockData[0] && blockData[1]) {
        this.onBlockAdded(blockData[0], blockData[1]);
      }
    }
  }
  else if (event.type == Blockly.Events.DELETE) {
    var blocksRemoved = this.decodeXmlBlocks(event.oldXml);

    for (var i = 0; i < blocksRemoved.length; i++) {
      var blockData = blocksRemoved[i];

      if (blockData[0] && blockData[1]) {
        this.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  }
};

Blockly.SearchWorkspace.prototype.decodeXmlBlocks = function(xmlBlock) {
  var allBlocks = [];

  var nodeName = xmlBlock.nodeName;

  if (nodeName.toUpperCase() != 'BLOCK' && 
      nodeName.toUpperCase() != 'SHADOW') {
    return allBlocks;
  }

  var topMostBlockType = xmlBlock.getAttribute('type');
  var id = xmlBlock.getAttribute('id');
  
  allBlocks.push([topMostBlockType, id]);

  for (var i = 0, xmlChild; xmlChild = xmlBlock.childNodes[i]; i++) {
    if (xmlChild.nodeType == 3) {
      // Ignore any text at the <block> level.  It's all whitespace anyway.
      continue;
    }

    // Find any enclosed blocks or shadows in this tag.
    var childBlockElement = null;
    var childShadowElement = null;

    for (var j = 0, grandchild; grandchild = xmlChild.childNodes[j]; j++) {
      if (grandchild.nodeType == 1) {
        if (grandchild.nodeName.toLowerCase() == 'block') {
          childBlockElement = /** @type {!Element} */ (grandchild);
        } else if (grandchild.nodeName.toLowerCase() == 'shadow') {
          childShadowElement = /** @type {!Element} */ (grandchild);
        }
      }
    }
    // Use the shadow block if there is no child block.
    if (!childBlockElement && childShadowElement) {
      childBlockElement = childShadowElement;
    }

    switch (xmlChild.nodeName.toLowerCase()) {
      default:
        break;
      case 'value':
      case 'statement':
      case 'next':
        if (childBlockElement) {
          var blockChild = this.decodeXmlBlocks(childBlockElement);
          
          for (var k = 0, grandchild; grandchild = blockChild[k]; k++) {
            allBlocks.push(grandchild);
          }
        }
        break;
    }
  }

  return allBlocks;
};

Blockly.SearchWorkspace.prototype.executeSearchOnKeyUp = function(e) {
  var search = this;

  //Clear the search and unfocus the search box.
  if (e.keyCode == 27) {
    search.searchInput_.blur();
    search.onBlur(e);
    return;
  }
  else if (e.keyCode == 13) {
    search.showNextResult(true);
    return;
  }

  var searchTerms = e.target.value.trim().toLowerCase().split(/\s+/);

  searchTerms = goog.array.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  var matchingBlockIds = [];

  search.finalResults_ = [];

  if (searchTerms.length > 0) {
    matchingBlockIds = search.blocksMatchingSearchTerms(searchTerms);
  }

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    while (counter < matchingBlockIds.length) {
        var block = search.workspace_.getBlockById(matchingBlockIds[counter]);
        
        if (block) {
          search.finalResults_.push(block);
        }

        counter++;
    }
  }

  search.finalResults_.sort(Blockly.Workspace.prototype.sortObjects_);

  search.currentIndex = -1;
  search.showNextResult(true);
};

Blockly.SearchWorkspace.prototype.showNextResult = function(direction) {
  var search = this;

  if (search.finalResults_.length == 0) {
    search.workspace_.highlightBlock("");
    if (search.currentResult) {
        search.currentResult.unselect();
    }
    search.resultsNumberHolder_.innerHTML = "0/0";
    // search.nextButton_.disabled = true;
    // search.prevButton_.disabled = true;
    return;
  }

  // search.nextButton_.disabled = false;
  // search.prevButton_.disabled = false;

  if (direction) {
    search.currentIndex++;
  }
  else {
    search.currentIndex--;
  }

  if (search.finalResults_.length <= search.currentIndex) {
    search.currentIndex = 0;
  }
  else if (search.currentIndex < 0) {
    search.currentIndex = search.finalResults_.length - 1;
  }

  search.resultsNumberHolder_.innerHTML = (search.currentIndex + 1) + "/" + (search.finalResults_.length);

  search.currentResult = search.finalResults_[search.currentIndex];
  search.currentResult.select();
  search.workspace_.centerOnBlock(search.currentResult.id);
  search.workspace_.highlightBlock(search.currentResult.id);
  return;
};

Blockly.SearchWorkspace.prototype.onBlur = function(e) {
  var search = this;
  search.workspace_.highlightBlock("");

  if (search.currentResult) {
      search.currentResult.unselect();
  }

  search.searchInput_.value = "";

  search.resultsNumberHolder_.innerHTML = "";

  // search.searchMenu_.style.visibility = "hidden";
  search.resultsNumberHolder_.style.minWidth = "0px";
  search.resultsNumberHolder_.style.maxWidth = "0px";
  search.buttonsHolder_.style.maxWidth = "0px";

  search.finalResults_ = [];
};

Blockly.SearchWorkspace.prototype.focusSearchField = function() {
  // this.searchMenu_.style.visibility = "visible";
  this.resultsNumberHolder_.style.minWidth = "50px";
  this.resultsNumberHolder_.style.maxWidth = "50px";
  this.buttonsHolder_.style.maxWidth = "140px";

  this.searchInput_.focus();
};