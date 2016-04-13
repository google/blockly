var app = app || {};

app.ClipboardService = ng.core
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
    },
    copy: function(block) {
      this.clipboardBlockXml_ = Blockly.Xml.blockToDom(block);
      this.clipboardBlockSuperiorConnection = block.outputConnection ||
          block.previousConnection;
      this.clipboardBlockNextConnection = block.nextConnection;
    },
    paste: function(connection) {
      var blockOnProperWorkspace = Blockly.Xml.domToBlock(app.workspace,
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
        Blockly.Xml.domToBlock(app.workspace, xml);
      this.markedConnection.connect(
          blockOnProperWorkspace.outputConnection ||
          blockOnProperWorkspace.previousConnection);
    },
    markConnection: function(connection) {
      this.markedConnection = connection;
    },
    isCompatibleWithConnection_: function(blockConnection, connection) {
      //the connection and blockConnection exist
      if (!connection || !blockConnection) {
        return false;
      }
      //the types match and it's the right kind of connection
      var result = Blockly.OPPOSITE_TYPE[blockConnection.type] ==
            connection.type &&
            connection.checkType_(blockConnection);
      return result;
    },
    isBlockCompatibleWithMarkedConnection: function(block) {
      var blockConnection = block.outputConnection || block.previousConnection;
      return this.markedConnection &&
          this.markedConnection.sourceBlock_.workspace != null &&
          this.isCompatibleWithConnection_(
              blockConnection, this.markedConnection, debug);
    },
    isConnectionCompatibleWithClipboard: function(connection) {
      return this.isCompatibleWithConnection_(connection,
          this.clipboardBlockSuperiorConnection) ||
          this.isCompatibleWithConnection_(connection,
          this.clipboardBlockNextConnection);
    }
  });
