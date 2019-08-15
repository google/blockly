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

goog.provide('Blockly.navigation');

goog.require('Blockly.Action');
goog.require('Blockly.ASTNode');
goog.require('Blockly.user.keyMap');


/**
 * The cursor for keyboard navigation.
 * @type {Blockly.Cursor}
 * @private
 */
Blockly.navigation.cursor_ = null;

/**
 * The marker that shows where a user has marked while navigating blocks.
 * @type {!Blockly.CursorSvg}
 */
Blockly.navigation.marker_ = null;

/**
 * The current selected category if the toolbox is open or
 * last selected category if focus is on a different element.
 * @type {Blockly.tree.BaseNode}
 * @private
 */
Blockly.navigation.currentCategory_ = null;

/**
 * The current selected block in the flyout.
 * @type {Blockly.BlockSvg}
 * @private
 */
Blockly.navigation.flyoutBlock_ = null;

/**
 * A function to call to give feedback to the user about logs, warnings, and
 * errors.  You can override this to customize feedback (e.g. warning sounds,
 * reading out the warning text, etc).
 * Null by default.
 * The first argument is one of 'log', 'warn', and 'error'.
 * The second argument is the message.
 * @type {function(string, string)}
 * @public
 */
Blockly.navigation.loggingCallback = null;

/**
 * State indicating focus is currently on the flyout.
 * @type {number}
 */
Blockly.navigation.STATE_FLYOUT = 1;

/**
 * State indicating focus is currently on the workspace.
 * @type {number}
 */
Blockly.navigation.STATE_WS = 2;

/**
 * State indicating focus is currently on the toolbox.
 * @type {number}
 */
Blockly.navigation.STATE_TOOLBOX = 3;

/**
 * The current state the user is in.
 * Initialized to workspace state since a user enters navigation mode by shift
 * clicking on a block or workspace.
 * @type {number}
 * @private
 */
Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;

/**
 * Object holding default action names.
 * @enum {string}
 */
Blockly.navigation.actionNames = {
  PREVIOUS: 'previous',
  NEXT: 'next',
  IN: 'in',
  OUT: 'out',
  INSERT: 'insert',
  MARK: 'mark',
  DISCONNECT: 'disconnect',
  TOOLBOX: 'toolbox',
  EXIT: 'exit'
};
/**
 * Set the navigation cursor.
 * @param {Blockly.Cursor} cursor The cursor to navigate through blocks on a
 * workspace.
 * @package
 */
Blockly.navigation.setCursor = function(cursor) {
  Blockly.navigation.cursor_ = cursor;
};

/**
 * Set the navigation marker.
 * @param {Blockly.CursorSvg} marker The marker that shows where a user has
 *     marked while navigating blocks.
 * @package
 */
Blockly.navigation.setMarker = function(marker) {
  Blockly.navigation.marker_ = marker;
};

/**
 * Move the marker to the cursor's current location.
 * @package
 */
Blockly.navigation.markAtCursor = function() {
  // TODO: bring the cursor (blinking) in front of the marker (solid)
  Blockly.navigation.marker_.setLocation(
      Blockly.navigation.cursor_.getCurNode());
};

/**
 * Remove the marker from its current location and hide it.
 * @package
 */
Blockly.navigation.removeMark = function() {
  Blockly.navigation.marker_.setLocation(null);
  Blockly.navigation.marker_.hide();
};

/************************/
/** Toolbox Navigation **/
/************************/

/**
 * Set the state to the toolbox state and the current category as the first
 * category.
 */
Blockly.navigation.focusToolbox = function() {
  Blockly.navigation.resetFlyout(false /* shouldHide */);
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();

  if (!Blockly.navigation.marker_.getCurNode()) {
    Blockly.navigation.markAtCursor();
  }
  if (workspace && !Blockly.navigation.currentCategory_) {
    Blockly.navigation.currentCategory_ = toolbox.tree_.firstChild_;
  }
  toolbox.tree_.setSelectedItem(Blockly.navigation.currentCategory_);
};

