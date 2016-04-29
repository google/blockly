var blocklyApp = blocklyApp || {};

blocklyApp.ClipboardService = ng.core
  .Class({
    constructor: function() {
      this.clipboardBlockXml;
      this.clipboardBlockSuperiorConnection;
      this.markedConnection;
    },
    cut: function(block) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom(block);
      this.clipboardBlockSuperiorConnection = block.outputConnection ||
          block.previousConnection;
      this.clipboardBlockNextConnection = block.nextConnection;
      block.dispose(true);
      console.log('cut');
    },
    copy: function(block) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom(block);
      this.clipboardBlockSuperiorConnection = block.outputConnection ||
          block.previousConnection;
      this.clipboardBlockNextConnection = block.nextConnection;
    },
    paste: function(connection) {
      var blockOnProperWorkspace = Blockly.Xml.domToBlock(blocklyApp.workspace,
          this.clipboardBlockXml_);
      switch (connection.type) {
        case Blockly.NEXT_STATEMENT:
          connection.connect(blockOnProperWorkspace.previousConnection);
          break;
        case Blockly.PREVIOUS_STATEMENT:
          connection.connect(blockOnProperWorkspace.nextConnection);
          break;
        default:
          connection.connect(blockOnProperWorkspace.outputConnection);
      }
    },
    pasteToMarkedConnection: function(block) {
      var xml = Blockly.Xml.blockToDom(block);
      var blockOnProperWorkspace =
        Blockly.Xml.domToBlock(blocklyApp.workspace, xml);
      this.markedConnection.connect(
          blockOnProperWorkspace.outputConnection ||
          blockOnProperWorkspace.previousConnection);
    },
    markConnection: function(connection) {
      this.markedConnection = connection;
    },
    isCompatibleWithConnection_: function(blockConnection, connection, debug) {
      //the connection and blockConnection exist
      if (!connection || !blockConnection) {
        return false;
      }

      //the types match and it's the right kind of connection
      var result = Blockly.OPPOSITE_TYPE[blockConnection.type] ==
            connection.type &&
            connection.checkType_(blockConnection);

      if (debug) {
        // console.log('checking: input ' + blockConnection.check_ +
        //     ' and clipboard ' + connection.check_);
        // console.log('the blocks have the opposite connection types: ' +
        //     (Blockly.OPPOSITE_TYPE[blockConnection.type] ==
        //     connection.type));
        // console.log(
        //     'the blocks are of compatible types: ' +
        //     connection.checkType_(blockConnection));
        if (result){
          console.log('Blocks should be connected');
        } else {
          console.log('Blocks should be connected');
        }
      }
      return result;
    },
    isBlockCompatibleWithMarkedConnection: function(block, debug) {
      var blockConnection = block.outputConnection || block.previousConnection;
      return this.markedConnection &&
          this.markedConnection.sourceBlock_.workspace != null &&
          this.isCompatibleWithConnection_(
              blockConnection, this.markedConnection, debug);
    },
    isConnectionCompatibleWithClipboard: function(connection, debug) {
      if (debug) {
        console.log('connection:');
        console.log(connection);
        console.log('clipboardBlockSuperiorConnection is:');
        console.log(this.clipboardBlockSuperiorConnection);
        console.log('clipboardBlockNextConnection is:');
        console.log(this.clipboardBlockNextConnection);
      }
      return this.isCompatibleWithConnection_(connection,
          this.clipboardBlockSuperiorConnection, debug) ||
          this.isCompatibleWithConnection_(connection,
          this.clipboardBlockNextConnection, debug);
    }
  });
