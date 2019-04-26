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

goog.require('Blockly.ASTNode');

/**
 * The cursor for keyboard navigation.
 * @type {Blockly.Cursor}
 * @private
 */
Blockly.Navigation.cursor_ = null;

/**
 * The current selected category if the toolbox is open or
 * last selected category if focus is on a different element.
 * @type {goog.ui.tree.BaseNode}
 * @private
 */
Blockly.Navigation.currentCategory_ = null;

/**
 * The current selected block in the flyout.
 * @type {Blockly.BlockSvg}
 * @private
 */
Blockly.Navigation.flyoutBlock_ = null;

/**
 * The selected connection used for inserting a block.
 * @type {Blockly.ASTNode}
 * @private
 */
Blockly.Navigation.insertionNode_ = null;

/**
 * State indicating focus is currently on the flyout.
 * @type {number}
 */
Blockly.Navigation.STATE_FLYOUT = 1;

/**
 * State indicating focus is currently on the workspace.
 * @type {number}
 */
Blockly.Navigation.STATE_WS = 2;

/**
 * State indicating focus is currently on the toolbox.
 * @type {number}
 */
Blockly.Navigation.STATE_TOOLBOX = 3;

/**
 * The current state the user is in.
 * Initialized to workspace state since a user enters navigation mode by shift
 * clicking on a block or workspace.
 * @type {number}
 * @private
 */
Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_WS;

/**
 * Set the navigation cursor.
 * @param {Blockly.Cursor} cursor The cursor to navigate through blocks on a
 * workspace.
 * @package
 */
Blockly.Navigation.setCursor = function(cursor) {
  Blockly.Navigation.cursor_ = cursor;
};

/**
 * Gets the connection point the user has marked as where they want to connect
 * their next block to. This is the connection used when inserting from the
 * flyout or from the workspace.
 * @return {Blockly.Connection} Returns the marked connection or null if the
 *    user has not marked a connection.
 * @package
 */
Blockly.Navigation.getInsertionConnection = function() {
  if (Blockly.Navigation.insertionNode_) {
    return /** @type {Blockly.Connection} */ (Blockly.Navigation.insertionNode_
        .getLocation());
  }
};

/************************/
/** Toolbox Navigation **/
/************************/

/**
 * Set the state to the toolbox state and the current category as the first
 * category.
 */
Blockly.Navigation.focusToolbox = function() {
  Blockly.Navigation.resetFlyout(false /* shouldHide */);
  Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_TOOLBOX;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  if (workspace && !Blockly.Navigation.currentCategory_) {
    Blockly.Navigation.currentCategory_ = toolbox.tree_.firstChild_;
  }
  toolbox.tree_.setSelectedItem(Blockly.Navigation.currentCategory_);
};

/**
 * Select the next category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.nextCategory = function() {
  if (!Blockly.Navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.Navigation.currentCategory_;
  var nextNode = curCategory.getNextShownNode();

  if (nextNode) {
    nextNode.select();
    Blockly.Navigation.currentCategory_ = nextNode;
  }
};

/**
 * Select the previous category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.previousCategory = function() {
  if (!Blockly.Navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.Navigation.currentCategory_;
  var previousNode = curCategory.getPreviousShownNode();

  if (previousNode) {
    previousNode.select();
    Blockly.Navigation.currentCategory_ = previousNode;
  }
};

/**
 * Go to child category if there is a nested category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.inCategory = function() {
  if (!Blockly.Navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.Navigation.currentCategory_;

  if (curCategory.hasChildren()) {
    if (!curCategory.getExpanded()) {
      curCategory.setExpanded(true);
    } else {
      curCategory.getFirstChild().select();
      Blockly.Navigation.currentCategory_ = curCategory.getFirstChild();
    }
  } else {
    Blockly.Navigation.focusFlyout();
  }
};

/**
 * Go to parent category if we are in a child category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.Navigation.outCategory = function() {
  if (!Blockly.Navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.Navigation.currentCategory_;

  if (curCategory.hasChildren() && curCategory.getExpanded() && curCategory.isUserCollapsible()) {
    curCategory.setExpanded(false);
  } else {
    var parent = curCategory.getParent();
    var tree = curCategory.getTree();
    if (parent && (tree.getShowRootNode() || parent != tree)) {
      parent.select();

      Blockly.Navigation.currentCategory_ = /** @type {goog.ui.tree.BaseNode} */
        (parent);
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
  Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_FLYOUT;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var cursor = Blockly.Navigation.cursor_;
  var topBlock;
  if (toolbox.flyout_ && toolbox.flyout_.getWorkspace()) {
    var topBlocks = toolbox.flyout_.getWorkspace().getTopBlocks();
    if (topBlocks.length > 0) {
      topBlock = topBlocks[0];
      Blockly.Navigation.flyoutBlock_ = topBlock;
      var astNode = Blockly.ASTNode.createBlockNode(Blockly.Navigation.flyoutBlock_);
      cursor.setLocation(astNode);
    }
  }
};

