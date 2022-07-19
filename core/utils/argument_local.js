 'use strict';

 /**
  * Utility methods for argument local block.
  * @class
  */
 goog.module('Blockly.utils.argumentLocal');

/**
 * Whether a block is both a shadow block and an argument.  These
 * blocks have special behaviour in scratch-blocks: they're duplicated when
 * dragged, and they are rendered slightly differently from normal shadow
 * blocks.
 * @param {!Blockly.BlockSvg} block The block that should be used to make this
 *     decision.
 * @return {boolean} True if the block should be duplicated on drag.
 * @package
 */

const isShadowArgumentLocal = function(block) {
  return block.isShadow() && block.type === 'argument_local';
};
exports.isShadowArgumentLocal = isShadowArgumentLocal;

/**
 * Whether a block is a argument local.
 * @param {!Blockly.BlockSvg} block The block that should be used to make this
 *     decision.
 * @return {boolean} True if the block is a argument local.
 */
const isArgumentLocal = function(block) {
  return block.type == 'argument_local';
};
exports.isArgumentLocal = isArgumentLocal;
 
