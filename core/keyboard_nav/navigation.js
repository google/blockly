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

goog.require('Blockly.ASTNode');
goog.require('Blockly.constants');
goog.require('Blockly.utils.Coordinate');


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
 * TODO: Remove this in favor or using passed in workspaces.
 */
Blockly.navigation.getNavigationWorkspace = function() {
  return /** @type {!Blockly.WorkspaceSvg} */ (Blockly.getMainWorkspace());
};

/**
 * If a toolbox exists, set the navigation state to toolbox and select the first
 * category in the toolbox.
 * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
 * @private
 */
Blockly.navigation.focusToolbox_ = function(workspace) {
  var toolbox = workspace.getToolbox();
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
 * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
 * @private
 */
Blockly.navigation.focusFlyout_ = function(workspace) {
  var topBlock = null;
  Blockly.navigation.currentState_ = Blockly.navigation.STATE_FLYOUT;
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
 * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
 * @private
 */
Blockly.navigation.focusWorkspace_ = function(workspace) {
  Blockly.hideChaff();
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
 * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
 */
Blockly.navigation.insertFromFlyout = function(workspace) {
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

  Blockly.navigation.focusWorkspace_(workspace);
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
 * @param {!Blockly.WorkspaceSvg} workspace The main workspace.
 * @private
 */
Blockly.navigation.disconnectBlocks_ = function(workspace) {
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
    Blockly.navigation.focusWorkspace_(workspace);
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
 * Move the workspace cursor in the given direction.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the cursor is on.
 * @param {number} xDirection -1 to move cursor left. 1 to move cursor right.
 * @param {number} yDirection -1 to move cursor up. 1 to move cursor down.
 * @return {boolean} True if the current node is a workspace, false otherwise.
 * @private
 */
Blockly.navigation.moveWSCursor_ = function(workspace, xDirection, yDirection) {
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
 * Handles hitting the enter key on the workspace.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the enter event
 *     originated from.
 * @private
 */
Blockly.navigation.handleEnterForWS_ = function(workspace) {
  var cursor = workspace.getCursor();
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

/** ***************** */
/** Register Items    */
/** ***************** */

/**
 * Keyboard shortcut to go to the previous location when in keyboard navigation
 * mode.
 */
Blockly.navigation.registerPrevious = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var previousShortcut = {
    name: Blockly.navigation.actionNames.PREVIOUS,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode;
    },
    callback: function(workspace, e, action) {
      var toolbox = workspace.getToolbox();
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          return workspace.getCursor().onBlocklyAction(action);
        case Blockly.navigation.STATE_FLYOUT:
          var flyout = toolbox ? toolbox.getFlyout() : workspace.getFlyout();
          return !!(flyout && flyout.onBlocklyAction(action));
        case Blockly.navigation.STATE_TOOLBOX:
          return toolbox && typeof toolbox.onBlocklyAction == 'function' ?
              toolbox.onBlocklyAction(action) :
              false;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(previousShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.W, previousShortcut.name);
};

/**
 * Keyboard shortcut to go to the out location when in keyboard navigation
 * mode.
 */
Blockly.navigation.registerOut = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var outShortcut = {
    name: Blockly.navigation.actionNames.OUT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode;
    },
    callback: function(workspace, e, action) {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          return workspace.getCursor().onBlocklyAction(action);
        case Blockly.navigation.STATE_FLYOUT:
          Blockly.navigation.focusToolbox_(workspace);
          return true;
        case Blockly.navigation.STATE_TOOLBOX:
          var toolbox = workspace.getToolbox();
          return toolbox && typeof toolbox.onBlocklyAction == 'function' ?
              toolbox.onBlocklyAction(action) :
              false;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(outShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.A, outShortcut.name);
};

/**
 * Keyboard shortcut to go to the next location when in keyboard navigation
 * mode.
 */
Blockly.navigation.registerNext = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var nextShortcut = {
    name: Blockly.navigation.actionNames.NEXT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode;
    },
    callback: function(workspace, e, action) {
      var toolbox = workspace.getToolbox();
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          return workspace.getCursor().onBlocklyAction(action);
        case Blockly.navigation.STATE_FLYOUT:
          var flyout = toolbox ? toolbox.getFlyout() : workspace.getFlyout();
          return !!(flyout && flyout.onBlocklyAction(action));
        case Blockly.navigation.STATE_TOOLBOX:
          return toolbox && typeof toolbox.onBlocklyAction == 'function' ?
              toolbox.onBlocklyAction(action) :
              false;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(nextShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.S, nextShortcut.name);
};

/**
 * Keyboard shortcut to go to the in location when in keyboard navigation mode.
 */
Blockly.navigation.registerIn = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var inShortcut = {
    name: Blockly.navigation.actionNames.IN,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode;
    },
    callback: function(workspace, e, action) {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          return workspace.getCursor().onBlocklyAction(action);
        case Blockly.navigation.STATE_TOOLBOX:
          var toolbox = workspace.getToolbox();
          var isHandled =
              toolbox && typeof toolbox.onBlocklyAction == 'function' ?
              toolbox.onBlocklyAction(action) :
              false;
          if (!isHandled) {
            Blockly.navigation.focusFlyout_(workspace);
          }
          return true;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(inShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.D, inShortcut.name);
};

/**
 * Keyboard shortcut to connect a block to a marked location when in keyboard
 * navigation mode.
 */
Blockly.navigation.registerInsert = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var insertShortcut = {
    name: Blockly.navigation.actionNames.INSERT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function() {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          return Blockly.navigation.modify_();
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(insertShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.I, insertShortcut.name);
};

/** Keyboard shortcut to mark a location when in keyboard navigation mode. */
Blockly.navigation.registerMark = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var markShortcut = {
    name: Blockly.navigation.actionNames.MARK,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          Blockly.navigation.handleEnterForWS_(workspace);
          return true;
        case Blockly.navigation.STATE_FLYOUT:
          Blockly.navigation.insertFromFlyout(workspace);
          return true;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(markShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.ENTER, markShortcut.name);
};

/**
 * Keyboard shortcut to disconnect two blocks when in keyboard navigation mode.
 */
Blockly.navigation.registerDisconnect = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var disconnectShortcut = {
    name: Blockly.navigation.actionNames.DISCONNECT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          Blockly.navigation.disconnectBlocks_(workspace);
          return true;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(disconnectShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.X, disconnectShortcut.name);
};

/**
 * Keyboard shortcut to focus on the toolbox when in keyboard navigation mode.
 */
Blockly.navigation.registerToolboxFocus = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var focusToolboxShortcut = {
    name: Blockly.navigation.actionNames.TOOLBOX,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_WS:
          if (!workspace.getToolbox()) {
            Blockly.navigation.focusFlyout_(workspace);
          } else {
            Blockly.navigation.focusToolbox_(workspace);
          }
          return true;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(focusToolboxShortcut);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.T, focusToolboxShortcut.name);
};

/**
 * Keyboard shortcut to exit the current location and focus on the workspace
 * when in keyboard navigation mode.
 */
Blockly.navigation.registerExit = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var exitShortcut = {
    name: Blockly.navigation.actionNames.EXIT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode;
    },
    callback: function(workspace) {
      switch (Blockly.navigation.currentState_) {
        case Blockly.navigation.STATE_FLYOUT:
          Blockly.navigation.focusWorkspace_(workspace);
          return true;
        case Blockly.navigation.STATE_TOOLBOX:
          Blockly.navigation.focusWorkspace_(workspace);
          return true;
        default:
          return false;
      }
    }
  };

  Blockly.ShortcutRegistry.registry.register(exitShortcut, true);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.ESC, exitShortcut.name, true);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      Blockly.utils.KeyCodes.E, exitShortcut.name, true);
};

/** Keyboard shortcut to turn keyboard navigation on or off. */
Blockly.navigation.registerToggleKeyboardNav = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var toggleKeyboardNavShortcut = {
    name: Blockly.navigation.actionNames.TOGGLE_KEYBOARD_NAV,
    callback: function(workspace) {
      if (workspace.keyboardAccessibilityMode) {
        Blockly.navigation.disableKeyboardAccessibility();
      } else {
        Blockly.navigation.enableKeyboardAccessibility();
      }
      return true;
    }
  };

  Blockly.ShortcutRegistry.registry.register(toggleKeyboardNavShortcut);
  var ctrlShiftK = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.K,
      [Blockly.utils.KeyCodes.CTRL, Blockly.utils.KeyCodes.SHIFT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      ctrlShiftK, toggleKeyboardNavShortcut.name);
};

/**
 * Keyboard shortcut to move the cursor on the workspace to the left when in
 * keyboard navigation mode.
 */
Blockly.navigation.registerWorkspaceMoveLeft = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var wsMoveLeftShortcut = {
    name: Blockly.navigation.actionNames.MOVE_WS_CURSOR_LEFT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      return Blockly.navigation.moveWSCursor_(workspace, -1, 0);
    }
  };

  Blockly.ShortcutRegistry.registry.register(wsMoveLeftShortcut);
  var shiftA = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.A, [Blockly.utils.KeyCodes.SHIFT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      shiftA, wsMoveLeftShortcut.name);
};

