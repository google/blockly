/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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

goog.provide('Blockly.Navigation');

Blockly.Navigation.connection = null;

Blockly.Navigation.curCategory = null;

/************************/
/** Toolbox Navigation **/
/************************/

/**
 * Set the first category as the first category in the list.
 */
Blockly.Navigation.focusToolbox = function() {
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  if (workspace) {
    Blockly.Navigation.curCategory = toolbox.tree_.firstChild_;
  }
  toolbox.tree_.setSelectedItem(Blockly.Navigation.curCategory);
};

/**
 * Select the next category.
 * Taken from basenode.js
 */
Blockly.Navigation.nextCategory = function() {
  var curCategory = Blockly.Navigation.curCategory;
  var nextNode = curCategory.getNextShownNode();

  if (nextNode) {
    nextNode.select();
  }
  if (nextNode) {
    Blockly.Navigation.curCategory = nextNode;
  }
};

/**
 * Select the previous category.
 * Taken from basenode.js
 */
Blockly.Navigation.previousCategory = function() {
  if (!Blockly.Navigation.curCategory) {return};
  var curCategory = Blockly.Navigation.curCategory;
  var previousNode = curCategory.getPreviousShownNode();

  if (previousNode) {
    previousNode.select();
  }
  if (previousNode) {
    Blockly.Navigation.curCategory = previousNode;
  }
};

/**
 * Go to child category if possible.
 * Taken from basenode.js
 */
Blockly.Navigation.inCategory = function() {
  if (!Blockly.Navigation.curCategory) {return};
  var curCategory = Blockly.Navigation.curCategory;

  if (curCategory.hasChildren()) {
    if (!curCategory.getExpanded()) {
      curCategory.setExpanded(true);
    } else {
      curCategory.getFirstChild().select();
      Blockly.Navigation.curCategory = curCategory.getFirstChild();
    }
  }
};

/**
 * Go to parent category if possible.
 * Taken from basenode.js
 */
Blockly.Navigation.outCategory = function() {
  if (!Blockly.Navigation.curCategory) {return};
  var curCategory = Blockly.Navigation.curCategory;

  if (curCategory.hasChildren() && curCategory.getExpanded() && curCategory.isUserCollapsible_) {
    curCategory.setExpanded(false);
  } else {
    var parent = curCategory.getParent();
    var tree = curCategory.getTree();
    if (parent && (tree.getShowRootNode() || parent != tree)) {
      parent.select();
      Blockly.Navigation.curCategory = parent;
    }
  }
};

/*************************/
/** Keyboard Navigation **/
/*************************/

/**
 * Navigate between stacks of blocks on the workspace.
 * @param {Boolean} forward True to go forward. False to go backwards.
 * @return {Blockly.BlockSvg} The first block of the next stack.
 */
Blockly.Navigation.navigateBetweenStacks = function(forward) {
  var curBlock = Blockly.selected;
  if (!curBlock) {
    return null;
  }
  var curRoot = curBlock.getRootBlock();
  var topBlocks = curRoot.workspace.getTopBlocks();
  for (var i = 0; i < topBlocks.length; i++) {
    var topBlock = topBlocks[i];
    if (curRoot.id == topBlock.id) {
      var offset = forward ? 1 : -1;
      var resultIndex = i + offset;
      if (resultIndex == -1) {
        resultIndex = topBlocks.length - 1;
      } else if (resultIndex == topBlocks.length) {
        resultIndex = 0;
      }
      topBlocks[resultIndex].select();
      return Blockly.selected;
    }
  }
  throw Error('Couldn\'t find ' + (forward ? 'next' : 'previous') +
      ' stack?!?!?!');
};

Blockly.Navigation.setConnection = function() {
  Blockly.keyboardAccessibilityMode_ = true;
  Blockly.Navigation.connection = Blockly.selected.previousConnection;
  Blockly.cursor.showWithConnection(Blockly.selected.previousConnection);
};

/**
 * Go to the previous connection on the next block.
 */
Blockly.Navigation.keyboardNext = function() {
  var curConnect = Blockly.Navigation.connection;
  var nextConnection;
  if (!curConnect) {
    return null;
  }
  var nxtBlock = curConnect.sourceBlock_.getNextBlock();
  if (nxtBlock){
    nextConnection = nxtBlock.previousConnection;
  }
  else {
    nextConnection = curConnect.sourceBlock_.nextConnection;
  }
  //Set cursor here
  Blockly.cursor.showWithConnection(nextConnection);
  Blockly.Navigation.connection = nextConnection;
  return nextConnection;
};

/**
 * Go to the previous connection on the previous block.
 */
Blockly.Navigation.keyboardPrev = function() {
  var curConnect = Blockly.Navigation.connection;
  var prevConnection;
  if (!curConnect) {
    return null;
  }
  var prevBlock = curConnect.sourceBlock_.getParent();
  if (prevBlock){
    prevConnection = prevBlock.previousConnection;
  }
  else {
    prevConnection = curConnect.sourceBlock_.previousConnection;
  }
  //Set cursor here
  Blockly.cursor.showWithConnection(prevConnection);
  Blockly.Navigation.connection = prevConnection;
  return prevConnection;
};


/**********************/
/** Helper Functions **/
/**********************/


/**
 * Handler for all the keyboard navigation events.
 */
Blockly.Navigation.navigate = function(e) {
  if (e.keyCode === goog.events.KeyCodes.UP) {
    Blockly.Navigation.keyboardPrev();
  } else if (e.keyCode === goog.events.KeyCodes.DOWN) {
    Blockly.Navigation.keyboardNext();
  } else if (e.keyCode === goog.events.KeyCodes.F) {
    Blockly.Navigation.focusToolbox();
  } else if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.previousCategory();
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    Blockly.Navigation.outCategory();
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.nextCategory();
  } else if (e.keyCode === goog.events.KeyCodes.D) {
    Blockly.Navigation.inCategory();
  }

};

/**
 * Enable accessibility mode.
 */
Blockly.Navigation.enableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode_ = true;
};

/**
 * Disable accessibility mode.
 */
Blockly.Navigation.disableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode_ = false;
};
