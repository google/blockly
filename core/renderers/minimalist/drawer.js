/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist rendering drawer.
 */
'use strict';

/**
 * Minimalist rendering drawer.
 * @class
 */
goog.module('Blockly.minimalist.Drawer');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Drawer: BaseDrawer} = goog.require('Blockly.blockRendering.Drawer');
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo} = goog.requireType('Blockly.minimalist.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @extends {BaseDrawer}
 * @alias Blockly.minimalist.Drawer
 */
class Drawer extends BaseDrawer {
  /**
   * @param {!BlockSvg} block The block to render.
   * @param {!RenderInfo} info An object containing all
   *   information needed to render this block.
   * @package
   */
  constructor(block, info) {
    super(block, info);
  }
}

exports.Drawer = Drawer;