/**
 * Keyboard shortcut to move the cursor on the workspace to the right when in
 * keyboard navigation mode.
 */
Blockly.navigation.registerWorkspaceMoveRight = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var wsMoveRightShortcut = {
    name: Blockly.navigation.actionNames.MOVE_WS_CURSOR_RIGHT,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      return Blockly.navigation.moveWSCursor_(workspace, 1, 0);
    }
  };

  Blockly.ShortcutRegistry.registry.register(wsMoveRightShortcut);
  var shiftD = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.D, [Blockly.utils.KeyCodes.SHIFT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      shiftD, wsMoveRightShortcut.name);
};

/**
 * Keyboard shortcut to move the cursor on the workspace up when in keyboard
 * navigation mode.
 */
Blockly.navigation.registerWorkspaceMoveUp = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var wsMoveUpShortcut = {
    name: Blockly.navigation.actionNames.MOVE_WS_CURSOR_UP,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      return Blockly.navigation.moveWSCursor_(workspace, 0, -1);
    }
  };

  Blockly.ShortcutRegistry.registry.register(wsMoveUpShortcut);
  var shiftW = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.W, [Blockly.utils.KeyCodes.SHIFT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      shiftW, wsMoveUpShortcut.name);
};

/**
 * Keyboard shortcut to move the cursor on the workspace down when in keyboard
 * navigation mode.
 */
