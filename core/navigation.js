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

/**
 * The current connection the cursor is on.
 */
Blockly.Navigation.connection = null;

/**
 * The current selected category.
 */
Blockly.Navigation.curCategory = null;

/**
 * The current selected block in flyout.
 */
Blockly.Navigation.flyoutBlock = null;

/**
 * The selected connection.
 */
Blockly.Navigation.markedConnect = null;

/**
 * State for the flyout.
 */
Blockly.Navigation.FLYOUT_STATE = 1;

/**
 * State for the workspace.
 */
Blockly.Navigation.WS_STATE = 2;

/**
 * State for the toolbox.
 */
Blockly.Navigation.TOOLBOX_STATE = 3;

Blockly.Navigation.currentState = null;

/************************/
/** Toolbox Navigation **/
/************************/

/**
 * Set the first category as the first category in the list.
 */
Blockly.Navigation.focusToolbox = function() {
  Blockly.Navigation.flyoutCleanup();
  Blockly.Navigation.currentState = Blockly.Navigation.TOOLBOX_STATE;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  if (workspace && !Blockly.Navigation.curCategory) {
    Blockly.Navigation.curCategory = toolbox.tree_.firstChild_;
  }
  toolbox.tree_.setSelectedItem(Blockly.Navigation.curCategory);
};

/**
 * Select the next category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.nextCategory = function() {
  if (!Blockly.Navigation.curCategory) {return;}
  var curCategory = Blockly.Navigation.curCategory;
  var nextNode = curCategory.getNextShownNode();

  if (nextNode) {
    nextNode.select();
    Blockly.Navigation.curCategory = nextNode;
  }
};

/**
 * Select the previous category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.previousCategory = function() {
  if (!Blockly.Navigation.curCategory) {return;}
  var curCategory = Blockly.Navigation.curCategory;
  var previousNode = curCategory.getPreviousShownNode();

  if (previousNode) {
    previousNode.select();
    Blockly.Navigation.curCategory = previousNode;
  }
};

/**
 * Go to child category if possible.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.inCategory = function() {
  if (!Blockly.Navigation.curCategory) {return;}
  var curCategory = Blockly.Navigation.curCategory;

  if (curCategory.hasChildren()) {
    if (!curCategory.getExpanded()) {
      curCategory.setExpanded(true);
    } else {
      curCategory.getFirstChild().select();
      Blockly.Navigation.curCategory = curCategory.getFirstChild();
    }
  } else {
    Blockly.Navigation.focusFlyout();
  }
};

/**
 * Go to parent category if possible.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.outCategory = function() {
  if (!Blockly.Navigation.curCategory) {return;}
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

/***********************/
/** Flyout Navigation **/
/***********************/

/**
 * Change focus to the flyout.
 */
Blockly.Navigation.focusFlyout = function() {
  Blockly.Navigation.currentState = Blockly.Navigation.FLYOUT_STATE;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var topBlock;
  if (toolbox.flyout_ && toolbox.flyout_.getWorkspace()) {
    var topBlocks = toolbox.flyout_.getWorkspace().getTopBlocks();
    if (topBlocks.length > 0) {
      topBlock = topBlocks[0];
      Blockly.Navigation.flyoutBlock = topBlock;
      Blockly.cursor.showWithBlock(Blockly.Navigation.flyoutBlock);
    }
  }
};

/**
 * Get the next block in the flyout.
 */
Blockly.Navigation.flyoutNext = function() {
  if (!Blockly.Navigation.flyoutBlock){return;}
  var blocks = Blockly.Navigation.getFlyoutBlocks_();
  var curBlock = Blockly.Navigation.flyoutBlock;
  var curIdx = blocks.indexOf(curBlock);
  var nextBlock;

  if (curIdx > -1 && blocks[++curIdx]) {
    nextBlock = blocks[curIdx];
  }

  if (nextBlock) {
    Blockly.Navigation.flyoutBlock = nextBlock;
    Blockly.cursor.showWithBlock(Blockly.Navigation.flyoutBlock);
  }
};

/**
 * Get the previous block in the flyout.
 */
Blockly.Navigation.flyoutPrevious = function() {
  if (!Blockly.Navigation.flyoutBlock) {return;}
  var blocks = Blockly.Navigation.getFlyoutBlocks_();
  var curBlock = Blockly.Navigation.flyoutBlock;
  var curIdx = blocks.indexOf(curBlock);
  var prevBlock;

  if (curIdx > -1 && blocks[--curIdx]) {
    prevBlock = blocks[curIdx];
  }

  if (prevBlock) {
    Blockly.Navigation.flyoutBlock = prevBlock;
    Blockly.cursor.showWithBlock(Blockly.Navigation.flyoutBlock);
  }
};

/**
 * Get a list of all blocks in the flyout.
 * @return{!Array<Blockly.BlockSvg>} List of blocks in the flyout.
 */
Blockly.Navigation.getFlyoutBlocks_ = function() {
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var topBlocks = [];
  if (toolbox.flyout_ && toolbox.flyout_.getWorkspace()) {
    topBlocks = toolbox.flyout_.getWorkspace().getTopBlocks();
  }
  return topBlocks;
};

