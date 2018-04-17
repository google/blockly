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

goog.provide('blocklyApp.BlockConnectionService');

goog.require('blocklyApp.AudioService');
goog.require('blocklyApp.NotificationsService');


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
  findCompatibleConnection_: function(block, targetConnection) {
    // Locates and returns a connection on the given block that is compatible
    // with the target connection, if one exists. Returns null if no such
    // connection exists.
    // Note: the targetConnection is assumed to be the markedConnection_, or
    // possibly its counterpart (in the case where the marked connection is
    // currently attached to another connection). This method therefore ignores
    // input connections on the given block, since one doesn't usually mark an
    // output connection and attach a block to it.
    if (!targetConnection || !targetConnection.getSourceBlock().workspace) {
      return null;
    }

    var desiredType = Blockly.OPPOSITE_TYPE[targetConnection.type];
    var potentialConnection = (
        desiredType == Blockly.OUTPUT_VALUE ? block.outputConnection :
        desiredType == Blockly.PREVIOUS_STATEMENT ? block.previousConnection :
        desiredType == Blockly.NEXT_STATEMENT ? block.nextConnection :
        null);

    if (potentialConnection &&
        potentialConnection.checkType_(targetConnection)) {
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
    return Boolean(
        this.findCompatibleConnection_(block, this.markedConnection_));
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
    var reconstitutedBlock = Blockly.Xml.domToBlock(xml, blocklyApp.workspace);

    var targetConnection = null;
    if (this.markedConnection_.targetBlock() &&
        this.markedConnection_.type == Blockly.PREVIOUS_STATEMENT) {
      // Is the marked connection a 'previous' connection that is already
      // connected? If so, find the block that's currently connected to it, and
      // use that block's 'next' connection as the new marked connection.
      // Otherwise, splicing does not happen correctly, and inserting a block
      // in the middle of a group of two linked blocks will split the group.
      targetConnection = this.markedConnection_.targetConnection;
    } else {
      targetConnection = this.markedConnection_;
    }

    var connection = this.findCompatibleConnection_(
      reconstitutedBlock, targetConnection);
    if (connection) {
      targetConnection.connect(connection);

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
