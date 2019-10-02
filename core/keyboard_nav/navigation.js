/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview The class in charge of handling actions related to keyboard
 *     navigation.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.navigation');

goog.require('Blockly.Action');
goog.require('Blockly.ASTNode');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.user.keyMap');


/**
 * A function to call to give feedback to the user about logs, warnings, and
 * errors.  You can override this to customize feedback (e.g. warning sounds,
 * reading out the warning text, etc).
 * Null by default.
 * The first argument is one of 'log', 'warn', and 'error'.
 * The second argument is the message.
 * @type {?function(string, string)}
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
  EXIT: 'exit',
  TOGGLE_KEYBOARD_NAV: 'toggle_keyboard_nav'
};

/** ****** */
/** Focus  */
/** ****** */

/**
 * If a toolbox exists, set the navigation state to toolbox and select the first
 * category in the toolbox.
 * category.
 * @private
 */
Blockly.navigation.focusToolbox_ = function() {
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  if (toolbox) {
    Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
    Blockly.navigation.resetFlyout_(false /* shouldHide */);

    if (!workspace.getMarker().getCurNode()) {
      Blockly.navigation.markAtCursor_();
    }
    toolbox.selectFirstCategory();
  }
};

/**
 * Change focus to the flyout.
 * @private
 */
Blockly.navigation.focusFlyout_ = function() {
  var topBlock = null;
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_FLYOUT;
  var workspace = Blockly.getMainWorkspace();
  var toolbox = workspace.getToolbox();
  var flyout = toolbox ? toolbox.flyout_ : workspace.getFlyout();

  if (!workspace.getMarker().getCurNode()) {
    Blockly.navigation.markAtCursor_();
  }

  if (flyout && flyout.getWorkspace()) {
    var topBlocks = flyout.getWorkspace().getTopBlocks(true);
    if (topBlocks.length > 0) {
      topBlock = topBlocks[0];
      var astNode = Blockly.ASTNode.createStackNode(topBlock);
      Blockly.navigation.getFlyoutCursor_().setCurNode(astNode);
    }
  }
};

/**
 * Finds where the cursor should go on the workspace. This is either the top
 * block or a set position on the workspace.
 * @private
 */
Blockly.navigation.focusWorkspace_ = function() {
  Blockly.hideChaff();
  var workspace = Blockly.getMainWorkspace();
  var cursor = workspace.getCursor();
  var reset = !!workspace.getToolbox();
  var topBlocks = workspace.getTopBlocks(true);

  Blockly.navigation.resetFlyout_(reset);
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;
  if (topBlocks.length > 0) {
    cursor.setCurNode(Blockly.navigation.getTopNode(topBlocks[0]));
  } else {
    // TODO: Find the center of the visible workspace.
    var wsCoord = new Blockly.utils.Coordinate(100, 100);
    var wsNode = Blockly.ASTNode.createWorkspaceNode(workspace, wsCoord);
    cursor.setCurNode(wsNode);
  }
};

/** ****************** */
/** Flyout Navigation  */
/** ****************** */

/**
 * Get the cursor from the flyouts workspace.
 * @return {Blockly.FlyoutCursor} The flyouts cursor or null if no flyout exists.
 * @private
 */
Blockly.navigation.getFlyoutCursor_ = function() {
  var workspace = Blockly.getMainWorkspace();
  var cursor = null;
  if (workspace.rendered) {
    var toolbox = workspace.getToolbox();
    var flyout = toolbox ? toolbox.flyout_ : workspace.getFlyout();
    cursor = flyout ? flyout.workspace_.getCursor() : null;
  }
  return cursor;
};

/**
 * If there is a marked connection try connecting the block from the flyout to
 * that connection. If no connection has been marked then inserting will place
 * it on the workspace.
 */