/**
 * Select the next block in the flyout.
 */
Blockly.Navigation.selectNextBlockInFlyout = function() {
  if (!Blockly.Navigation.flyoutBlock_) {
    return;
  }
  var blocks = Blockly.Navigation.getFlyoutBlocks_();
  var curBlock = Blockly.Navigation.flyoutBlock_;
  var curIdx = blocks.indexOf(curBlock);
  var cursor = Blockly.Navigation.cursor_;
  var nextBlock;

  if (curIdx > -1 && blocks[++curIdx]) {
    nextBlock = blocks[curIdx];
  }

  if (nextBlock) {
    Blockly.Navigation.flyoutBlock_ = nextBlock;
    var astNode = Blockly.ASTNode.createBlockNode(nextBlock);
    cursor.setLocation(astNode);
  }
};

/**
 * Select the previous block in the flyout.
 */
Blockly.Navigation.selectPreviousBlockInFlyout = function() {
  if (!Blockly.Navigation.flyoutBlock_) {
    return;
  }
  var blocks = Blockly.Navigation.getFlyoutBlocks_();
  var curBlock = Blockly.Navigation.flyoutBlock_;
  var curIdx = blocks.indexOf(curBlock);
  var cursor = Blockly.Navigation.cursor_;
  var prevBlock;

  if (curIdx > -1 && blocks[--curIdx]) {
    prevBlock = blocks[curIdx];
  }

  if (prevBlock) {
    Blockly.Navigation.flyoutBlock_ = prevBlock;
    var astNode = Blockly.ASTNode.createBlockNode(prevBlock);
    cursor.setLocation(astNode);
  }
};

/**
 * Get a list of all blocks in the flyout.
 * @return {!Array<Blockly.BlockSvg>} List of blocks in the flyout.
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
 * If there is a marked connection try connecting the block from the flyout to
 * that connection. If no connection has been marked then inserting will place
 * it on the workspace.
 */
Blockly.Navigation.insertFromFlyout = function() {
  //TODO: IF this is null then we need to add to the correct place on the
  //workspace.
  var connection = Blockly.Navigation.getInsertionConnection();
  var cursor = Blockly.Navigation.cursor_;
  var flyoutBlock = Blockly.Navigation.flyoutBlock_;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var flyout = toolbox.flyout_;

  if (flyout && flyout.isVisible()) {
    var newBlock = flyout.createBlock(flyoutBlock);
    Blockly.Navigation.insertBlock(newBlock, connection);
    Blockly.Navigation.focusWorkspace();
    var prevConnection = newBlock.previousConnection;
    var outConnection = newBlock.outputConnection;
    var topConnection = prevConnection ? prevConnection : outConnection;
    //TODO: This will have to be fixed when we add in a block that does not have
    //a previous or output connection
    var astNode = Blockly.ASTNode.createConnectionNode(topConnection);
    cursor.setLocation(astNode);
  }
};

/**
 * Reset flyout information, and optionally close the flyout.
 * @param {boolean} shouldHide True if the flyout should be hidden.
 */
Blockly.Navigation.resetFlyout = function(shouldHide) {
  var cursor = Blockly.Navigation.cursor_;
  Blockly.Navigation.flyoutBlock_ = null;
  cursor.hide();
  if (shouldHide) {
    cursor.workspace_.getFlyout().hide();
  }
};

/************/
/** Modify **/
/************/

/**
 * Finds our best guess of what connection point on the given block the user is
 * trying to connect to given a target connection.
 * @param {Blockly.Block} block The block to be connected.
 * @param {Blockly.Connection} connection The connection to connect to.
 * @return {Blockly.Connection} blockConnection The best connection we can
 *     determine for the block, or null if the block doesn't have a matching
 *     connection for the given target connection.
 */
