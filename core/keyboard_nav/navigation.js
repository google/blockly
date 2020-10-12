/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
goog.require('Blockly.constants');
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
 * @const
 */
Blockly.navigation.STATE_FLYOUT = 1;

/**
 * State indicating focus is currently on the workspace.
 * @type {number}
 * @const
 */
Blockly.navigation.STATE_WS = 2;

/**
 * State indicating focus is currently on the toolbox.
 * @type {number}
 * @const
 */
Blockly.navigation.STATE_TOOLBOX = 3;

/**
 * The distance to move the cursor on the workspace.
 * @type {number}
 * @const
 */
Blockly.navigation.WS_MOVE_DISTANCE = 40;

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
  TOGGLE_KEYBOARD_NAV: 'toggle_keyboard_nav',
  MOVE_WS_CURSOR_UP: 'move workspace cursor up',
  MOVE_WS_CURSOR_DOWN: 'move workspace cursor down',
  MOVE_WS_CURSOR_LEFT: 'move workspace cursor left',
  MOVE_WS_CURSOR_RIGHT: 'move workspace cursor right'
};

/**
 * The name of the marker reserved for internal use.
 * @type {string}
 * @const
 */
Blockly.navigation.MARKER_NAME = 'local_marker_1';

/** ****** */
/** Focus  */
/** ****** */

/**
 * Get the local marker.
 * @return {Blockly.Marker} The local marker for the main workspace.
 */
Blockly.navigation.getMarker = function() {
  return Blockly.navigation.getNavigationWorkspace()
      .getMarker(Blockly.navigation.MARKER_NAME);
};

/**
 * Get the workspace that is being navigated.
 * @return {!Blockly.WorkspaceSvg} The workspace being navigated.
 */
Blockly.navigation.getNavigationWorkspace = function() {
  return /** @type {!Blockly.WorkspaceSvg} */ (Blockly.getMainWorkspace());
};

/**
 * If a toolbox exists, set the navigation state to toolbox and select the first
 * category in the toolbox.
 * @private
 */
Blockly.navigation.focusToolbox_ = function() {
  var toolbox = Blockly.navigation.getNavigationWorkspace().getToolbox();
  if (toolbox) {
    Blockly.navigation.currentState_ = Blockly.navigation.STATE_TOOLBOX;
    Blockly.navigation.resetFlyout_(false /* shouldHide */);

    if (!Blockly.navigation.getMarker().getCurNode()) {
      Blockly.navigation.markAtCursor_();
    }
    if (!toolbox.getSelectedItem()) {
      toolbox.selectItemByPosition(0);
    }
  }
};

/**
 * Change focus to the flyout.
 * @private
 */