Blockly.navigation.insertFromFlyout = function() {
  var workspace = Blockly.getMainWorkspace();
  var flyout = workspace.getFlyout();
  if (!flyout || !flyout.isVisible()) {
    Blockly.navigation.warn_('Trying to insert from the flyout when the flyout does not ' +
      ' exist or is not visible');
    return;
  }

  var curBlock = Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation();
  if (!curBlock.isEnabled()) {
    Blockly.navigation.warn_('Can\'t insert a disabled block.');
    return;
  }

  var newBlock = flyout.createBlock(curBlock);
  // Render to get the sizing right.
  newBlock.render();
  // Connections are hidden when the block is first created.  Normally there's
  // enough time for them to become unhidden in the user's mouse movements,
  // but not here.
  newBlock.setConnectionsHidden(false);
  workspace.getCursor().setCurNode(
      Blockly.ASTNode.createBlockNode(newBlock));
  if (!Blockly.navigation.modify_()) {
    Blockly.navigation.warn_('Something went wrong while inserting a block from the flyout.');
  }

  Blockly.navigation.focusWorkspace_();
  workspace.getCursor().setCurNode(Blockly.navigation.getTopNode(newBlock));
  Blockly.navigation.removeMark_();
};

/**
 * Reset flyout information, and optionally close the flyout.
 * @param {boolean} shouldHide True if the flyout should be hidden.
 * @private
 */
Blockly.navigation.resetFlyout_ = function(shouldHide) {
  if (Blockly.navigation.getFlyoutCursor_()) {
    Blockly.navigation.getFlyoutCursor_().hide();
    if (shouldHide) {
      Blockly.getMainWorkspace().getFlyout().hide();
    }
  }
};

/** **************** */
/** Modify Workspace */
/** **************** */

/**
 * Warns the user if the cursor or marker is on a type that can not be connected.
 * @return {boolean} True if the marker and cursor are valid types, false
 *     otherwise.
 * @private
 */
Blockly.navigation.modifyWarn_ = function() {
  var markerNode = Blockly.getMainWorkspace().getMarker().getCurNode();
  var cursorNode = Blockly.getMainWorkspace().getCursor().getCurNode();

  if (!markerNode) {
    Blockly.navigation.warn_('Cannot insert with no marked node.');
    return false;
  }

  if (!cursorNode) {
    Blockly.navigation.warn_('Cannot insert with no cursor node.');
    return false;
  }
  var markerType = markerNode.getType();
  var cursorType = cursorNode.getType();

  // Check the marker for invalid types.
  if (markerType == Blockly.ASTNode.types.FIELD) {
    Blockly.navigation.warn_('Should not have been able to mark a field.');
    return false;
  } else if (markerType == Blockly.ASTNode.types.BLOCK) {
    Blockly.navigation.warn_('Should not have been able to mark a block.');
    return false;
  } else if (markerType == Blockly.ASTNode.types.STACK) {
    Blockly.navigation.warn_('Should not have been able to mark a stack.');
    return false;
  }

  // Check the cursor for invalid types.
  if (cursorType == Blockly.ASTNode.types.FIELD) {
    Blockly.navigation.warn_('Cannot attach a field to anything else.');
    return false;
  } else if (cursorType == Blockly.ASTNode.types.WORKSPACE) {
    Blockly.navigation.warn_('Cannot attach a workspace to anything else.');
    return false;
  }
  return true;
};

/**
 * Disconnect the block from its parent and move to the position of the
 * workspace node.
 * @param {!Blockly.Block} block The block to be moved to the workspace.
 * @param {!Blockly.ASTNode} wsNode The workspace node holding the position the
 *     block will be moved to.
 * @return {boolean} True if the block can be moved to the workspace,
 *     false otherwise.
 * @private
 */
Blockly.navigation.moveBlockToWorkspace_ = function(block, wsNode) {
  if (block.isShadow()) {
    Blockly.navigation.warn_('Cannot move a shadow block to the workspace.');
    return false;
  }
  if (block.getParent()) {
    block.unplug(false);
  }
  block.moveTo(wsNode.getWsCoordinate());
  return true;
};

/**
 * Handle the modifier key (currently I for Insert).
 * Tries to connect the current marker and cursor location. Warns the user if
 * the two locations can not be connected.
 * @return {boolean} True if the key was handled; false if something went wrong.
 * @private
 */
