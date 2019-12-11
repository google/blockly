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

goog.provide('Blockly.SearchWorkspace');

goog.require('Blockly.Search');

 /**
 * Initializes the search handler and its associated GUI.
 * 
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 */
Blockly.SearchWorkspace = function(workspace) {
  //Initialize the search handler
  Blockly.SearchWorkspace.superClass_.constructor.call(
    this, workspace);

  var thisObj = this;

  //Get the GUI elements
  this.searchMenu_ = document.getElementById("workspaceSearchDiv");

  this.searchInput_ = document.getElementById("workspaceSearchInput");

  this.resultsNumberHolder_ = document.getElementById("resultsCount");
    
  this.buttonsHolder_ = document.getElementById("buttonsHolder");
  this.prevButton_ = document.getElementById("prevWorkspaceHolder");
  this.nextButton_ = document.getElementById("nextWorkspaceHolder");

  //Set some styling (for an expanding animation)
  this.resultsNumberHolder_.style.minWidth = "0px";
  this.resultsNumberHolder_.style.maxWidth = "0px";
  this.buttonsHolder_.style.maxWidth = "0px";

  //Add a workspace change listener (so blocks get added/removed to a trie when 
  //the user adds/removes them to/from the workspace)
  this.workspace_.addChangeListener(function(event) {
    thisObj.onNewWorkspaceEvent(event); 
  });

  //Add more event listeners
  this.searchInput_.addEventListener("keydown", function(event) {
    event.stopPropagation();
  });

  this.searchInput_.addEventListener("click", function(event) {
    event.stopPropagation();

    //Change the styling to trigger the expanding animation
    thisObj.resultsNumberHolder_.style.minWidth = "50px";
    thisObj.resultsNumberHolder_.style.maxWidth = "50px";
    thisObj.buttonsHolder_.style.maxWidth = "140px";
  });

  //Add an event listener for when the user clicks outside the search bar
  this.searchInput_.addEventListener("blur", function(event) {
    //Specifically check for the search bar's children elements. Do NOT blur if those are clicked.
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
      
      thisObj.lastSearchValue_ = "";
      thisObj.onBlur(event);
  });

  this.searchInput_.addEventListener("search", function(event) {
    event.preventDefault();
    
    if (thisObj.searchInput_.value.length == 0) {
      thisObj.lastSearchValue_ = "";
      thisObj.searchInput_.blur();
      thisObj.onBlur(event);
      return;
    }

    // thisObj.executeSearchOnKeyUp(event, thisObj);
  });

  //Execute the search on a keyup event
  this.searchInput_.addEventListener("keyup", function(event) {
    thisObj.executeSearchOnKeyUp(event, thisObj);
  });

  //Event listener for clicking the "next" button. Will try to show the next result, if one exists.
  this.nextButton_.addEventListener("click", function(event) { 
    event.preventDefault();
    thisObj.showNextResult(true);
  });

  //Event listener for clicking the "previous" button. Will try to show the previous result, if one exists.
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

//Old way of handling the workspace changes. Might have to re-add it if we change the logic too dramatically.
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

/**
 * Event handler for whenever the Blockly workspace changes.
 * Specifically needed to add or remove blocks to the Search handler's trie
 * whenever the user adds or removes blocks from the workspace.
 * 
 * @param {!Blockly.Event} event The Blockly event that got fired because of something changing in Blockly.
 */
Blockly.SearchWorkspace.prototype.onNewWorkspaceEvent = function(event) {
  //If a block was added to the workspace, add it's associated keywords to the handler's trie.
  if (event.type == Blockly.Events.CREATE) {
    //Decode the XML contents so any child blocks that also got added to the workspace get added to the trie as well,
    //e.g. for procedure blocks that hold multiple children inside them.
    var blocksAdded = this.decodeXmlBlocks(event.xml);

    for (var i = 0; i < blocksAdded.length; i++) {
      var blockData = blocksAdded[i];

      if (blockData[0] && blockData[1]) {
        this.onBlockAdded(blockData[0], blockData[1]);
      }
    }
  }
  //If a block was removed from the workspace, remove it's associated keywords from the handler's trie.
  else if (event.type == Blockly.Events.DELETE) {
    //Decode the XML contents so any child blocks that got removed from the workspace also get removed from the trie,
    //e.g. for procedure blocks that hold multiple children inside them.
    var blocksRemoved = this.decodeXmlBlocks(event.oldXml);

    for (var i = 0; i < blocksRemoved.length; i++) {
      var blockData = blocksRemoved[i];

      if (blockData[0] && blockData[1]) {
        this.onBlockRemoved(blockData[0], blockData[1]);
      }
    }
  }
};

/**
 * Utility function that decode's a Blockly event's XML contents.
 * Used to find all blocks that got simultaneously added/removed in the same Blockly event.
 * 
 * Loosely based on Blockly.Xml.domToBlockHeadless_, with the main 
 * difference that it doesn't create any new blocks (so it avoids creating the block that was just created AGAIN).
 * 
 * @param {!String} xmlBlock XML of the block. Provided by the Blockly event.
 */
Blockly.SearchWorkspace.prototype.decodeXmlBlocks = function(xmlBlock) {
  var allBlocks = [];

  var nodeName = xmlBlock.nodeName;

  //Skip XML elements that are not blocks or shadow blocks
  if (nodeName.toUpperCase() != 'BLOCK' && 
      nodeName.toUpperCase() != 'SHADOW') {
    return allBlocks;
  }

  //Add the topmost block of the provided XML
  var topMostBlockType = xmlBlock.getAttribute('type');
  var id = xmlBlock.getAttribute('id');
  
  allBlocks.push([topMostBlockType, id]);

  //Go through the children of the topmost block
  for (var i = 0, xmlChild; xmlChild = xmlBlock.childNodes[i]; i++) {
    if (xmlChild.nodeType == 3) {
      // Ignore any text at the <block> level.  It's all whitespace anyway.
      continue;
    }

    // Find any enclosed blocks or shadows in this tag.
    var childBlockElement = null;
    var childShadowElement = null;

    //Get the current child. Either a block or a shadow block
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

    //If the element is a value, statement, or next element, then it might have further child blocks inside.
    //Recursively call the same function to get those potential inner blocks.
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

/**
 * Event handler for executing a search. Happens upon the user adding a new character (or removing one, as well).
 * 
 */
Blockly.SearchWorkspace.prototype.executeSearchOnKeyUp = function(e) {
  var search = this;

  //If the user pressed Escape, clear the search and unfocus the search box.
  if (e.keyCode == 27) {
    search.lastSearchValue_ = "";
    search.searchInput_.blur();
    search.onBlur(e);
    return;
  }
  //If the user pressed Enter, show the next result (or previous when Shift + Enter)
  else if (e.keyCode == 13) {
    search.showNextResult(!e.shiftKey);
    return;
  }

  //Get the text inside the search bar
  let searchBarValue = e.target.value;

  //Do NOT continue with the search if nothing changed in the text inside the search bar
  if (search.lastSearchValue_ && searchBarValue == search.lastSearchValue_) {
    return;
  }

  //Save the user's saved text
  search.lastSearchValue_ = searchBarValue;

  //Prepare the contents of the search by trimming, lowercasing and splitting by whitespace
  var searchTerms = search.lastSearchValue_.trim().toLowerCase().split(/\s+/);

  //Remove those elements of the search terms that are empty (so no empty strings are in the search)
  searchTerms = goog.array.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  //Initialize a list that will hold the results
  search.finalResults_ = [];

  //Temporary list for results
  var matchingBlockIds = [];

  if (searchTerms.length > 0) {
    matchingBlockIds = search.blocksMatchingSearchTerms(searchTerms);
  }

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    //Go through the temporary results
    while (counter < matchingBlockIds.length) {
      //Search for the block inside the workspace
      var block = search.workspace_.getBlockById(matchingBlockIds[counter]);
      
      //Only add the block if it is found (could be that the workspace has hidden blocks inside it?)
      if (block) {
        search.finalResults_.push(block);
      }

      counter++;
    }
  }

  //Sort the final results by the sortObjects_ function. It uses the physical 
  //location of blocks so blocks on top of other blocks are always first.
  search.finalResults_.sort(Blockly.Workspace.prototype.sortObjects_);

  //Show the first result, if possible
  search.currentIndex = -1;
  search.showNextResult(true);
};

/**
 * Hightlights the next (or previous) result from a search.
 * Unhighlights the previously shown result.
 * 
 * @param {!Boolean} direction If true, will show next result. If false, will show previous result.
 */
Blockly.SearchWorkspace.prototype.showNextResult = function(direction) {
  var search = this;

  //If no results were found, do not hightlight anything. Unhighlight any previously highlighted blocks
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

  //Determine whether the next or previous block will be shown
  if (direction) {
    search.currentIndex++;
  }
  else {
    search.currentIndex--;
  }

  //Wrap around to the start (or end) of the results if 
  //"next" if pressed after the last block was shown
  if (search.finalResults_.length <= search.currentIndex) {
    search.currentIndex = 0;
  }
  else if (search.currentIndex < 0) {
    search.currentIndex = search.finalResults_.length - 1;
  }

  //Show the number of results
  search.resultsNumberHolder_.innerHTML = (search.currentIndex + 1) + "/" + (search.finalResults_.length);

  //Hightlight the block (and move the workspace to show it in the center)
  search.currentResult = search.finalResults_[search.currentIndex];
  search.currentResult.select();
  search.workspace_.centerOnBlock(search.currentResult.id);
  search.workspace_.highlightBlock(search.currentResult.id);
  return;
};

/**
 * Event handler for whenever the user moves out of the search bar.
 * Unhighlights all blocks and starts the shrinking animation of the search bar.
 */
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

/**
 * Event handler for focusing the search bar in the top menu bar.
 * Starts the expand animation of the bar and focuses it so the user can type in it.
 */
Blockly.SearchWorkspace.prototype.focusSearchField = function() {
  // this.searchMenu_.style.visibility = "visible";
  this.resultsNumberHolder_.style.minWidth = "50px";
  this.resultsNumberHolder_.style.maxWidth = "50px";
  this.buttonsHolder_.style.maxWidth = "140px";

  this.searchInput_.focus();
};