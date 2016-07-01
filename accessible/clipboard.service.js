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
    constructor: function() {
      this.clipboardBlockXml_ = null;
      this.clipboardBlockSuperiorConnection_ = null;
      this.clipboardBlockNextConnection_ = null;
      this.markedConnection_ = null;
    },
    areConnectionsCompatible_: function(blockConnection, connection) {
      // Check that both connections exist, that it's the right kind of
      // connection, and that the types match.
      return Boolean(
          connection && blockConnection &&
          Blockly.OPPOSITE_TYPE[blockConnection.type] == connection.type &&
          connection.checkType_(blockConnection));
    },
    isCompatibleWithClipboard: function(connection) {
      var superiorConnection = this.clipboardBlockSuperiorConnection_;
      var nextConnection = this.clipboardBlockNextConnection_;
      return Boolean(
          this.areConnectionsCompatible_(connection, superiorConnection) ||
          this.areConnectionsCompatible_(connection, nextConnection));
    },
    isMovableToMarkedConnection: function(block) {
      // It should not be possible to move any ancestor of the block containing
      // the marked spot to the marked spot.
      if (!this.markedConnection_) {
        return false;
      }

      var markedSpotAncestorBlock = this.markedConnection_.getSourceBlock();
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
      alert(Blockly.Msg.MARKED_SPOT_MSG);
    },
    cut: function(block) {
      var blockSummary = block.toString();
      this.copy(block, false);
      block.dispose(true);
      alert(Blockly.Msg.CUT_BLOCK_MSG + blockSummary);
    },
    copy: function(block, announce) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom(block);
      this.clipboardBlockSuperiorConnection_ = block.outputConnection ||
          block.previousConnection;
      this.clipboardBlockNextConnection_ = block.nextConnection;
      if (announce) {
        alert(Blockly.Msg.COPIED_BLOCK_MSG + block.toString());
      }
    },
    pasteFromClipboard: function(connection) {
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
      alert(
          Blockly.Msg.PASTED_BLOCK_FROM_CLIPBOARD_MSG +
          reconstitutedBlock.toString());
    },
    pasteToMarkedConnection: function(block, announce) {
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
          connectionSuccessful = true;
          break;
        }
      }

      if (!connectionSuccessful) {
        console.error('ERROR: Could not connect block to marked spot.');
        return;
      }

      if (announce) {
        alert(
            Blockly.Msg.PASTED_BLOCK_TO_MARKED_SPOT_MSG +
            reconstitutedBlock.toString());
      }

      this.markedConnection_ = null;
    }
  });
