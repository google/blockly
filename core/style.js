'use strict';

goog.provide('Blockly.Style');
/**
 * Class for a style.
 * @param {Object.<string, Blockly.BlockStyle>} blockStyles A map from style
 * names (strings) to objects with color attributes.
 * @constructor
 */
Blockly.Style = function(blockStyles) {
  this.blockStyles_ = blockStyles;
};

/**
 * Overrides or adds all values from blockStyles to blockStyles_
 * @param {Object.<string, Blockly.BlockStyle>} blockStyles List of a
 * block styles.
 */
Blockly.Style.prototype.setAllBlockStyles = function(blockStyles) {
  for (var key in blockStyles) {
    this.setBlockStyle(key, blockStyles[key]);
  }
};

/**
 * Gets a list of all the block style names.
 * @return{Array.<String>} styleName List of blockstyle names.
 */
Blockly.Style.prototype.getAllBlockStyles = function() {
  return this.blockStyles_;
};

/**
 * Gets the BlockStyle for the given block style name.
 * @param{String} blockStyleName The name of the block style.
 * @return {Blockly.Style} The style with the block style name.
 */
Blockly.Style.prototype.getBlockStyle = function(blockStyleName) {
  return this.blockStyles_[blockStyleName];
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param{String} blockStyleName The name of the block style.
 * @param{Blockly.BlockStyle} blockStyle The block style
*/
Blockly.Style.prototype.setBlockStyle = function(blockStyleName, blockStyle){
  var event = new Blockly.Events.Ui(null, 'blockStyleChanged',
      this.blockStyles_[blockStyleName], blockStyle);
  this.blockStyles_[blockStyleName] = blockStyle;
  Blockly.Events.fire(event);
};