/**
 * Insert the block from the flyout.
 */
Blockly.Navigation.insertFromFlyout = function() {
  var flyoutBlock = Blockly.Navigation.flyoutBlock;
  var connection = Blockly.Navigation.markedConnect;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var flyout = toolbox.flyout_;

  if (flyout){
    var newBlock = flyout.createBlock(flyoutBlock);
    Blockly.Navigation.insertBlock(newBlock, connection);
    Blockly.Navigation.focusWorkspace();
    //This will have to be fixed when we add in a block that does not have a previous
    Blockly.Navigation.connection = newBlock.previousConnection;
    Blockly.cursor.showWithConnection(Blockly.Navigation.connection);
  }
};

Blockly.Navigation.flyoutCleanup = function() {
  Blockly.Navigation.flyoutBlock = null;
  Blockly.cursor.hide();
};

/************/
/** Modify **/
/************/

/**
 * TODO: Need to play with this function.
 * Finds the best connection.
 * @param{Blockly.Block} block The block to be connected.
 * @param{Blockly.Connection} connection The connection to connect to.
 * @return{Blockly.Connection} blockConnection The best connection we can determine for the block.
 */
Blockly.Navigation.findBestConnection = function(block, connection) {
  var blockConnection;
  if (!block || !connection) {return;}
  if (connection.type === Blockly.PREVIOUS_STATEMENT) {
    blockConnection = block.nextConnection;
  } else {
    blockConnection = block.previousConnection;
  }
  return blockConnection;
};

/**
 * Find the best connection and connect the target block to it.
 * @param{Blockly.Block} block The selected blcok.
 * @param{Blockly.Connection} connection The connection on the workspace.
 */
Blockly.Navigation.insertBlock = function(block, connection) {
  var bestConnection = Blockly.Navigation.findBestConnection(block, connection);
  if (bestConnection) {
    connection.connect(bestConnection);
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
/**
 * Sets the connection on the selected block in the workspace.
 */
Blockly.Navigation.focusWorkspace = function() {
  Blockly.Navigation.flyoutCleanup();
  Blockly.Navigation.currentState = Blockly.Navigation.WS_STATE;
  Blockly.keyboardAccessibilityMode_ = true;
  if (Blockly.selected) {
    Blockly.Navigation.connection = Blockly.selected.previousConnection;
    Blockly.cursor.showWithConnection(Blockly.selected.previousConnection);
  }
};

/**
 * Go to the previous connection on the next block.
 * @return {?Blockly.Connection} The next connection
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
 * @return {!Blockly.Connection} The previous connection.
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

/**
 * Mark the current connection.
 */
Blockly.Navigation.markConnection = function() {
  Blockly.Navigation.markedConnect = Blockly.Navigation.connection;
};

/**********************/
/** Helper Functions **/
/**********************/


/**
 * TODO: Revisit keycodes before releasing
 * Handler for all the keyboard navigation events.
 * @param{Event} e The keyboard event.
 */
Blockly.Navigation.navigate = function(e) {
  var curState = Blockly.Navigation.currentState;

  if (e.keyCode === goog.events.KeyCodes.T) {
    Blockly.Navigation.focusToolbox();
  } else if (e.keyCode === goog.events.KeyCodes.F) {
    Blockly.Navigation.focusFlyout();
  } else if (curState === Blockly.Navigation.FLYOUT_STATE) {
    Blockly.Navigation.flyoutKeyHandler(e);
  } else if (curState === Blockly.Navigation.WS_STATE) {
    Blockly.Navigation.workspaceKeyHandler(e);
  } else if (curState === Blockly.Navigation.TOOLBOX_STATE) {
    Blockly.Navigation.toolboxKeyHandler(e);
  } else {
    console.log("we have a problem.");
  }
};

Blockly.Navigation.flyoutKeyHandler = function(e) {
  if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.flyoutPrevious();
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    Blockly.Navigation.focusToolbox();
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.flyoutNext();
  } else if (e.keyCode === goog.events.KeyCodes.ENTER) {
    Blockly.Navigation.insertFromFlyout();
  }
};

Blockly.Navigation.toolboxKeyHandler = function(e) {
  if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.previousCategory();
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    Blockly.Navigation.outCategory();
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.nextCategory();
  } else if (e.keyCode === goog.events.KeyCodes.D) {
    Blockly.Navigation.inCategory();
  } else if (e.keyCode === goog.events.KeyCodes.ENTER) {
    //focus on flyout OR open if the category is nested?
  }
};

Blockly.Navigation.workspaceKeyHandler = function(e) {
  if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.keyboardPrev();
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    //Blockly.Navigation.out();
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.keyboardNext();
  } else if (e.keyCode === goog.events.KeyCodes.D) {
    //Blockly.Navigation.in();
  } else if (e.keyCode === goog.events.KeyCodes.ENTER) {
    Blockly.Navigation.markConnection();
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
