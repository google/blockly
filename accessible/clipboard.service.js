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
    cut: function(block) {
      var blockSummary = block.toString();
      this.copy(block, false);
      block.dispose(true);
      blocklyApp.debug && console.log('cut');
      alert(Blockly.Msg.CUT_BLOCK_MSG + blockSummary);
    },
    copy: function(block, announce) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom(block);
      this.clipboardBlockSuperiorConnection_ = block.outputConnection ||
          block.previousConnection;
      this.clipboardBlockNextConnection_ = block.nextConnection;
      blocklyApp.debug && console.log('copy');
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
      blocklyApp.debug && console.log('paste');
      alert(Blockly.Msg.PASTED_BLOCK_FROM_CLIPBOARD_MSG + block.toString());
    },
    pasteToMarkedConnection: function(block, announce) {
      var xml = Blockly.Xml.blockToDom(block);
      var reconstitutedBlock =
          Blockly.Xml.domToBlock(blocklyApp.workspace, xml);
      this.markedConnection_.connect(
          reconstitutedBlock.outputConnection ||
          reconstitutedBlock.previousConnection);
      blocklyApp.debug && console.log('paste to marked connection');
      if (announce) {
        alert(Blockly.Msg.PASTED_BLOCK_TO_MARKED_SPOT_MSG + block.toString());
      }
    },
    markConnection: function(connection) {
      this.markedConnection_ = connection;
      blocklyApp.debug && console.log('mark connection');
      alert(Blockly.Msg.MARKED_SPOT_MSG);
    },
    isCompatibleWithConnection_: function(blockConnection, connection) {
      // Checking that the connection and blockConnection exist.
      if (!connection || !blockConnection) {
        return false;
      }

      // Checking that the types match and it's the right kind of connection.
      var isCompatible = Blockly.OPPOSITE_TYPE[blockConnection.type] ==
          connection.type && connection.checkType_(blockConnection);

      if (blocklyApp.debug) {
        if (isCompatible) {
          console.log('blocks should be connected');
        } else {
          console.log('blocks should not be connected');
        }
      }
      return isCompatible;
    },
    isBlockCompatibleWithMarkedConnection: function(block) {
      var blockConnection = block.outputConnection || block.previousConnection;
      return this.markedConnection_ &&
          this.markedConnection_.sourceBlock_.workspace &&
          this.isCompatibleWithConnection_(
              blockConnection, this.markedConnection_);
    },
    getClipboardCompatibilityHTMLText: function(connection) {
      if (this.isCompatibleWithConnection_(connection,
          this.clipboardBlockSuperiorConnection_) ||
          this.isCompatibleWithConnection_(connection,
          this.clipboardBlockNextConnection_)){
        return '';
      } else {
        return 'blockly-disabled';
      }
    }
  });