Blockly.navigation.modify_ = function() {
  var markerNode = Blockly.getMainWorkspace().getMarker().getCurNode();
  var cursorNode = Blockly.getMainWorkspace().getCursor().getCurNode();
  if (!Blockly.navigation.modifyWarn_()) {
    return false;
  }

  var markerType = markerNode.getType();
  var cursorType = cursorNode.getType();

  var cursorLoc = cursorNode.getLocation();
  var markerLoc = markerNode.getLocation();

  if (markerNode.isConnection() && cursorNode.isConnection()) {
    return Blockly.navigation.connect_(cursorLoc, markerLoc);
  } else if (markerNode.isConnection() &&
        (cursorType == Blockly.ASTNode.types.BLOCK ||
        cursorType == Blockly.ASTNode.types.STACK)) {
    return Blockly.navigation.insertBlock(cursorLoc, markerLoc);
  } else if (markerType == Blockly.ASTNode.types.WORKSPACE) {
    var block = Blockly.navigation.getSourceBlock_(cursorNode);
    return Blockly.navigation.moveBlockToWorkspace_(block, markerNode);
  }
  Blockly.navigation.warn_('Unexpected state in Blockly.navigation.modify_.');
  return false;
};

/**
 * If one of the connections source blocks is a child of the other, disconnect
 * the child.
 * @param {!Blockly.Connection} movingConnection The connection that is being
 *     moved.
 * @param {!Blockly.Connection} destConnection The connection to be moved to.
 * @private
 */
Blockly.navigation.disconnectChild_ = function(movingConnection, destConnection) {
  var movingBlock = movingConnection.getSourceBlock();
  var destBlock = destConnection.getSourceBlock();

  if (movingBlock.getRootBlock() == destBlock.getRootBlock()) {
    if (movingBlock.getDescendants(false).indexOf(destBlock) > -1) {
      Blockly.navigation.getInferiorConnection_(destConnection).disconnect();
    } else {
      Blockly.navigation.getInferiorConnection_(movingConnection).disconnect();
    }
  }
};

/**
 * If the two blocks are compatible move the moving connection to the target
 * connection and connect them.
 * @param {Blockly.Connection} movingConnection The connection that is being
 *     moved.
 * @param {Blockly.Connection} destConnection The connection to be moved to.
 * @return {boolean} True if the connections were connected, false otherwise.
 * @private
 */
Blockly.navigation.moveAndConnect_ = function(movingConnection, destConnection) {
  if (!movingConnection || ! destConnection) {
    return false;
  }
  var movingBlock = movingConnection.getSourceBlock();

  if (destConnection.canConnectWithReason_(movingConnection) ==
      Blockly.Connection.CAN_CONNECT) {

    Blockly.navigation.disconnectChild_(movingConnection, destConnection);

    if (!destConnection.isSuperior()) {
      var rootBlock = movingBlock.getRootBlock();
      rootBlock.positionNearConnection(movingConnection, destConnection);
    }
    destConnection.connect(movingConnection);
    return true;
  }
  return false;
};

/**
 * If the given connection is superior find the inferior connection on the
 * source block.
 * @param {Blockly.Connection} connection The connection trying to be connected.
 * @return {Blockly.Connection} The inferior connection or null if none exists.
 * @private
 */
Blockly.navigation.getInferiorConnection_ = function(connection) {
  var block = connection.getSourceBlock();
  if (!connection.isSuperior()) {
    return connection;
  } else if (block.previousConnection) {
    return block.previousConnection;
  } else if (block.outputConnection) {
    return block.outputConnection;
  } else {
    return null;
  }
};

/**
 * If the given connection is inferior tries to find a superior connection to
 * connect to.
 * @param {Blockly.Connection} connection The connection trying to be connected.
 * @return {Blockly.Connection} The superior connection or null if none exists.
 * @private
 */
Blockly.navigation.getSuperiorConnection_ = function(connection) {
  if (connection.isSuperior()) {
    return connection;
  } else if (connection.targetConnection) {
    return connection.targetConnection;
  }
  return null;
};

