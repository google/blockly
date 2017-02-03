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
 * @fileoverview Angular2 Service for handling the mechanics of how blocks
 * get connected to each other.
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.BlockConnectionService = ng.core.Class({
  constructor: [
      blocklyApp.NotificationsService, blocklyApp.AudioService,
      function(_notificationsService, _audioService) {
    this.notificationsService = _notificationsService;
    this.audioService = _audioService;

    // When a user "adds a link" to a block, the connection representing this
    // link is stored here.
    this.markedConnection_ = null;
  }],
  findCompatibleConnection_: function(block) {
    // Locates and returns a connection on the given block that is compatible
    // with the marked connection, if one exists. Returns null if no such
    // connection exists.
    // Note: this currently ignores input connections on the given block, since
    // one doesn't usually mark an output connection and attach a block to it.
    if (!this.markedConnection_ ||
        !this.markedConnection_.getSourceBlock().workspace) {
      return null;
    }

    var desiredType = Blockly.OPPOSITE_TYPE[this.markedConnection_.type];
    var potentialConnection = (
        desiredType == Blockly.OUTPUT_VALUE ? block.outputConnection :
        desiredType == Blockly.PREVIOUS_STATEMENT ? block.previousConnection :
        desiredType == Blockly.NEXT_STATEMENT ? block.nextConnection :
        null);

    if (potentialConnection &&
        potentialConnection.checkType_(this.markedConnection_)) {
      return potentialConnection;
    } else {
      return null;
    }
  },
  isAnyConnectionMarked: function() {
    return Boolean(this.markedConnection_);
  },
  getMarkedConnectionSourceBlock: function() {
    return this.markedConnection_ ?
        this.markedConnection_.getSourceBlock() : null;
  },
  canBeAttachedToMarkedConnection: function(block) {
    return Boolean(this.findCompatibleConnection_(block));
  },
  canBeMovedToMarkedConnection: function(block) {
    if (!this.markedConnection_) {
      return false;
    }

    // It should not be possible to move any ancestor of the block containing
    // the marked connection to the marked connection.
    var ancestorBlock = this.getMarkedConnectionSourceBlock();
    while (ancestorBlock) {
      if (ancestorBlock.id == block.id) {
        return false;
      }
      ancestorBlock = ancestorBlock.getParent();
    }

    return this.canBeAttachedToMarkedConnection(block);
  },
  markConnection: function(connection) {
    this.markedConnection_ = connection;
    this.notificationsService.speak(Blockly.Msg.ADDED_LINK_MSG);
  },
  attachToMarkedConnection: function(block) {
    var xml = Blockly.Xml.blockToDom(block);
    var reconstitutedBlock = Blockly.Xml.domToBlock(blocklyApp.workspace, xml);

    var connection = this.findCompatibleConnection_(reconstitutedBlock);
    if (connection) {
      this.markedConnection_.connect(connection);
      this.markedConnection_ = null;
      this.audioService.playConnectSound();
      return reconstitutedBlock.id;
    } else {
      // We throw an error here, because we expect any UI controls that would
      // result in a non-connection to be disabled or hidden.
      throw Error(
          'Unable to connect block to marked connection. This should not ' +
          'happen.');
    }
  }
});
