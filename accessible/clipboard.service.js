/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Service that handles the clipboard and marked spots.
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.ClipboardService = ng.core
  .Class({
    constructor: [
        blocklyApp.NotificationsService, blocklyApp.UtilsService,
        blocklyApp.AudioService,
        function(_notificationsService, _utilsService, _audioService) {
      this.clipboardBlockXml_ = null;
      this.clipboardBlockPreviousConnection_ = null;
      this.clipboardBlockNextConnection_ = null;
      this.clipboardBlockOutputConnection_ = null;
      this.markedConnection_ = null;
      this.notificationsService = _notificationsService;
      this.utilsService = _utilsService;
      this.audioService = _audioService;
    }],
    areConnectionsCompatible_: function(blockConnection, connection) {
      // Check that both connections exist, that it's the right kind of
      // connection, and that the types match.
      return Boolean(
          connection && blockConnection &&
          Blockly.OPPOSITE_TYPE[blockConnection.type] == connection.type &&
          connection.checkType_(blockConnection));
    },
    isCompatibleWithClipboard: function(connection) {
      var previousConnection = this.clipboardBlockPreviousConnection_;
      var nextConnection = this.clipboardBlockNextConnection_;
      var outputConnection = this.clipboardBlockOutputConnection_;
      return Boolean(
          this.areConnectionsCompatible_(connection, previousConnection) ||
          this.areConnectionsCompatible_(connection, nextConnection) ||
          this.areConnectionsCompatible_(connection, outputConnection));
    },
    getMarkedConnectionBlock: function() {
      if (!this.markedConnection_) {
        return null;
      } else {
        return this.markedConnection_.getSourceBlock();
      }
    },
    isAnyConnectionMarked: function() {
      return Boolean(this.markedConnection_);
    },
    isMovableToMarkedConnection: function(block) {
      // It should not be possible to move any ancestor of the block containing
      // the marked spot to the marked spot.
      if (!this.markedConnection_) {
        return false;
      }

      var markedSpotAncestorBlock = this.getMarkedConnectionBlock();
      while (markedSpotAncestorBlock) {
        if (markedSpotAncestorBlock.id == block.id) {
          return false;
        }
        markedSpotAncestorBlock = markedSpotAncestorBlock.getParent();
      }

      return this.canBeCopiedToMarkedConnection(block);
    },
    canBeCopiedToMarkedConnection: function(block) {
      if (!this.markedConnection_ ||
          !this.markedConnection_.getSourceBlock().workspace) {
        return false;
      }

      var potentialConnections = [
          block.outputConnection,
          block.previousConnection,
          block.nextConnection
      ];

      var that = this;
      return potentialConnections.some(function(connection) {
        return that.areConnectionsCompatible_(
            connection, that.markedConnection_);
      });
    },
    markConnection: function(connection) {
      this.markedConnection_ = connection;
      this.notificationsService.setStatusMessage(Blockly.Msg.MARKED_SPOT_MSG);
    },
    cut: function(block) {
      this.copy(block);
      block.dispose(true);
    },
    copy: function(block) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom(block);
      Blockly.Xml.deleteNext(this.clipboardBlockXml_);
      this.clipboardBlockPreviousConnection_ = block.previousConnection;
      this.clipboardBlockNextConnection_ = block.nextConnection;
      this.clipboardBlockOutputConnection_ = block.outputConnection;
    },
    isClipboardEmpty: function() {
      return !this.clipboardBlockXml_;
    },
    pasteFromClipboard: function(inputConnection) {
      var connection = inputConnection;
      // If the connection is a 'previousConnection' and that connection is
      // already joined to something, use the 'nextConnection' of the
      // previous block instead in order to do an insertion.
      if (inputConnection.type == Blockly.PREVIOUS_STATEMENT &&
          inputConnection.isConnected()) {
        connection = inputConnection.targetConnection;
      }

      var reconstitutedBlock = Blockly.Xml.domToBlock(blocklyApp.workspace,
          this.clipboardBlockXml_);
      switch (connection.type) {
        case Blockly.NEXT_STATEMENT:
          connection.connect(reconstitutedBlock.previousConnection);
          break;
        case Blockly.PREVIOUS_STATEMENT:
          connection.connect(reconstitutedBlock.nextConnection);
          break;
        default:
          connection.connect(reconstitutedBlock.outputConnection);
      }
      this.audioService.playConnectSound();
      this.notificationsService.setStatusMessage(
          this.utilsService.getBlockDescription(reconstitutedBlock) + ' ' +
          Blockly.Msg.PASTED_BLOCK_FROM_CLIPBOARD_MSG);
      return reconstitutedBlock.id;
    },
    pasteToMarkedConnection: function(block) {
      var xml = Blockly.Xml.blockToDom(block);
      var reconstitutedBlock = Blockly.Xml.domToBlock(
          blocklyApp.workspace, xml);

      var potentialConnections = [
          reconstitutedBlock.outputConnection,
          reconstitutedBlock.previousConnection,
          reconstitutedBlock.nextConnection
      ];

      var connectionSuccessful = false;
      for (var i = 0; i < potentialConnections.length; i++) {
        if (this.areConnectionsCompatible_(
            this.markedConnection_, potentialConnections[i])) {
          this.markedConnection_.connect(potentialConnections[i]);
          this.audioService.playConnectSound();
          connectionSuccessful = true;
          break;
        }
      }

      if (!connectionSuccessful) {
        console.error('ERROR: Could not connect block to marked spot.');
        return;
      }

      this.markedConnection_ = null;

      return reconstitutedBlock.id;
    }
  });