/**
 * Select the next category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.navigation.nextCategory = function() {
  if (!Blockly.navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.navigation.currentCategory_;
  var nextNode = curCategory.getNextShownNode();

  if (nextNode) {
    nextNode.select();
    Blockly.navigation.currentCategory_ = nextNode;
  }
};

/**
 * Select the previous category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.navigation.previousCategory = function() {
  if (!Blockly.navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.navigation.currentCategory_;
  var previousNode = curCategory.getPreviousShownNode();

  if (previousNode) {
    previousNode.select();
    Blockly.navigation.currentCategory_ = previousNode;
  }
};

/**
 * Go to child category if there is a nested category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.navigation.inCategory = function() {
  if (!Blockly.navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.navigation.currentCategory_;

  if (curCategory.hasChildren()) {
    if (!curCategory.getExpanded()) {
      curCategory.setExpanded(true);
    } else {
      curCategory.getFirstChild().select();
      Blockly.navigation.currentCategory_ = curCategory.getFirstChild();
    }
  } else {
    Blockly.navigation.focusFlyout();
  }
};

/**
 * Go to parent category if we are in a child category.
 * Taken from closure/goog/ui/tree/basenode.js
 */
Blockly.navigation.outCategory = function() {
  if (!Blockly.navigation.currentCategory_) {
    return;
  }
  var curCategory = Blockly.navigation.currentCategory_;

  if (curCategory.hasChildren() && curCategory.getExpanded() && curCategory.isUserCollapsible()) {
    curCategory.setExpanded(false);
  } else {
    var parent = curCategory.getParent();
    var tree = curCategory.getTree();
    if (parent && parent != tree) {
      parent.select();

      Blockly.navigation.currentCategory_ = /** @type {Blockly.tree.BaseNode} */
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
Blockly.navigation.focusFlyout = function() {
  var topBlock = null;
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_FLYOUT;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var cursor = Blockly.navigation.cursor_;
  var flyout = toolbox ? toolbox.flyout_ : workspace.getFlyout();

  if (!Blockly.navigation.marker_.getCurNode()) {
    Blockly.navigation.markAtCursor();
  }

  if (flyout && flyout.getWorkspace()) {
    var topBlocks = flyout.getWorkspace().getTopBlocks();
    if (topBlocks.length > 0) {
      topBlock = topBlocks[0];
      Blockly.navigation.flyoutBlock_ = topBlock;
      var astNode = Blockly.ASTNode.createBlockNode(Blockly.navigation.flyoutBlock_);
      cursor.setLocation(astNode);
    }
  }
};

/**
 * Select the next block in the flyout.
 */
Blockly.navigation.selectNextBlockInFlyout = function() {
  if (!Blockly.navigation.flyoutBlock_) {
    return;
  }
  var blocks = Blockly.navigation.getFlyoutBlocks_();
  var curBlock = Blockly.navigation.flyoutBlock_;
  var curIdx = blocks.indexOf(curBlock);
  var cursor = Blockly.navigation.cursor_;
  var nextBlock;

  if (curIdx > -1 && blocks[++curIdx]) {
    nextBlock = blocks[curIdx];
  }

  if (nextBlock) {
    Blockly.navigation.flyoutBlock_ = nextBlock;
    var astNode = Blockly.ASTNode.createBlockNode(nextBlock);
    cursor.setLocation(astNode);
  }
};

/**
 * Select the previous block in the flyout.
 */
Blockly.navigation.selectPreviousBlockInFlyout = function() {
  if (!Blockly.navigation.flyoutBlock_) {
    return;
  }
  var blocks = Blockly.navigation.getFlyoutBlocks_();
  var curBlock = Blockly.navigation.flyoutBlock_;
  var curIdx = blocks.indexOf(curBlock);
  var cursor = Blockly.navigation.cursor_;
  var prevBlock;

  if (curIdx > -1 && blocks[--curIdx]) {
    prevBlock = blocks[curIdx];
  }

  if (prevBlock) {
    Blockly.navigation.flyoutBlock_ = prevBlock;
    var astNode = Blockly.ASTNode.createBlockNode(prevBlock);
    cursor.setLocation(astNode);
  }
};

/**
 * Get a list of all blocks in the flyout.
 * @return {!Array<Blockly.BlockSvg>} List of blocks in the flyout.
 */
Blockly.navigation.getFlyoutBlocks_ = function() {
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var topBlocks = [];
  var flyout = toolbox ? toolbox.flyout_ : workspace.getFlyout();
  if (flyout && flyout.getWorkspace()) {
    topBlocks = flyout.getWorkspace().getTopBlocks();
  }
  return topBlocks;
};

/**
 * If there is a marked connection try connecting the block from the flyout to
 * that connection. If no connection has been marked then inserting will place
 * it on the workspace.
 */
Blockly.navigation.insertFromFlyout = function() {

  var flyout = Blockly.getMainWorkspace().getFlyout();
  if (!flyout || !flyout.isVisible()) {
    Blockly.navigation.warn('Trying to insert from the flyout when the flyout does not ' +
      ' exist or is not visible');
    return;
  }

  var newBlock = flyout.createBlock(Blockly.navigation.flyoutBlock_);
  // Render to get the sizing right.
  newBlock.render();
  // Connections are hidden when the block is first created.  Normally there's
  // enough time for them to become unhidden in the user's mouse movements,
  // but not here.
  newBlock.setConnectionsHidden(false);
  Blockly.navigation.cursor_.setLocation(
      Blockly.ASTNode.createBlockNode(newBlock));
  if (!Blockly.navigation.modify()) {
    Blockly.navigation.warn('Something went wrong while inserting a block from the flyout.');
  }

  // Move the cursor to the right place on the inserted block.
  Blockly.navigation.focusWorkspace();
  var prevConnection = newBlock.previousConnection;
  var outConnection = newBlock.outputConnection;
  var topConnection = prevConnection ? prevConnection : outConnection;
  // TODO: This will have to be fixed when we add in a block that does not have
  // a previous or output connection
  var astNode = Blockly.ASTNode.createConnectionNode(topConnection);
  Blockly.navigation.cursor_.setLocation(astNode);
  Blockly.navigation.removeMark();
};

/**
 * Reset flyout information, and optionally close the flyout.
 * @param {boolean} shouldHide True if the flyout should be hidden.
 */
Blockly.navigation.resetFlyout = function(shouldHide) {
  var cursor = Blockly.navigation.cursor_;
  Blockly.navigation.flyoutBlock_ = null;
  cursor.hide();
  if (shouldHide) {
    cursor.workspace_.getFlyout().hide();
  }
};

/************/
/** Modify **/
/************/

/**
 * Handle the modifier key (currently I for Insert).
 * @return {boolean} True if the key was handled; false if something went wrong.
 * @package
 */
Blockly.navigation.modify = function() {
  var markerNode = Blockly.navigation.marker_.getCurNode();
  var cursorNode = Blockly.navigation.cursor_.getCurNode();

  if (!markerNode) {
    Blockly.navigation.warn('Cannot insert with no marked node.');
    return false;
  }

  if (!cursorNode) {
    Blockly.navigation.warn('Cannot insert with no cursor node.');
    return false;
  }
  var markerType = markerNode.getType();
  var cursorType = cursorNode.getType();

  if (markerType == Blockly.ASTNode.types.FIELD) {
    Blockly.navigation.warn('Should not have been able to mark a field.');
    return false;
  }
  if (markerType == Blockly.ASTNode.types.BLOCK) {
    Blockly.navigation.warn('Should not have been able to mark a block.');
    return false;
  }
  if (markerType == Blockly.ASTNode.types.STACK) {
    Blockly.navigation.warn('Should not have been able to mark a stack.');
    return false;
  }

  if (cursorType == Blockly.ASTNode.types.FIELD) {
    Blockly.navigation.warn('Cannot attach a field to anything else.');
    return false;
  }

  if (cursorType == Blockly.ASTNode.types.WORKSPACE) {
    Blockly.navigation.warn('Cannot attach a workspace to anything else.');
    return false;
  }

  var cursorLoc = cursorNode.getLocation();
  var markerLoc = markerNode.getLocation();

  if (markerNode.isConnection()) {
    // TODO: Handle the case when one or both are already connected.
    if (cursorNode.isConnection()) {
      return Blockly.navigation.connect(cursorLoc, markerLoc);
    } else if (cursorType == Blockly.ASTNode.types.BLOCK ||
        cursorType == Blockly.ASTNode.types.STACK) {
      return Blockly.navigation.insertBlock(cursorLoc, markerLoc);
    }
  } else if (markerType == Blockly.ASTNode.types.WORKSPACE) {
    if (cursorNode.isConnection()) {
      if (cursorType == Blockly.ASTNode.types.INPUT ||
          cursorType == Blockly.ASTNode.types.NEXT) {
        Blockly.navigation.warn(
            'Cannot move a next or input connection to the workspace.');
        return false;
      }
      var block = cursorLoc.getSourceBlock();
    } else if (cursorType == Blockly.ASTNode.types.BLOCK ||
        cursorType == Blockly.ASTNode.types.STACK) {
      var block = cursorLoc;
    } else {
      return false;
    }
    if (block.isShadow()) {
      Blockly.navigation.warn('Cannot move a shadow block to the workspace.');
      return false;
    }
    if (block.getParent()) {
      block.unplug(false);
    }
    block.moveTo(markerNode.getWsCoordinate());
    return true;
  }
  Blockly.navigation.warn('Unexpected state in Blockly.navigation.modify.');
  return false;
  // TODO: Make sure the cursor and marker end up in the right places.
};

/**
 * Connect the moving connection to the targetConnection.  Disconnect the moving
 * connection if necessary, and and position the blocks so that the target
 * connection does not move.
 * @param {Blockly.RenderedConnection} movingConnection The connection to move.
 * @param {Blockly.RenderedConnection} targetConnection The connection that
 *     stays stationary as the movingConnection attaches to it.
 * @return {boolean} Whether the connection was successful.
 * @package
 */
Blockly.navigation.connect = function(movingConnection, targetConnection) {
  if (movingConnection) {
    var movingBlock = movingConnection.getSourceBlock();
    if (targetConnection.type == Blockly.PREVIOUS_STATEMENT ||
        targetConnection.type == Blockly.OUTPUT_VALUE) {
      movingBlock.positionNearConnection(movingConnection, targetConnection);
    }
    try {
      targetConnection.connect(movingConnection);
      return true;
    }
    catch (e) {
      // TODO: Is there anything else useful to do at this catch?
      // Perhaps position the block near the target connection?
      Blockly.navigation.warn('Connection failed with error: ' + e);
      return false;
    }
  }
  return false;
};

/**
 * Finds our best guess of what connection point on the given block the user is
 * trying to connect to given a target connection.
 * @param {Blockly.Block} block The block to be connected.
 * @param {Blockly.Connection} connection The connection to connect to.
 * @return {Blockly.Connection} blockConnection The best connection we can
 *     determine for the block, or null if the block doesn't have a matching
 *     connection for the given target connection.
 */
Blockly.navigation.findBestConnection = function(block, connection) {
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
 * @return {boolean} Whether the connection was successful.
 */
Blockly.navigation.insertBlock = function(block, targetConnection) {
  var bestConnection =
      Blockly.navigation.findBestConnection(block, targetConnection);
  if (bestConnection && bestConnection.isConnected() &&
      !bestConnection.targetBlock().isShadow()) {
    bestConnection.disconnect();
  } else if (!bestConnection) {
    Blockly.navigation.warn(
        'This block can not be inserted at the marked location.');
  }
  return Blockly.navigation.connect(bestConnection, targetConnection);
};

/**
 * Disconnect the connection that the cursor is pointing to, and bump blocks.
 * This is a no-op if the connection cannot be broken or if the cursor is not
 * pointing to a connection.
 * @package
 */
Blockly.navigation.disconnectBlocks = function() {
  var curNode = Blockly.navigation.cursor_.getCurNode();
  if (!curNode.isConnection()) {
    Blockly.navigation.log('Cannot disconnect blocks when the cursor is not on a connection');
    return;
  }
  var curConnection = curNode.getLocation();
  if (!curConnection.isConnected()) {
    Blockly.navigation.log('Cannot disconnect unconnected connection');
    return;
  }
  var superiorConnection =
      curConnection.isSuperior() ? curConnection : curConnection.targetConnection;

  var inferiorConnection =
      curConnection.isSuperior() ? curConnection.targetConnection : curConnection;

  if (inferiorConnection.getSourceBlock().isShadow()) {
    Blockly.navigation.log('Cannot disconnect a shadow block');
    return;
  }
  superiorConnection.disconnect();
  inferiorConnection.bumpAwayFrom_(superiorConnection);

  var rootBlock = superiorConnection.getSourceBlock().getRootBlock();
  rootBlock.bringToFront();

  var connectionNode = Blockly.ASTNode.createConnectionNode(superiorConnection);
  Blockly.navigation.cursor_.setLocation(connectionNode);
};

/*************************/
/** Keyboard Navigation **/
/*************************/

/**
 * Sets the cursor to the previous or output connection of the selected block
 * on the workspace.
 * If no block is selected, places the cursor at a fixed point on the workspace.
 */
Blockly.navigation.focusWorkspace = function() {
  var cursor = Blockly.navigation.cursor_;
  var reset = Blockly.getMainWorkspace().getToolbox() ? true : false;

  Blockly.navigation.resetFlyout(reset);
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;
  Blockly.navigation.enableKeyboardAccessibility();
  if (Blockly.selected) {
    var previousConnection = Blockly.selected.previousConnection;
    var outputConnection = Blockly.selected.outputConnection;
    // TODO: This still needs to work with blocks that have neither previous
    // or output connection.
    var connection = previousConnection ? previousConnection : outputConnection;
    var newAstNode = Blockly.ASTNode.createConnectionNode(connection);
    cursor.setLocation(newAstNode);
    Blockly.selected.unselect();
  } else {
    var ws = cursor.workspace_;
    // TODO: Find the center of the visible workspace.
    var wsCoord = new Blockly.utils.Coordinate(100, 100);
    var wsNode = Blockly.ASTNode.createWorkspaceNode(ws, wsCoord);
    cursor.setLocation(wsNode);
  }
};

/**
 * Handles hitting the enter key on the workspace.
 */
Blockly.navigation.handleEnterForWS = function() {
  var cursor = Blockly.navigation.cursor_;
  var curNode = cursor.getCurNode();
  var nodeType = curNode.getType();
  if (nodeType === Blockly.ASTNode.types.FIELD) {
    var location = curNode.getLocation();
    location.showEditor_();
  } else if (curNode.isConnection() ||
      nodeType == Blockly.ASTNode.types.WORKSPACE) {
    Blockly.navigation.markAtCursor();
  } else if (nodeType == Blockly.ASTNode.types.BLOCK) {
    Blockly.navigation.warn('Cannot mark a block.');
  } else if (nodeType == Blockly.ASTNode.types.STACK) {
    Blockly.navigation.warn('Cannot mark a stack.');
  }
};

/**********************/
/** Helper Functions **/
/**********************/

/**
 * Handler for all the keyboard navigation events.
 * @param {Event} e The keyboard event.
 * @return {!boolean} True if the key was handled false otherwise.
 */
Blockly.navigation.onKeyPress = function(e) {
  var key = Blockly.user.keyMap.serializeKeyEvent(e);
  var action = Blockly.user.keyMap.getActionByKeyCode(key);
  var curNode = Blockly.navigation.cursor_.getCurNode();
  var actionHandled = false;

  if (action) {
    if (curNode && curNode.getType() === Blockly.ASTNode.types.FIELD) {
      actionHandled = curNode.getLocation().onBlocklyAction(action);
    }
    if (!actionHandled) {
      actionHandled = Blockly.navigation.onBlocklyAction(action);
    }
  }
  return actionHandled;
};

/**
 * Execute any actions on the flyout, workspace, or toolbox that correspond to
 * the given action.
 * @param {!Blockly.Action} action The current action.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @package
 */
Blockly.navigation.onBlocklyAction = function(action) {
  if (Blockly.navigation.currentState_ === Blockly.navigation.STATE_WS) {
    return Blockly.navigation.workspaceOnAction_(action);
  } else if (Blockly.navigation.currentState_ === Blockly.navigation.STATE_FLYOUT) {
    return Blockly.navigation.flyoutOnAction_(action);
  } else if (Blockly.navigation.currentState_ === Blockly.navigation.STATE_TOOLBOX) {
    return Blockly.navigation.toolboxOnAction_(action);
  }
  return false;
};

/**
 * Handle all actions performed on the workspace.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.workspaceOnAction_ = function(action) {
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      Blockly.navigation.cursor_.prev();
      return true;
    case Blockly.navigation.actionNames.OUT:
      Blockly.navigation.cursor_.out();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      Blockly.navigation.cursor_.next();
      return true;
    case Blockly.navigation.actionNames.IN:
      Blockly.navigation.cursor_.in();
      return true;
    case Blockly.navigation.actionNames.INSERT:
      Blockly.navigation.modify();
      return true;
    case Blockly.navigation.actionNames.MARK:
      Blockly.navigation.handleEnterForWS();
      return true;
    case Blockly.navigation.actionNames.DISCONNECT:
      Blockly.navigation.disconnectBlocks();
      return true;
    case Blockly.navigation.actionNames.TOOLBOX:
      if (!Blockly.getMainWorkspace().getToolbox()) {
        Blockly.navigation.focusFlyout();
      } else {
        Blockly.navigation.focusToolbox();
      }
      return true;
    default:
      return false;
  }
};

/**
 * Handle all actions performed on the flyout.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.flyoutOnAction_ = function(action) {
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      Blockly.navigation.selectPreviousBlockInFlyout();
      return true;
    case Blockly.navigation.actionNames.OUT:
      Blockly.navigation.focusToolbox();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      Blockly.navigation.selectNextBlockInFlyout();
      return true;
    case Blockly.navigation.actionNames.MARK:
      Blockly.navigation.insertFromFlyout();
      return true;
    case Blockly.navigation.actionNames.EXIT:
      Blockly.navigation.focusWorkspace();
      return true;
    default:
      return false;
  }
};

/**
 * Handle all actions performeed on the toolbox.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.toolboxOnAction_ = function(action) {
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      Blockly.navigation.previousCategory();
      return true;
    case Blockly.navigation.actionNames.OUT:
      Blockly.navigation.outCategory();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      Blockly.navigation.nextCategory();
      return true;
    case Blockly.navigation.actionNames.IN:
      Blockly.navigation.inCategory();
      return true;
    case Blockly.navigation.actionNames.EXIT:
      Blockly.navigation.focusWorkspace();
      return true;
    default:
      return false;
  }
};

/**
 * Enable accessibility mode.
 */
Blockly.navigation.enableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode = true;
};

/**
 * Disable accessibility mode.
 */
Blockly.navigation.disableKeyboardAccessibility = function() {
  Blockly.keyboardAccessibilityMode = false;
};

/**
 * Navigation log handler. If loggingCallback is defined, use it.
 * Otherwise just log to the console.
 * @param {string} msg The message to log.
 * @package
 */
Blockly.navigation.log = function(msg) {
  if (Blockly.navigation.loggingCallback) {
    Blockly.navigation.loggingCallback('log', msg);
  } else {
    console.log(msg);
  }
};

/**
 * Navigation warning handler. If loggingCallback is defined, use it.
 * Otherwise call Blockly.navigation.warn.
 * @param {string} msg The warning message.
 * @package
 */
Blockly.navigation.warn = function(msg) {
  if (Blockly.navigation.loggingCallback) {
    Blockly.navigation.loggingCallback('warn', msg);
  } else {
    console.warn(msg);
  }
};

/**
 * Navigation error handler. If loggingCallback is defined, use it.
 * Otherwise call console.error.
 * @param {string} msg The error message.
 * @package
 */
Blockly.navigation.error = function(msg) {
  if (Blockly.navigation.loggingCallback) {
    Blockly.navigation.loggingCallback('error', msg);
  } else {
    console.error(msg);
  }
};

/**
 * The previous action.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_PREVIOUS = new Blockly.Action(
    Blockly.navigation.actionNames.PREVIOUS, 'Go to the previous location.');

/**
 * The out action.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_OUT = new Blockly.Action(
    Blockly.navigation.actionNames.OUT, 'Go to the parent of the current location.');

/**
 * The next action.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_NEXT = new Blockly.Action(
    Blockly.navigation.actionNames.NEXT, 'Go to the next location.');

/**
 * The in action.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_IN = new Blockly.Action(
    Blockly.navigation.actionNames.IN, 'Go to the first child of the current location.');

/**
 * The action to try to insert a block.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_INSERT = new Blockly.Action(
    Blockly.navigation.actionNames.INSERT,
    'Connect the current location to the marked location.');

/**
 * The action to mark a certain location.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_MARK = new Blockly.Action(
    Blockly.navigation.actionNames.MARK, 'Mark the current location.');

/**
 * The action to disconnect a block.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_DISCONNECT = new Blockly.Action(
    Blockly.navigation.actionNames.DISCONNECT, 'Dicsonnect the block at the' +
      'current location from its parent.');

/**
 * The action to open the toolbox.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_TOOLBOX = new Blockly.Action(
    Blockly.navigation.actionNames.TOOLBOX, 'Open the toolbox.');

/**
 * The action to exit the toolbox or flyout.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_EXIT = new Blockly.Action(
    Blockly.navigation.actionNames.EXIT, 'Close the current modal, such as a toolbox or field editor.');