/**
 * Tries to connect the  given connections.
 *
 * If the given connections are not compatible try finding compatible connections
 * on the source blocks of the given connections.
 *
 * @param {Blockly.Connection} movingConnection The connection that is being
 *     moved.
 * @param {Blockly.Connection} destConnection The connection to be moved to.
 * @return {boolean} True if the two connections or their target connections
 *     were connected, false otherwise.
 * @private
 */
Blockly.navigation.connect_ = function(movingConnection, destConnection) {
  if (!movingConnection || !destConnection) {
    return false;
  }

  var movingInferior = Blockly.navigation.getInferiorConnection_(movingConnection);
  var destSuperior = Blockly.navigation.getSuperiorConnection_(destConnection);

  var movingSuperior = Blockly.navigation.getSuperiorConnection_(movingConnection);
  var destInferior = Blockly.navigation.getInferiorConnection_(destConnection);

  if (movingInferior && destSuperior &&
      Blockly.navigation.moveAndConnect_(movingInferior, destSuperior)) {
    return true;
  // Try swapping the inferior and superior connections on the blocks.
  } else if (movingSuperior && destInferior &&
      Blockly.navigation.moveAndConnect_(movingSuperior, destInferior)) {
    return true;
  } else if (Blockly.navigation.moveAndConnect_(movingConnection, destConnection)){
    return true;
  } else {
    try {
      destConnection.checkConnection_(movingConnection);
    }
    catch (e) {
      // If nothing worked report the error from the original connections.
      Blockly.navigation.warn_('Connection failed with error: ' + e);
    }
    return false;
  }
};

/**
 * Tries to connect the given block to the destination connection, making an
 * intelligent guess about which connection to use to on the moving block.
 * @param {!Blockly.Block} block The block to move.
 * @param {Blockly.Connection} destConnection The connection to connect to.
 * @return {boolean} Whether the connection was successful.
 */
Blockly.navigation.insertBlock = function(block, destConnection) {
  switch (destConnection.type) {
    case Blockly.PREVIOUS_STATEMENT:
      if (Blockly.navigation.connect_(block.nextConnection, destConnection)) {
        return true;
      }
      break;
    case Blockly.NEXT_STATEMENT:
      if (Blockly.navigation.connect_(block.previousConnection, destConnection)) {
        return true;
      }
      break;
    case Blockly.INPUT_VALUE:
      if (Blockly.navigation.connect_(block.outputConnection, destConnection)) {
        return true;
      }
      break;
    case Blockly.OUTPUT_VALUE:
      for (var i = 0; i < block.inputList.length; i++) {
        var inputConnection = block.inputList[i].connection;
        if (inputConnection && inputConnection.type === Blockly.INPUT_VALUE &&
            Blockly.navigation.connect_(inputConnection, destConnection)) {
          return true;
        }
      }
      // If there are no input values pass the output and destination connections
      // to connect_ to find a way to connect the two.
      if (block.outputConnection &&
          Blockly.navigation.connect_(block.outputConnection, destConnection)) {
        return true;
      }
      break;
  }
  Blockly.navigation.warn_('This block can not be inserted at the marked location.');
  return false;
};

/**
 * Disconnect the connection that the cursor is pointing to, and bump blocks.
 * This is a no-op if the connection cannot be broken or if the cursor is not
 * pointing to a connection.
 * @private
 */
Blockly.navigation.disconnectBlocks_ = function() {
  var workspace = Blockly.getMainWorkspace();
  var curNode = workspace.getCursor().getCurNode();
  if (!curNode.isConnection()) {
    Blockly.navigation.log_('Cannot disconnect blocks when the cursor is not on a connection');
    return;
  }
  var curConnection = curNode.getLocation();
  if (!curConnection.isConnected()) {
    Blockly.navigation.log_('Cannot disconnect unconnected connection');
    return;
  }
  var superiorConnection =
      curConnection.isSuperior() ? curConnection : curConnection.targetConnection;

  var inferiorConnection =
      curConnection.isSuperior() ? curConnection.targetConnection : curConnection;

  if (inferiorConnection.getSourceBlock().isShadow()) {
    Blockly.navigation.log_('Cannot disconnect a shadow block');
    return;
  }
  superiorConnection.disconnect();
  inferiorConnection.bumpAwayFrom_(superiorConnection);

  var rootBlock = superiorConnection.getSourceBlock().getRootBlock();
  rootBlock.bringToFront();

  var connectionNode = Blockly.ASTNode.createConnectionNode(superiorConnection);
  workspace.getCursor().setCurNode(connectionNode);
};