Blockly.Navigation.findBestConnection = function(block, connection) {
  if (!block || !connection) {
    return null;
  }
  if (connection.type === Blockly.PREVIOUS_STATEMENT) {
    return block.nextConnection;
  } else if (connection.type === Blockly.NEXT_STATEMENT) {
    return block.previousConnection;
  } else if (connection.type === Blockly.INPUT_VALUE) {
    return block.outputConnection;
  } else if (connection.type === Blockly.OUTPUT_VALUE) {
    //select the first input that has a connection
    for (var i = 0; i < block.inputList.length; i++) {
      var inputConnection = block.inputList[i].connection;
      if (inputConnection.type === Blockly.INPUT_VALUE) {
        return inputConnection;
      }
    }
  }
  return null;
};

/**
 * Finds the best connection on a block and connects it to the given connection.
 * @param {!Blockly.Block} block The selected blcok.
 * @param {Blockly.Connection} connection The connection on the workspace.
 */
Blockly.Navigation.insertBlock = function(block, connection) {
  var bestConnection = Blockly.Navigation.findBestConnection(block, connection);

  if (bestConnection) {
    try {
      if (connection.type == Blockly.PREVIOUS_STATEMENT
        && connection.targetBlock()) {
        var previousBlock = connection.targetBlock();
        block.previousConnection.connect(previousBlock.nextConnection);
      }
      connection.connect(bestConnection);
    }
    catch (Error) {
      console.warn('The connection block is not the right type');
    }
  }
};

/**
 * Tries to connect the current location of the cursor and the insertion
 * connection.
 */
Blockly.Navigation.insertBlockFromWs = function() {
  var targetConnection = Blockly.Navigation.getInsertionConnection();
  var sourceConnection = Blockly.Navigation.cursor_.getCurNode().getLocation();
  try {
    sourceConnection.connect(targetConnection);
  } catch (Error) {
    console.warn('The connection block is not the right type');
  }
};

/*************************/
/** Keyboard Navigation **/
/*************************/

/**
 * Sets the cursor to the previous or output connection of the selected block
 * on the workspace.
 * If no block is selected, places the cursor at a fixed point on the workspace.
 */
Blockly.Navigation.focusWorkspace = function() {
  var cursor = Blockly.Navigation.cursor_;
  Blockly.Navigation.resetFlyout(true /* shouldHide */);
  Blockly.Navigation.currentState_ = Blockly.Navigation.STATE_WS;
  Blockly.Navigation.enableKeyboardAccessibility();
  if (Blockly.selected) {
    var previousConnection = Blockly.selected.previousConnection;
    var outputConnection = Blockly.selected.outputConnection;
    //TODO: This still needs to work with blocks that have neither previous
    //or output connection.
    var connection = previousConnection ? previousConnection : outputConnection;
    var newAstNode = Blockly.ASTNode.createConnectionNode(connection);
    cursor.setLocation(newAstNode);
  } else {
    var ws = cursor.workspace_;
    // TODO: Find the center of the visible workspace.
    var wsCoord = new goog.math.Coordinate(100, 100);
    var wsNode = Blockly.ASTNode.createWorkspaceNode(ws, wsCoord);
    cursor.setLocation(wsNode);
  }
};

/**
 * Move the cursor to the next connection, field or block. This skips
 * connections of type next because previous and next connection look the same
 * when the cursor is going through a stack of blocks.
 */
Blockly.Navigation.keyboardNext = function() {
  var cursor = Blockly.Navigation.cursor_;
  cursor.next();
  var newNode = cursor.getCurNode();
  if (newNode.getType() === Blockly.ASTNode.types.NEXT) {
    cursor.next();
  }
};

/**
 * Move the cursor down the AST.
 */
Blockly.Navigation.keyboardIn = function() {
  var cursor = Blockly.Navigation.cursor_;
  cursor.in();
  var newNode = cursor.getCurNode();
  if (newNode.getType() === Blockly.ASTNode.types.OUTPUT) {
    cursor.next();
  }
};

/**
 * Move the cursor to the previous connection, field or block.
 */
Blockly.Navigation.keyboardPrev = function() {
  var cursor = Blockly.Navigation.cursor_;
  cursor.prev();
  var newNode = cursor.getCurNode();
  if (newNode && newNode.getType() === Blockly.ASTNode.types.NEXT) {
    cursor.prev();
  }
};

/**
 * Move the cursor up the AST.
 */
Blockly.Navigation.keyboardOut = function() {
  var cursor = Blockly.Navigation.cursor_;
  cursor.out();
};

/**
 * Mark the current location of the cursor.
 */
