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

goog.provide('Blockly.Search');

goog.require('goog.structs.Set');
goog.require('goog.structs.Trie');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.tree.TreeNode');

 /**
 * Initializes the search button.
 * @param {!Blockly.Workspace} workspace The workspace in which to create the button callback.
 * @param {!Blockly.Toolbox} toolbox The toolbox containing the search category.
 */
Blockly.Search = function(workspace) {
  this.workspace_ = workspace;
  var thisObj = this;

  setTimeout(function() {
    if (thisObj.workspace_.isFlyout) {
      return;
    }

    thisObj.searchInput_ = document.createElement("input");
    thisObj.searchInput_.setAttribute("id", "workspaceSearchInput");
    thisObj.searchInput_.setAttribute("placeholder", "Search");
    document.getElementsByClassName("injectionDiv")[0].appendChild(thisObj.searchInput_);
    
    thisObj.blockTrie_ = new goog.structs.Trie;
    
    thisObj.workspace_.addChangeListener(function(event) {
      thisObj.onNewWorkspaceEvent(event); 
    });

    thisObj.searchInput_.addEventListener("keydown", function(event) {
      event.stopPropagation();
    });

    thisObj.searchInput_.addEventListener("click", function(event) {
      event.stopPropagation();
    });

    thisObj.searchInput_.addEventListener("blur", function(event) {
      thisObj.onBlur(event);
    })

    thisObj.searchInput_.addEventListener("keyup", function(event) {
      thisObj.executeSearchOnKeyUp(event, thisObj);
    });
  }, 0);
};

Blockly.Search.prototype.onNewWorkspaceEvent = function(event) {
  console.log(event);

  if (event.type == Blockly.Events.CREATE) {
    console.log("CREATE");
    console.log(event.blockId);
    console.log(event.ids);
    for (var i = 0; i < event.ids.length; i++) {
      var id = event.ids[i];
      var block = this.workspace_.getBlockById(id);

      if (block) {
        this.onBlockAdded(block);
      }
    }
  }
  else if (event.type == Blockly.Events.DELETE) {
    console.log("DELETE");
    console.log(event.blockId);
    console.log(event.oldXml);

    Blockly.Events.disable();

    // for (var i = 0; i < event.ids.length; i++) {
    var block = Blockly.Xml.domToBlockHeadless_(event.oldXml, this.workspace_);
    if (block) {
      this.onBlockRemoved(block);
      block.dispose();
    }
   // }

    Blockly.Events.enable();
  }
  else if (event.type == Blockly.Events.CHANGE) {
    console.log("CHANGE");
    console.log(event.blockId);
    console.log(event.element);
    console.log(event.oldValue);
    console.log(event.newValue);
  }
};

Blockly.Search.prototype.getAllFieldTexts = function(block) {
  var texts = [];

  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    
    for (var j = 0; j < input.fieldRow.length; j++) {
      var field = input.fieldRow[j];
      var fieldText = field.getText();
      var splitFieldText = fieldText.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi ,'').split(' ');
      
      for (var k = 0; k < splitFieldText.length; k++) {
        var text = splitFieldText[k];
        if (text && text != '') {
          texts.push(text);
        }
      }
    }
  }

  return texts;
};

Blockly.Search.prototype.getAllKeys = function(block) {
  var keys = [block.type].concat(this.getAllFieldTexts(block));

  var tooltip;
  if (block.tooltip) {
    if (typeof block.tooltip === 'function') {
      tooltip = block.tooltip();
    } else {
      tooltip = block.tooltip;
    }

    if (tooltip) {
      var splitTooltip = tooltip.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi ,'').split(' ');

      for (var i = 0; i < splitTooltip.length; i++) {
        var text = splitTooltip[i];
        if (text && text != '') {
          keys.push(text);
        }
      }
    }
  }

  return goog.array.map(keys, function (key) {
    return key.toLowerCase();
  });
};

Blockly.Search.prototype.addToTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    this.blockTrie_.add(key, []);
  }

  this.blockTrie_.set(key, this.blockTrie_.get(key).concat(value));
};

Blockly.Search.prototype.removeFromTrie = function(key, value) {
  if (!this.blockTrie_.containsKey(key)) {
    return;
  }

  if (value in this.blockTrie_.get(key)) {
    this.blockTrie_.set(key, this.blockTrie_.get(key).pop(value));
  }
}

Blockly.Search.prototype.onBlockAdded = function(block) {
  var keys = this.getAllKeys(block);

  for (var j = 0; j < keys.length; j++) {
    this.addToTrie(keys[j], block.id);
  }
};

Blockly.Search.prototype.onBlockRemoved = function(block) {
  var keys = this.getAllKeys(block);
  
  for (var j = 0; j < keys.length; j++) {
    this.removeFromTrie(keys[j], block.id);
  }
};

Blockly.Search.prototype.blocksMatchingSearchTerm = function(term) {
  if (!this.blockTrie_) {
    return [];
  }

  var keys = this.blockTrie_.getKeys(term.toLowerCase());
  var blocks = [];

    for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var blocksForKey = this.blockTrie_.get(key);

    for (var j = 0; j < blocksForKey.length; j++) {
      blocks.push(blocksForKey[j]);
    }
  }

  return blocks;
}

Blockly.Search.prototype.blocksMatchingSearchTerms = function(terms) {
  var intersectingMatches = null;

    for (var i = 0; i < terms.length; i++) {
    var matchSet = new goog.structs.Set(this.blocksMatchingSearchTerm(terms[i]));
    if (intersectingMatches) {
      intersectingMatches = intersectingMatches.intersection(matchSet);
    } else {
      intersectingMatches = matchSet;
    }
  }

    return intersectingMatches.getValues();
};

Blockly.Search.prototype.executeSearchOnKeyUp = function(e) {
  var search = this;

  //Clear the search and unfocus the search box.
  if (e.keyCode == 27) {
    search.searchInput_.blur();
    search.onBlur(e);
    return;
  }

  var searchTerms = e.target.value.trim().toLowerCase().split(/\s+/);
  searchTerms = goog.array.filter(searchTerms, function (term) {
    return term.length > 0;
  });

  var matchingBlockIds = [];

  if (searchTerms.length > 0) {
    matchingBlockIds = search.blocksMatchingSearchTerms(searchTerms);
  }

  if (matchingBlockIds.length > 0) {
    var counter = 0;

    while (counter < matchingBlockIds.length) {
        
        var firstBlock = search.workspace_.getBlockById(matchingBlockIds[counter]);
        
        if (firstBlock) {
            search.currentResult = firstBlock;
            firstBlock.select();
            search.workspace_.centerOnBlock(matchingBlockIds[counter]);
            search.workspace_.highlightBlock(matchingBlockIds[counter]);
            return;
        }
        counter++;
    }
    // search.workspace_.highlightBlock(matchingBlockIds[0]);

    // var firstBlock = search.workspace_.getBlockById(matchingBlockIds[0]);

    // if (firstBlock) {
    // }
  }
};

Blockly.Search.prototype.onBlur = function(e) {
  var search = this;
  search.workspace_.highlightBlock("");

  if (search.currentResult) {
      search.currentResult.unselect();
  }

  search.searchInput_.value = "";
}