/** ***************** */
/** Helper Functions  */
/** ***************** */

/**
 * Move the marker to the cursor's current location.
 * @private
 */
Blockly.navigation.markAtCursor_ = function() {
  var workspace = Blockly.getMainWorkspace();
  workspace.getMarker().setCurNode(workspace.getCursor().getCurNode());
};

/**
 * Remove the marker from its current location and hide it.
 * @private
 */
Blockly.navigation.removeMark_ = function() {
  var workspace = Blockly.getMainWorkspace();
  workspace.getMarker().setCurNode(null);
  workspace.getMarker().hide();
};

/**
 * Set the current navigation state.
 * @param {number} newState The new navigation state.
 * @package
 */
Blockly.navigation.setState = function(newState) {
  Blockly.navigation.currentState_ = newState;
};

/**
 * Finds the source block of the location on a given node.
 * @param {Blockly.ASTNode} node The node to find the source block on.
 * @return {Blockly.Block} The source block of the location on the given node,
 * or null if the node is of type workspace.
 * @private
 */
Blockly.navigation.getSourceBlock_ = function(node) {
  if (!node) {
    return null;
  }
  if (node.getType() === Blockly.ASTNode.types.BLOCK) {
    return /** @type {Blockly.Block} */ (node.getLocation());
  } else if (node.getType() === Blockly.ASTNode.types.STACK) {
    return /** @type {Blockly.Block} */ (node.getLocation());
  } else if (node.getType() === Blockly.ASTNode.types.WORKSPACE) {
    return null;
  } else {
    return node.getLocation().getSourceBlock();
  }
};

/**
 * Gets the top node on a block.
 * This is either the previous connection, output connection or the block.
 * @param {!Blockly.Block} block The block to find the top most AST node on.
 * @return {Blockly.ASTNode} The AST node holding the top most node on the
 *     block.
 * @package
 */
Blockly.navigation.getTopNode = function(block) {
  var astNode;
  var topConnection = block.previousConnection || block.outputConnection;
  if (topConnection) {
    astNode = Blockly.ASTNode.createConnectionNode(topConnection);
  } else {
    astNode = Blockly.ASTNode.createBlockNode(block);
  }
  return astNode;
};

/**
 * Before a block is deleted move the cursor to the appropriate position.
 * @param {!Blockly.Block} deletedBlock The block that is being deleted.
 */
Blockly.navigation.moveCursorOnBlockDelete = function(deletedBlock) {
  var workspace = Blockly.getMainWorkspace();
  if (!workspace) {
    return;
  }
  var cursor = workspace.getCursor();
  if (cursor) {
    var curNode = cursor.getCurNode();
    var block = Blockly.navigation.getSourceBlock_(curNode);

    if (block === deletedBlock) {
      // If the block has a parent move the cursor to their connection point.
      if (block.getParent()) {
        var topConnection = block.previousConnection || block.outputConnection;
        if (topConnection) {
          cursor.setCurNode(
              Blockly.ASTNode.createConnectionNode(topConnection.targetConnection));
        }
      } else {
        // If the block is by itself move the cursor to the workspace.
        cursor.setCurNode(Blockly.ASTNode.createWorkspaceNode(block.workspace,
            block.getRelativeToSurfaceXY()));
      }
    // If the cursor is on a block whose parent is being deleted, move the
    // cursor to the workspace.
    } else if (deletedBlock.getChildren(false).indexOf(block) > -1) {
      cursor.setCurNode(Blockly.ASTNode.createWorkspaceNode(block.workspace,
          block.getRelativeToSurfaceXY()));
    }
  }
};