Blockly.Navigation.markConnection = function() {
  var curNode = Blockly.Navigation.cursor_.getCurNode();
  var location = curNode.getLocation();

  //TODO: Add a helper function for identifying if a node is a connection.
  if (location instanceof Blockly.Connection) {
    Blockly.Navigation.insertionNode_ =
      Blockly.Navigation.cursor_.getCurNode();
  }
};

/**
 * Handles hitting the enter key on the workspace.
 */
Blockly.Navigation.handleEnterForWS = function() {
  var cursor = Blockly.Navigation.cursor_;
  var curNode = cursor.getCurNode();
  var location = curNode.getLocation();
  if (curNode.getType() === Blockly.ASTNode.types.FIELD) {
    location.showEditor_();
  } else {
    Blockly.Navigation.markConnection();
  }
};

/**********************/
/** Helper Functions **/
/**********************/


/**
 * TODO: Revisit keycodes before releasing
 * Handler for all the keyboard navigation events.
 * @param {Event} e The keyboard event.
 * @return {!boolean} True if the key was handled false otherwise.
 */
Blockly.Navigation.navigate = function(e) {
  var curState = Blockly.Navigation.currentState_;
  if (e.keyCode === goog.events.KeyCodes.T) {
    Blockly.Navigation.focusToolbox();
    console.log('T: Focus Toolbox');
    return true;
  } else if (curState === Blockly.Navigation.STATE_FLYOUT) {
    return Blockly.Navigation.flyoutKeyHandler(e);
  } else if (curState === Blockly.Navigation.STATE_WS) {
    return Blockly.Navigation.workspaceKeyHandler(e);
  } else if (curState === Blockly.Navigation.STATE_TOOLBOX) {
    return Blockly.Navigation.toolboxKeyHandler(e);
  } else {
    console.log('Not a valid key ');
  }
  return false;
};

/**
 * Handles all keyboard events when the user is focused on the flyout.
 * @param {Event} e The keyboard event.
 * @return {!boolean} True if the key was handled false otherwise.
 */
Blockly.Navigation.flyoutKeyHandler = function(e) {
  if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.selectPreviousBlockInFlyout();
    console.log('W: Flyout : Previous');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    Blockly.Navigation.focusToolbox();
    console.log('A: Flyout : Go To Toolbox');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.selectNextBlockInFlyout();
    console.log('S: Flyout : Next');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.ENTER) {
    Blockly.Navigation.insertFromFlyout();
    console.log('Enter: Flyout : Select');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.E) {
    Blockly.Navigation.focusWorkspace();
    console.log('E: Flyout: Exit');
    return true;
  }
  return false;
};

/**
 * Handles all keyboard events when the user is focused on the toolbox.
 * @param {Event} e The keyboard event.
 * @return {!boolean} True if the key was handled false otherwise.
 */
Blockly.Navigation.toolboxKeyHandler = function(e) {
  if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.previousCategory();
    console.log('W: Toolbox : Previous');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    Blockly.Navigation.outCategory();
    console.log('A: Toolbox : Out');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.nextCategory();
    console.log('S: Toolbox : Next');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.D) {
    Blockly.Navigation.inCategory();
    console.log('D: Toolbox : Go to flyout');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.ENTER) {
    //TODO: focus on flyout OR open if the category is nested
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.E) {
    console.log('E: Toolbox: Exit');
    Blockly.Navigation.focusWorkspace();
    return true;
  }
  return false;
};

/**
 * Handles all keyboard events when the user is focused on the workspace.
 * @param {Event} e The keyboard event.
 * @return {!boolean} True if the key was handled false otherwise.
 */
Blockly.Navigation.workspaceKeyHandler = function(e) {
  if (e.keyCode === goog.events.KeyCodes.W) {
    Blockly.Navigation.keyboardOut();
    console.log('W: Workspace : Out');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.A) {
    Blockly.Navigation.keyboardPrev();
    console.log('S: Workspace : Previous');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.S) {
    Blockly.Navigation.keyboardIn();
    console.log('S: Workspace : In');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.D) {
    Blockly.Navigation.keyboardNext();
    console.log('S: Workspace : Next');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.I) {
    Blockly.Navigation.insertBlockFromWs();
    console.log('I: Workspace : Insert/Connect Blocks');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.ENTER) {
    Blockly.Navigation.handleEnterForWS();
    console.log('Enter: Workspace : Mark Connection');
    return true;
  }
  return false;
};

/**
 * Enable accessibility mode.
 */
Blockly.Navigation.enableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode = true;
};

/**
 * Disable accessibility mode.
 */
Blockly.Navigation.disableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode = false;
};
