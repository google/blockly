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
 * The marker that shows where a user has marked while navigating blocks.
 * @type {!Blockly.CursorSvg}
 */
Blockly.Navigation.marker_ = null;

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
 * Set the navigation marker.
 * @param {Blockly.CursorSvg} marker The marker that shows where a user has
 *     marked while navigating blocks.
 * @package
 */
Blockly.Navigation.setMarker = function(marker) {
  Blockly.Navigation.marker_ = marker;
};

/**
 * Move the marker to the cursor's current location.
 * @package
 */
Blockly.Navigation.markAtCursor = function() {
  // TODO: bring the cursor (blinking) in front of the marker (solid)
  Blockly.Navigation.marker_.setLocation(
      Blockly.Navigation.cursor_.getCurNode());
};

/**
 * Remove the marker from its current location and hide it.
 * @package
 */
Blockly.Navigation.removeMark = function() {
  Blockly.Navigation.marker_.setLocation(null);
  Blockly.Navigation.marker_.hide();
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
  var marker = Blockly.Navigation.marker_;
  if (marker && marker.getCurNode()) {
    var node = marker.getCurNode();
    if (node.isConnection()) {
      return /** @type {Blockly.Connection} */ (node.getLocation());
    }
  }
  return null;
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

  if (!Blockly.Navigation.marker_.getCurNode()) {
    Blockly.Navigation.markAtCursor();
  }
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
  var connection = Blockly.Navigation.getInsertionConnection();

  var flyout = Blockly.getMainWorkspace().getFlyout();
  if (!flyout || !flyout.isVisible()) {
    console.warn('Trying to insert from the flyout when the flyout does not ' +
      ' exist or is not visible');
    return;
  }

  var newBlock = flyout.createBlock(Blockly.Navigation.flyoutBlock_);
  if (connection) {
    Blockly.Navigation.insertAtConnection(newBlock, connection);
  } else {
    Blockly.Navigation.insertBlockToWs(newBlock);
  }

  // Move the cursor to the right place on the inserted block.
  Blockly.Navigation.focusWorkspace();
  var prevConnection = newBlock.previousConnection;
  var outConnection = newBlock.outputConnection;
  var topConnection = prevConnection ? prevConnection : outConnection;
  //TODO: This will have to be fixed when we add in a block that does not have
  //a previous or output connection
  var astNode = Blockly.ASTNode.createConnectionNode(topConnection);
  Blockly.Navigation.cursor_.setLocation(astNode);
  Blockly.Navigation.removeMark();
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

  // TODO: Possibly check types and return null if the types don't match.
  if (connection.type === Blockly.PREVIOUS_STATEMENT) {
    return block.nextConnection;
  } else if (connection.type === Blockly.NEXT_STATEMENT) {
    return block.previousConnection;
  } else if (connection.type === Blockly.INPUT_VALUE) {
    return block.outputConnection;
  } else if (connection.type === Blockly.OUTPUT_VALUE) {
    // Select the first input that has a connection.
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
 * Tries to connect the given block to the target connection, making an
 * intelligent guess about which connection to use to on the moving block.
 * @param {!Blockly.Block} block The block to move.
 * @param {Blockly.Connection} targetConnection The connection to connect to.
 */
Blockly.Navigation.insertBlock = function(block, targetConnection) {
  var bestConnection =
      Blockly.Navigation.findBestConnection(block, targetConnection);

  if (bestConnection) {
    if (targetConnection.type == Blockly.PREVIOUS_STATEMENT
        || targetConnection.type == Blockly.OUTPUT_VALUE) {
      block.positionNearConnection(bestConnection, targetConnection);
    }
    try {
      targetConnection.connect(bestConnection);
    }
    catch (Error) {
      // TODO: Is there anything else useful to do at this catch?
      // Perhaps position the block near the target connection?
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
  if (targetConnection && sourceConnection) {
    try {
      sourceConnection.connect(targetConnection);
    } catch (Error) {
      console.warn('The connection block is not the right type');
    }
  }
  // TODO: Is there anything else useful to do at this else?
  // Perhaps position the block near the target connection?
};

/**
 * Insert the given block onto the workspace at the top level, at the location
 * given by the marker.
 * @param {Blockly.BlockSvg} newBlock The block to insert.
 * @package
 */
Blockly.Navigation.insertBlockToWs = function(newBlock) {
  var marker = Blockly.Navigation.marker_;
  if (!marker) {
    return;
  }
  var markedNode = marker.getCurNode();

  var isWsNode = markedNode &&
      markedNode.getType() === Blockly.ASTNode.types.WORKSPACE;

  // TODO: Decide what to do if the marked node is not a connection or workspace
  // node.
  if (isWsNode) {
    // Render to get the sizing right.
    newBlock.render();
    var position = markedNode.getWsCoordinate();
    newBlock.moveTo(position);

  }
};

/**
 * Insert the given block onto the workspace, connecting it to the given
 * connection.
 * @param {Blockly.BlockSvg} newBlock The block to insert.
 * @param {Blockly.RenderedConnection} connection The connection to connect
 *     the block to.
 * @package
 */
Blockly.Navigation.insertAtConnection = function(newBlock, connection) {
  // Render to get the sizing right.
  newBlock.render();
  // Connections are hidden when the block is first created.  Normally there's
  // enough time for them to become unhidden in the user's mouse movements,
  // but not here.
  newBlock.setConnectionsHidden(false);
  Blockly.Navigation.insertBlock(newBlock, connection);
};

/**
 * Disconnect the connection that the cursor is pointing to, and bump blocks.
 * This is a no-op if the connection cannot be broken or if the cursor is not
 * pointing to a connection.
 * @package
 */
Blockly.Navigation.disconnectBlocks = function() {
  var curNode = Blockly.Navigation.cursor_.getCurNode();
  if (!curNode.isConnection()) {
    console.log('Cannot disconnect blocks when the cursor is not on a connection');
    return;
  }
  var curConnection = curNode.getLocation();
  if (!curConnection.isConnected()) {
    console.log('Cannot disconnect unconnected connection');
    return;
  }
  var superiorConnection =
      curConnection.isSuperior() ? curConnection : curConnection.targetConnection;

  var inferiorConnection =
      curConnection.isSuperior() ? curConnection.targetConnection : curConnection;

  if (inferiorConnection.getSourceBlock().isShadow()) {
    console.log('Cannot disconnect a shadow block');
    return;
  }
  superiorConnection.disconnect();
  inferiorConnection.bumpAwayFrom_(superiorConnection);

  var rootBlock = superiorConnection.getSourceBlock().getRootBlock();
  rootBlock.bringToFront();

  var connectionNode = Blockly.ASTNode.createConnectionNode(superiorConnection);
  Blockly.Navigation.cursor_.setLocation(connectionNode);
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
    Blockly.selected.unselect();
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
 * Handles hitting the enter key on the workspace.
 */
Blockly.Navigation.handleEnterForWS = function() {
  var cursor = Blockly.Navigation.cursor_;
  var curNode = cursor.getCurNode();
  if (curNode.getType() === Blockly.ASTNode.types.FIELD) {
    var location = curNode.getLocation();
    location.showEditor_();
  } else {
    Blockly.Navigation.markAtCursor();
  }
  Blockly.Navigation.markAtCursor();
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
  } else if (e.keyCode === goog.events.KeyCodes.E ||
      e.keyCode === goog.events.KeyCodes.ESC) {
    Blockly.Navigation.focusWorkspace();
    console.log('E or ESC: Flyout: Exit');
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
  } else if (e.keyCode === goog.events.KeyCodes.E ||
      e.keyCode === goog.events.KeyCodes.ESC) {
    console.log('E or ESC: Toolbox: Exit');
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
    console.log('Enter: Workspace : Mark');
    return true;
  } else if (e.keyCode === goog.events.KeyCodes.X) {
    console.log('X: Workspace: Disconnect Blocks');
    Blockly.Navigation.disconnectBlocks();
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