/**
 * When a block that the cursor is on is mutated move the cursor to the block
 * level.
 * @param {!Blockly.Block} mutatedBlock The block that is being mutated.
 * @package
 */
Blockly.navigation.moveCursorOnBlockMutation = function(mutatedBlock) {
  var cursor = Blockly.getMainWorkspace().getCursor();
  if (cursor) {
    var curNode = cursor.getCurNode();
    var block = Blockly.navigation.getSourceBlock_(curNode);

    if (block === mutatedBlock) {
      cursor.setCurNode(Blockly.ASTNode.createBlockNode(block));
    }
  }
};

/**
 * Enable accessibility mode.
 */
Blockly.navigation.enableKeyboardAccessibility = function() {
  if (!Blockly.keyboardAccessibilityMode) {
    Blockly.keyboardAccessibilityMode = true;
    Blockly.navigation.focusWorkspace_();
  }
};

/**
 * Disable accessibility mode.
 */
Blockly.navigation.disableKeyboardAccessibility = function() {
  if (Blockly.keyboardAccessibilityMode) {
    var workspace = Blockly.getMainWorkspace();
    Blockly.keyboardAccessibilityMode = false;
    workspace.getCursor().hide();
    workspace.getMarker().hide();
    if (Blockly.navigation.getFlyoutCursor_()) {
      Blockly.navigation.getFlyoutCursor_().hide();
    }
  }
};

/**
 * Navigation log handler. If loggingCallback is defined, use it.
 * Otherwise just log to the console.
 * @param {string} msg The message to log.
 * @private
 */
Blockly.navigation.log_ = function(msg) {
  if (Blockly.navigation.loggingCallback) {
    Blockly.navigation.loggingCallback('log', msg);
  } else {
    console.log(msg);
  }
};

/**
 * Navigation warning handler. If loggingCallback is defined, use it.
 * Otherwise call Blockly.navigation.warn_.
 * @param {string} msg The warning message.
 * @private
 */
