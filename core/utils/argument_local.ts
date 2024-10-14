'use strict';

/**
 * Utility methods for argument local block.
 *
 * @class
 */

import {BlockSvg} from '../block_svg.js';

/**
 * Whether a block is both a shadow block and an argument.  These
 * blocks have special behaviour in scratch-blocks: they're duplicated when
 * dragged, and they are rendered slightly differently from normal shadow
 * blocks.
 *
 * @param {!BlockSvg} block The block that should be used to make this
 *     decision.
 * @returns {boolean} True if the block should be duplicated on drag.
 * @package
 */
export const isShadowArgumentLocal = function (block: BlockSvg) {
  return block.isShadow() && block.type === 'argument_local';
};

/**
 * Whether a block is an argument local.
 *
 * @param {!BlockSvg} block The block that should be used to make this
 *     decision.
 * @returns {boolean} True if the block is an argument local.
 */
export const isArgumentLocal = function (block: BlockSvg) {
  return block.type == 'argument_local';
};