Blockly.navigation.focusFlyout_ = function() {
  var topBlock = null;
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_FLYOUT;
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var toolbox = workspace.getToolbox();
  var flyout = toolbox ? toolbox.getFlyout() : workspace.getFlyout();

  if (!Blockly.navigation.getMarker().getCurNode()) {
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
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var cursor = workspace.getCursor();
  var reset = !!workspace.getToolbox();
  var topBlocks = workspace.getTopBlocks(true);

  Blockly.navigation.resetFlyout_(reset);
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_WS;
  if (topBlocks.length > 0) {
    cursor.setCurNode(Blockly.ASTNode.createTopNode(topBlocks[0]));
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
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var cursor = null;
  if (workspace.rendered) {
    var toolbox = workspace.getToolbox();
    var flyout = toolbox ? toolbox.getFlyout() : workspace.getFlyout();
    cursor = flyout ? flyout.getWorkspace().getCursor() : null;
  }
  return /** @type {Blockly.FlyoutCursor} */ (cursor);
};

/**
 * If there is a marked connection try connecting the block from the flyout to
 * that connection. If no connection has been marked then inserting will place
 * it on the workspace.
 */
Blockly.navigation.insertFromFlyout = function() {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var flyout = workspace.getFlyout();
  if (!flyout || !flyout.isVisible()) {
    Blockly.navigation.warn_('Trying to insert from the flyout when the flyout does not ' +
      ' exist or is not visible');
    return;
  }

  var curBlock = /** @type {!Blockly.BlockSvg} */ (
    Blockly.navigation.getFlyoutCursor_().getCurNode().getLocation());
  if (!curBlock.isEnabled()) {
    Blockly.navigation.warn_('Can\'t insert a disabled block.');
    return;
  }

  var newBlock = flyout.createBlock(curBlock);
  // Render to get the sizing right.
  newBlock.render();
  // Connections are not tracked when the block is first created.  Normally
  // there's enough time for them to become tracked in the user's mouse
  // movements, but not here.
  newBlock.setConnectionTracking(true);
  workspace.getCursor().setCurNode(
      Blockly.ASTNode.createBlockNode(newBlock));
  if (!Blockly.navigation.modify_()) {
    Blockly.navigation.warn_('Something went wrong while inserting a block from the flyout.');
  }

  Blockly.navigation.focusWorkspace_();
  workspace.getCursor().setCurNode(Blockly.ASTNode.createTopNode(newBlock));
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
      Blockly.navigation.getNavigationWorkspace().getFlyout().hide();
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
  var markerNode = Blockly.navigation.getMarker().getCurNode();
  var cursorNode = Blockly.navigation.getNavigationWorkspace()
      .getCursor().getCurNode();

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
 * @param {Blockly.BlockSvg} block The block to be moved to the workspace.
 * @param {!Blockly.ASTNode} wsNode The workspace node holding the position the
 *     block will be moved to.
 * @return {boolean} True if the block can be moved to the workspace,
 *     false otherwise.
 * @private
 */
Blockly.navigation.moveBlockToWorkspace_ = function(block, wsNode) {
  if (!block) {
    return false;
  }
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
  var markerNode = Blockly.navigation.getMarker().getCurNode();
  var cursorNode = Blockly.navigation.getNavigationWorkspace()
      .getCursor().getCurNode();
  if (!Blockly.navigation.modifyWarn_()) {
    return false;
  }

  var markerType = markerNode.getType();
  var cursorType = cursorNode.getType();

  var cursorLoc = cursorNode.getLocation();
  var markerLoc = markerNode.getLocation();

  if (markerNode.isConnection() && cursorNode.isConnection()) {
    cursorLoc = /** @type {!Blockly.RenderedConnection} */ (cursorLoc);
    markerLoc = /** @type {!Blockly.RenderedConnection} */ (markerLoc);
    return Blockly.navigation.connect_(cursorLoc, markerLoc);
  } else if (markerNode.isConnection() &&
      (cursorType == Blockly.ASTNode.types.BLOCK ||
      cursorType == Blockly.ASTNode.types.STACK)) {
    cursorLoc = /** @type {!Blockly.BlockSvg} */ (cursorLoc);
    markerLoc = /** @type {!Blockly.RenderedConnection} */ (markerLoc);
    return Blockly.navigation.insertBlock(cursorLoc, markerLoc);
  } else if (markerType == Blockly.ASTNode.types.WORKSPACE) {
    var block = cursorNode ? cursorNode.getSourceBlock() : null;
    return Blockly.navigation.moveBlockToWorkspace_(
        /** @type {Blockly.BlockSvg} */ (block), markerNode);
  }
  Blockly.navigation.warn_('Unexpected state in Blockly.navigation.modify_.');
  return false;
};

/**
 * If one of the connections source blocks is a child of the other, disconnect
 * the child.
 * @param {!Blockly.RenderedConnection} movingConnection The connection that is
 *     being moved.
 * @param {!Blockly.RenderedConnection} destConnection The connection to be
 *     moved to.
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
 * @param {Blockly.RenderedConnection} movingConnection The connection that is
 *     being moved.
 * @param {Blockly.RenderedConnection} destConnection The connection to be moved
 *     to.
 * @return {boolean} True if the connections were connected, false otherwise.
 * @private
 */
Blockly.navigation.moveAndConnect_ = function(movingConnection, destConnection) {
  if (!movingConnection || !destConnection) {
    return false;
  }
  var movingBlock = movingConnection.getSourceBlock();

  var checker = movingConnection.getConnectionChecker();

  if (checker.canConnect(movingConnection, destConnection, false)) {
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
 * @param {Blockly.RenderedConnection} connection The connection trying to be
 *     connected.
 * @return {Blockly.RenderedConnection} The inferior connection or null if none
 *     exists.
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
 * @param {Blockly.RenderedConnection} connection The connection trying to be
 *     connected.
 * @return {Blockly.RenderedConnection} The superior connection or null if none
 *     exists.
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
 * @param {Blockly.RenderedConnection} movingConnection The connection that is
 *     being moved.
 * @param {Blockly.RenderedConnection} destConnection The connection to be moved
 *     to.
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
    var checker = movingConnection.getConnectionChecker();
    var reason = checker.canConnectWithReason(
        movingConnection, destConnection, false);
    Blockly.navigation.warn_('Connection failed with error: ' +
        checker.getErrorMessage(reason, movingConnection, destConnection));
    return false;
  }
};

/**
 * Tries to connect the given block to the destination connection, making an
 * intelligent guess about which connection to use to on the moving block.
 * @param {!Blockly.BlockSvg} block The block to move.
 * @param {!Blockly.RenderedConnection} destConnection The connection to connect
 *     to.
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
        var inputConnection = /** @type {Blockly.RenderedConnection} */ (
          block.inputList[i].connection);
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
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var curNode = workspace.getCursor().getCurNode();
  if (!curNode.isConnection()) {
    Blockly.navigation.log_('Cannot disconnect blocks when the cursor is not on a connection');
    return;
  }
  var curConnection =
    /** @type {!Blockly.RenderedConnection} */ (curNode.getLocation());
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
  inferiorConnection.bumpAwayFrom(superiorConnection);

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
  Blockly.navigation.getMarker().setCurNode(
      Blockly.navigation.getNavigationWorkspace().getCursor().getCurNode());
};

/**
 * Remove the marker from its current location and hide it.
 * @private
 */
Blockly.navigation.removeMark_ = function() {
  var marker = Blockly.navigation.getMarker();
  marker.setCurNode(null);
  marker.hide();
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
 * Before a block is deleted move the cursor to the appropriate position.
 * @param {!Blockly.BlockSvg} deletedBlock The block that is being deleted.
 */
Blockly.navigation.moveCursorOnBlockDelete = function(deletedBlock) {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  if (!workspace) {
    return;
  }
  var cursor = workspace.getCursor();
  if (cursor) {
    var curNode = cursor.getCurNode();
    var block = curNode ? curNode.getSourceBlock() : null;

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
    } else if (block && deletedBlock.getChildren(false).indexOf(block) > -1) {
      cursor.setCurNode(Blockly.ASTNode.createWorkspaceNode(block.workspace,
          block.getRelativeToSurfaceXY()));
    }
  }
};

/**
 * When a block that the cursor is on is mutated move the cursor to the block
 * level.
 * @param {!Blockly.BlockSvg} mutatedBlock The block that is being mutated.
 * @package
 */
Blockly.navigation.moveCursorOnBlockMutation = function(mutatedBlock) {
  var cursor = Blockly.navigation.getNavigationWorkspace().getCursor();
  if (cursor) {
    var curNode = cursor.getCurNode();
    var block = curNode ? curNode.getSourceBlock() : null;

    if (block === mutatedBlock) {
      cursor.setCurNode(Blockly.ASTNode.createBlockNode(block));
    }
  }
};

/**
 * Enable accessibility mode.
 */
Blockly.navigation.enableKeyboardAccessibility = function() {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  if (!workspace.keyboardAccessibilityMode) {
    workspace.keyboardAccessibilityMode = true;
    Blockly.navigation.focusWorkspace_();
  }
};

/**
 * Disable accessibility mode.
 */
Blockly.navigation.disableKeyboardAccessibility = function() {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  if (workspace.keyboardAccessibilityMode) {
    workspace.keyboardAccessibilityMode = false;
    workspace.getCursor().hide();
    Blockly.navigation.getMarker().hide();
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
 * @param {!KeyboardEvent} e The keyboard event.
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
 * Decides which actions to handle depending on keyboard navigation and readonly
 * states.
 * @param {!Blockly.Action} action The current action.
 * @return {boolean} True if the action has been handled, false otherwise.
 */
Blockly.navigation.onBlocklyAction = function(action) {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var readOnly = workspace.options.readOnly;
  var actionHandled = false;

  if (workspace.keyboardAccessibilityMode) {
    if (!readOnly) {
      actionHandled = Blockly.navigation.handleActions_(action);
    // If in readonly mode only handle valid actions.
    } else if (Blockly.navigation.READONLY_ACTION_LIST.indexOf(action) > -1) {
      actionHandled = Blockly.navigation.handleActions_(action);
    }
  // If not in accessibility mode only handle turning on keyboard navigation.
  } else if (action.name === Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV) {
    Blockly.navigation.enableKeyboardAccessibility();
    actionHandled = true;
  }
  return actionHandled;
};

/**
 * Handles the action or dispatches to the appropriate action handler.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.handleActions_ = function(action) {
  if (action.name == Blockly.navigation.actionNames.TOOLBOX ||
    Blockly.navigation.currentState_ == Blockly.navigation.STATE_TOOLBOX) {
    return Blockly.navigation.toolboxOnAction_(action);
  } else if (action.name == Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV) {
    Blockly.navigation.disableKeyboardAccessibility();
    return true;
  } if (Blockly.navigation.currentState_ == Blockly.navigation.STATE_WS) {
    return Blockly.navigation.workspaceOnAction_(action);
  } else if (Blockly.navigation.currentState_ == Blockly.navigation.STATE_FLYOUT) {
    return Blockly.navigation.flyoutOnAction_(action);
  }
  return false;
};

/**
 * Handles the given action for the flyout.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.flyoutOnAction_ = function(action) {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var toolbox = workspace.getToolbox();
  var flyout = toolbox ? toolbox.getFlyout() : workspace.getFlyout();

  if (flyout && flyout.onBlocklyAction(action)) {
    return true;
  }

  switch (action.name) {
    case Blockly.navigation.actionNames.OUT:
      Blockly.navigation.focusToolbox_();
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
 * Handles the given action for the toolbox.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.toolboxOnAction_ = function(action) {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var toolbox = workspace.getToolbox();
  var handled = toolbox && typeof toolbox.onBlocklyAction == 'function' ?
      toolbox.onBlocklyAction(action) : false;

  if (handled) {
    return true;
  }

  if (action.name === Blockly.navigation.actionNames.TOOLBOX) {
    if (!workspace.getToolbox()) {
      Blockly.navigation.focusFlyout_();
    } else {
      Blockly.navigation.focusToolbox_();
    }
    return true;
  } else if (action.name === Blockly.navigation.actionNames.IN) {
    Blockly.navigation.focusFlyout_();
    return true;
  } else if (action.name === Blockly.navigation.actionNames.EXIT) {
    Blockly.navigation.focusWorkspace_();
    return true;
  }
  return false;
};

/**
 * Move the workspace cursor in the given direction.
 * @param {number} xDirection -1 to move cursor left. 1 to move cursor right.
 * @param {number} yDirection -1 to move cursor up. 1 to move cursor down.
 * @return {boolean} True if the current node is a workspace, false otherwise.
 * @private
 */
Blockly.navigation.moveWSCursor_ = function(xDirection, yDirection) {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  var cursor = workspace.getCursor();
  var curNode = workspace.getCursor().getCurNode();

  if (curNode.getType() !== Blockly.ASTNode.types.WORKSPACE) {
    return false;
  }

  var wsCoord = curNode.getWsCoordinate();
  var newX = xDirection * Blockly.navigation.WS_MOVE_DISTANCE + wsCoord.x;
  var newY = yDirection * Blockly.navigation.WS_MOVE_DISTANCE + wsCoord.y;

  cursor.setCurNode(Blockly.ASTNode.createWorkspaceNode(
      workspace, new Blockly.utils.Coordinate(newX, newY)));
  return true;
};

/**
 * Handles the given action for the workspace.
 * @param {!Blockly.Action} action The action to handle.
 * @return {boolean} True if the action has been handled, false otherwise.
 * @private
 */
Blockly.navigation.workspaceOnAction_ = function(action) {
  var workspace = Blockly.navigation.getNavigationWorkspace();
  if (workspace.getCursor().onBlocklyAction(action)) {
    return true;
  }
  switch (action.name) {
    case Blockly.navigation.actionNames.INSERT:
      Blockly.navigation.modify_();
      return true;
    case Blockly.navigation.actionNames.MARK:
      Blockly.navigation.handleEnterForWS_();
      return true;
    case Blockly.navigation.actionNames.DISCONNECT:
      Blockly.navigation.disconnectBlocks_();
      return true;
    case Blockly.navigation.actionNames.MOVE_WS_CURSOR_UP:
      return Blockly.navigation.moveWSCursor_(0, -1);
    case Blockly.navigation.actionNames.MOVE_WS_CURSOR_DOWN:
      return Blockly.navigation.moveWSCursor_(0, 1);
    case Blockly.navigation.actionNames.MOVE_WS_CURSOR_LEFT:
      return Blockly.navigation.moveWSCursor_(-1, 0);
    case Blockly.navigation.actionNames.MOVE_WS_CURSOR_RIGHT:
      return Blockly.navigation.moveWSCursor_(1, 0);
    default:
      return false;
  }
};

/**
 * Handles hitting the enter key on the workspace.
 * @private
 */
Blockly.navigation.handleEnterForWS_ = function() {
  var cursor = Blockly.navigation.getNavigationWorkspace().getCursor();
  var curNode = cursor.getCurNode();
  var nodeType = curNode.getType();
  if (nodeType == Blockly.ASTNode.types.FIELD) {
    (/** @type {!Blockly.Field} */(curNode.getLocation())).showEditor();
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
    Blockly.navigation.actionNames.OUT,
    'Go to the parent of the current location.');

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
    Blockly.navigation.actionNames.IN,
    'Go to the first child of the current location.');

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
    Blockly.navigation.actionNames.DISCONNECT,
    'Disconnect the block at the current location from its parent.');

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
    Blockly.navigation.actionNames.EXIT,
    'Close the current modal, such as a toolbox or field editor.');

/**
 * The action to toggle keyboard navigation mode on and off.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_TOGGLE_KEYBOARD_NAV = new Blockly.Action(
    Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV,
    'Turns on and off keyboard navigation.');

/**
 * The action to move the cursor to the left on a workspace.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_MOVE_WS_CURSOR_LEFT = new Blockly.Action(
    Blockly.navigation.actionNames.MOVE_WS_CURSOR_LEFT,
    'Move the workspace cursor to the lefts.');

/**
 * The action to move the cursor to the right on a workspace.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_MOVE_WS_CURSOR_RIGHT = new Blockly.Action(
    Blockly.navigation.actionNames.MOVE_WS_CURSOR_RIGHT,
    'Move the workspace cursor to the right.');

/**
 * The action to move the cursor up on a workspace.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_MOVE_WS_CURSOR_UP = new Blockly.Action(
    Blockly.navigation.actionNames.MOVE_WS_CURSOR_UP,
    'Move the workspace cursor up.');

/**
 * The action to move the cursor down on a workspace.
 * @type {!Blockly.Action}
 */
Blockly.navigation.ACTION_MOVE_WS_CURSOR_DOWN = new Blockly.Action(
    Blockly.navigation.actionNames.MOVE_WS_CURSOR_DOWN,
    'Move the workspace cursor down.');


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