Blockly.navigation.warn_ = function(msg) {
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
 * @private
 */
Blockly.navigation.error_ = function(msg) {
  if (Blockly.navigation.loggingCallback) {
    Blockly.navigation.loggingCallback('error', msg);
  } else {
    console.error(msg);
  }
};

/** ***************** */
/** Handle Key Press  */
/** ***************** */

/**
 * Handler for all the keyboard navigation events.
 * @param {!Event} e The keyboard event.
 * @return {boolean} True if the key was handled false otherwise.
 */
Blockly.navigation.onKeyPress = function(e) {
  var key = Blockly.user.keyMap.serializeKeyEvent(e);
  var action = Blockly.user.keyMap.getActionByKeyCode(key);

  if (action) {
    return Blockly.navigation.onBlocklyAction(action);
  }
  return false;
};

/**
 * Execute any actions on the flyout, workspace, or toolbox that correspond to
 * the given action.
 * @param {!Blockly.Action} action The current action.
 * @return {boolean} True if the action has been handled, false otherwise.
 */
Blockly.navigation.onBlocklyAction = function(action) {
  var readOnly = Blockly.getMainWorkspace().options.readOnly;
  var actionHandled = false;

  if (Blockly.keyboardAccessibilityMode) {
    if (!readOnly) {
      actionHandled = Blockly.navigation.handleActions_(action);
    // If in readonly mode only handle valid actions.
    } else if (Blockly.navigation.READONLY_ACTION_LIST.indexOf(action) > -1) {
      actionHandled = Blockly.navigation.handleActions_(action);
    }
  // If not in accessibility mode only hanlde turning on keyboard navigation.
  } else if (action.name === Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV) {
    Blockly.navigation.enableKeyboardAccessibility();
    actionHandled = true;
  }
  return actionHandled;
};

/**
 * Handles the action or dispatches to the appropriate action handler.
 * @param {!Blockly.Action} action The current action
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.handleActions_ = function(action) {
  var workspace = Blockly.getMainWorkspace();
  if (action.name === Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV) {
    Blockly.navigation.disableKeyboardAccessibility();
    return true;
  } else if (action.name === Blockly.navigation.actionNames.TOOLBOX) {
    if (!workspace.getToolbox()) {
      Blockly.navigation.focusFlyout_();
    } else {
      Blockly.navigation.focusToolbox_();
    }
    return true;
  } else if (Blockly.navigation.currentState_ === Blockly.navigation.STATE_WS) {
    var curNode = workspace.getCursor().getCurNode();
    var actionHandled = false;
    if (curNode && curNode.getType() === Blockly.ASTNode.types.FIELD) {
      actionHandled = curNode.getLocation().onBlocklyAction(action);
    }
    if (!actionHandled) {
      actionHandled = Blockly.navigation.workspaceOnAction_(action);
    }
    return actionHandled;
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
  var workspace = Blockly.getMainWorkspace();
  switch (action.name) {
    case Blockly.navigation.actionNames.PREVIOUS:
      workspace.getCursor().prev();
      return true;
    case Blockly.navigation.actionNames.OUT:
      workspace.getCursor().out();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      workspace.getCursor().next();
      return true;
    case Blockly.navigation.actionNames.IN:
      workspace.getCursor().in();
      return true;
    case Blockly.navigation.actionNames.INSERT:
      Blockly.navigation.modify_();
      return true;
    case Blockly.navigation.actionNames.MARK:
      Blockly.navigation.handleEnterForWS_();
      return true;
    case Blockly.navigation.actionNames.DISCONNECT:
      Blockly.navigation.disconnectBlocks_();
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
      Blockly.navigation.getFlyoutCursor_().prev();
      return true;
    case Blockly.navigation.actionNames.OUT:
      Blockly.navigation.focusToolbox_();
      return true;
    case Blockly.navigation.actionNames.NEXT:
      Blockly.navigation.getFlyoutCursor_().next();
      return true;
    case Blockly.navigation.actionNames.MARK:
      Blockly.navigation.insertFromFlyout();
      return true;
    case Blockly.navigation.actionNames.EXIT:
      Blockly.navigation.focusWorkspace_();
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
  if (action.name === Blockly.navigation.actionNames.EXIT) {
    Blockly.navigation.focusWorkspace_();
    return true;
  }
  var toolbox = Blockly.getMainWorkspace().getToolbox();
  var handled = toolbox.onBlocklyAction(action);
  if (!handled && action.name === Blockly.navigation.actionNames.IN) {
    Blockly.navigation.focusFlyout_();
    return true;
  }

  return handled;
};

/**
 * Handles hitting the enter key on the workspace.
 * @private
 */
Blockly.navigation.handleEnterForWS_ = function() {
  var cursor = Blockly.getMainWorkspace().getCursor();
  var curNode = cursor.getCurNode();
  var nodeType = curNode.getType();
  if (nodeType == Blockly.ASTNode.types.FIELD) {
    curNode.getLocation().showEditor_();
  } else if (curNode.isConnection() ||
      nodeType == Blockly.ASTNode.types.WORKSPACE) {
    Blockly.navigation.markAtCursor_();
  } else if (nodeType == Blockly.ASTNode.types.BLOCK) {
    Blockly.navigation.warn_('Cannot mark a block.');
  } else if (nodeType == Blockly.ASTNode.types.STACK) {
    Blockly.navigation.warn_('Cannot mark a stack.');
  }
};

/** ******************* */
/** Navigation Actions  */
/** ******************* */

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

/**
 * The action to toggle keyboard navigation mode on and off.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_TOGGLE_KEYBOARD_NAV = new Blockly.Action(
    Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV, 'Turns on and off keyboard navigation.');

/**
 * List of actions that can be performed in read only mode.
 * @type {!Array.<!Blockly.Action>}
 */
Blockly.navigation.READONLY_ACTION_LIST = [
  Blockly.navigation.ACTION_PREVIOUS,
  Blockly.navigation.ACTION_OUT,
  Blockly.navigation.ACTION_IN,
  Blockly.navigation.ACTION_NEXT,
  Blockly.navigation.ACTION_TOGGLE_KEYBOARD_NAV
];
