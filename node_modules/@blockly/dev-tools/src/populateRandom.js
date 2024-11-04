/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Helper for randomly populating a workspace.
 * @author fenichel@google.com (Rachel Fenichel)
 */
import * as Blockly from 'blockly/core';

/**
 * Populate the workspace with a random set of blocks, for testing.
 * @param {Blockly.Workspace} workspace The workspace to populate.
 * @param {number} count How many blocks to create.
 */
export function populateRandom(workspace, count) {
  const names = [];
  for (const blockName in Blockly.Blocks) {
    if (
      Object.prototype.hasOwnProperty.call(Blockly.Blocks, blockName) &&
      Object.prototype.hasOwnProperty.call(Blockly.Blocks[blockName], 'init')
    ) {
      names.push(blockName);
    }
  }

  for (let i = 0; i < count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const block = workspace.newBlock(name);
    block.initSvg();
    block
      .getSvgRoot()
      .setAttribute(
        'transform',
        'translate(' +
          Math.round(Math.random() * 450 + 40) +
          ', ' +
          Math.round(Math.random() * 600 + 40) +
          ')',
      );
    block.render();
  }
}
