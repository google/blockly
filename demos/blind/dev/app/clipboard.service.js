var app = app || {};

app.ClipboardService = ng.core
  .Class({
    constructor: function() {
      this.clipboardBlockXml;
      this.clipboardBlockConnection;
      this.markedConnection;
      // this.serviceId = Math.floor(Math.random() * (10 - 0 + 1)) + 0;
    },
    cut: function(block) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom_(block);
      this.clipboardBlockConnection = block.outputConnection ||
          block.previousConnection;
      block.dispose(true);
      console.log(this.clipboardBlockConnection);
      console.log('cut');
    },
    copy: function(block) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom_(block);
      this.clipboardBlockConnection = block.outputConnection ||
          block.previousConnection;
    },
    paste: function(connection) {
      var blockOnProperWorkspace = Blockly.Xml.domToBlock(app.workspace,
          this.clipboardBlockXml_);
      connection.connect(blockOnProperWorkspace.outputConnection ||
          blockOnProperWorkspace.previousConnection);
    },
    pasteToMarkedConnection: function(block) {
      var xml = Blockly.Xml.blockToDom_(block);
      var blockOnProperWorkspace =
        Blockly.Xml.domToBlock(app.workspace, xml);
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
        console.log('checking: input ' + blockConnection.check_ +
            ' and clipboard ' + connection.check_);
        console.log((Blockly.OPPOSITE_TYPE[blockConnection.type] ==
            connection.type));
        console.log(
            connection.checkType_(blockConnection));
      }
      return result;
    },
    isCompatibleWithMarkedConnection: function(block, debug) {
      var blockConnection = block.outputConnection || block.previousConnection;
      return this.markedConnection &&
          this.markedConnection.sourceBlock_.workspace != null &&
          this.isCompatibleWithConnection_(
              blockConnection, this.markedConnection, debug);
    },
    isCompatibleWithClipboard: function(input, debug) {
      if (debug && input.connection && this.clipboardBlockConnection) {
        console.log(input);
      }
      return this.isCompatibleWithConnection_(input.connection,
          this.clipboardBlockConnection, debug);
    }
  });
