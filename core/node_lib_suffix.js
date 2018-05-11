// Expose Blockly global.
if (typeof module === 'object') {
  module.exports = Blockly;
}
if (typeof window === 'object') {
  window.Blockly === Blockly;
}
