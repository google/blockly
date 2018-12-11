'use strict';

goog.provide('Blockly.Style');
/**
 * Class for a style.
 * @param {Object.<string, Blockly.BlockStyle>} blockStyles A map from style
 * names (strings) to Blockly.BlockStyle objects.
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
  var event = new Blockly.Events.Ui(null, 'blockStylesChanged', this.blockStyles_, blockStyles);
  for (var key in blockStyles) {
    this.setBlockStyle(key, blockStyles[key]);
  }
  Blockly.Events.fire(event);
};

/**
 * Gets a list of all the block style names.
 * @return{Array.<String>} styleName List of blockstyle names.
 */
Blockly.Style.prototype.getAllBlockStyles = function() {
  return this.blockStyles_;
};

/**
 * Returns the BlockStyle for the given key.
 * @param{String} key The name of the block style.
 * @return {Blockly.Style} The style corresponding to the key???? <-- REDO
 */
Blockly.Style.prototype.getBlockStyle = function(key) {
  return this.blockStyles_[key];
};

/**
 * Overrides or adds a style to the blockStyles map.
 * @param{String} key The name of the block style.
 * @param{Blockly.BlockStyle} blockStyle The block style
*/
Blockly.Style.prototype.setBlockStyle = function(key, blockStyle){
  var event = new Blockly.Events.Ui(null, 'blockStyleChanged', this.blockStyles_[key], blockStyle);
  this.blockStyles_[key] = blockStyle;
  Blockly.Events.fire(event);
};
