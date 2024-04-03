
/**
 * True to navigate to all fields. False to only navigate to clickable fields.
 * @type {boolean}
 */
ASTNode.NAVIGATE_ALL_FIELDS = false;

/**
 * The default y offset to use when moving the cursor from a stack to the
 * workspace.
 * @type {number}
 * @private
 */
ASTNode.DEFAULT_OFFSET_Y = -20;

/**
 * Gets the parent connection on a block.
 * This is either an output connection, previous connection or undefined.
 * If both connections exist return the one that is actually connected
 * to another block.
 * @param {!Block} block The block to find the parent connection on.
 * @return {Connection} The connection connecting to the parent of the
 *     block.
 * @private
 */
const getParentConnection = function(block) {
  let topConnection = block.outputConnection;
  if (!topConnection ||
      (block.previousConnection && block.previousConnection.isConnected())) {
    topConnection = block.previousConnection;
  }
  return topConnection;
};

exports.ASTNode = ASTNode;
