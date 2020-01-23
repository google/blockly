
Blockly.NewCursor = function() {
  Blockly.NewCursor.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.NewCursor, Blockly.BasicCursor);

/**
 * Skip all nodes except for fields.
 * @param {Blockly.ASTNode} node The AST node to check whether it is valid.
 * @return {boolean} True if the node should be visited, false otherwise.
 * @override
 */
Blockly.NewCursor.prototype.validNode_ = function(node) {
  var isValid = false;
  var type = node && node.getType();
  if (node) {
    var location = node.getLocation();
    if (type == Blockly.ASTNode.types.FIELD) {
      isValid = true;
    }
  }
  return isValid;
};