Blockly.navigation.registerWorkspaceMoveDown = function() {
  /** @type {!Blockly.ShortcutRegistry.KeyboardShortcut} */
  var wsMoveDownShortcut = {
    name: Blockly.navigation.actionNames.MOVE_WS_CURSOR_DOWN,
    preconditionFn: function(workspace) {
      return workspace.keyboardAccessibilityMode && !workspace.options.readOnly;
    },
    callback: function(workspace) {
      return Blockly.navigation.moveWSCursor_(workspace, 0, 1);
    }
  };

  Blockly.ShortcutRegistry.registry.register(wsMoveDownShortcut);
  var shiftW = Blockly.ShortcutRegistry.registry.createSerializedKey(
      Blockly.utils.KeyCodes.S, [Blockly.utils.KeyCodes.SHIFT]);
  Blockly.ShortcutRegistry.registry.addKeyMapping(
      shiftW, wsMoveDownShortcut.name);
};

/**
 * Registers all default keyboard shortcut items for keyboard navigation. This
 * should be called once per instance of KeyboardShortcutRegistry.
 * @package
 */
Blockly.navigation.registerNavigationShortcuts = function() {
  Blockly.navigation.registerIn();
  Blockly.navigation.registerNext();
  Blockly.navigation.registerOut();
  Blockly.navigation.registerPrevious();

  Blockly.navigation.registerWorkspaceMoveDown();
  Blockly.navigation.registerWorkspaceMoveLeft();
  Blockly.navigation.registerWorkspaceMoveRight();
  Blockly.navigation.registerWorkspaceMoveUp();

  Blockly.navigation.registerDisconnect();
  Blockly.navigation.registerExit();
  Blockly.navigation.registerInsert();
  Blockly.navigation.registerMark();
  Blockly.navigation.registerToggleKeyboardNav();
  Blockly.navigation.registerToolboxFocus();
};
