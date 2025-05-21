/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {BlockSvg} from '../block_svg.js';
import type {Field} from '../field.js';
import {
  DummyInput,
  EndRowInput,
  Input,
  StatementInput,
  ValueInput,
} from '../inputs.js';
import type {IFocusableNode} from '../interfaces/i_focusable_node.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';
import {WorkspaceSvg} from '../workspace_svg.js';

/**
 * Set of rules controlling keyboard navigation from a block.
 */
export class BlockNavigationPolicy implements INavigationPolicy<BlockSvg> {
  /**
   * Returns the first child of the given block.
   *
   * @param current The block to return the first child of.
   * @returns The first field or input of the given block, if any.
   */
  getFirstChild(current: BlockSvg): IFocusableNode | null {
    for (const input of current.inputList) {
      for (const field of input.fieldRow) {
        return field;
      }
      if (input.connection?.targetBlock())
        return input.connection.targetBlock() as BlockSvg;
    }

    return null;
  }

  /**
   * Returns the parent of the given block.
   *
   * @param current The block to return the parent of.
   * @returns The top block of the given block's stack, or the connection to
   *     which it is attached.
   */
  getParent(current: BlockSvg): IFocusableNode | null {
    if (current.previousConnection?.targetBlock()) {
      const surroundParent = current.getSurroundParent();
      if (surroundParent) return surroundParent;
    } else if (current.outputConnection?.targetBlock()) {
      return current.outputConnection.targetBlock();
    }

    return current.workspace;
  }

  /**
   * Returns the next peer node of the given block.
   *
   * @param current The block to find the following element of.
   * @returns The first block of the next stack if the given block is a terminal
   *     block, or its next connection.
   */
  getNextSibling(current: BlockSvg): IFocusableNode | null {
    if (current.nextConnection?.targetBlock()) {
      return current.nextConnection?.targetBlock();
    }

    const parent = this.getParent(current);
    let navigatingCrossStacks = false;
    let siblings: (BlockSvg | Field)[] = [];
    if (parent instanceof BlockSvg) {
      for (let i = 0, input; (input = parent.inputList[i]); i++) {
        if (
          i == 0 ||
          this.isStartOfRow(parent, input, parent.inputList[i - 1])
        ) {
          siblings.push(...input.fieldRow);
          const child = input.connection?.targetBlock();
          if (child) {
            siblings.push(child as BlockSvg);
          }
        }
      }
    } else if (parent instanceof WorkspaceSvg) {
      siblings = parent.getTopBlocks(true);
      navigatingCrossStacks = true;
    } else {
      return null;
    }

    const currentIndex = siblings.indexOf(
      navigatingCrossStacks ? current.getRootBlock() : current,
    );
    if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
      return siblings[currentIndex + 1];
    } else if (currentIndex === siblings.length - 1 && navigatingCrossStacks) {
      return siblings[0];
    }

    return null;
  }

  /**
   * Returns the previous peer node of the given block.
   *
   * @param current The block to find the preceding element of.
   * @returns The block's previous/output connection, or the last
   *     connection/block of the previous block stack if it is a root block.
   */
  getPreviousSibling(current: BlockSvg): IFocusableNode | null {
    if (current.previousConnection?.targetBlock()) {
      return current.previousConnection?.targetBlock();
    }

    const parent = this.getParent(current);
    let navigatingCrossStacks = false;
    let siblings: (BlockSvg | Field)[] = [];
    if (parent instanceof BlockSvg) {
      for (let i = 0, input; (input = parent.inputList[i]); i++) {
        if (input.connection) {
          siblings.push(...input.fieldRow);
          const child = input.connection.targetBlock();
          if (child) {
            siblings.push(child as BlockSvg);
          }
        }
      }
    } else if (parent instanceof WorkspaceSvg) {
      siblings = parent.getTopBlocks(true);
      navigatingCrossStacks = true;
    } else {
      return null;
    }

    const currentIndex = siblings.indexOf(current);
    let result: IFocusableNode | null = null;
    if (currentIndex >= 1) {
      result = siblings[currentIndex - 1];
    } else if (currentIndex === 0 && navigatingCrossStacks) {
      result = siblings[siblings.length - 1];
    }

    // If navigating to a previous stack, our previous sibling is the last
    // block in it.
    if (navigatingCrossStacks && result instanceof BlockSvg) {
      return result.lastConnectionInStack(false)?.getSourceBlock() ?? result;
    }

    return result;
  }

  /**
   * Returns whether or not the given block can be navigated to.
   *
   * @param current The instance to check for navigability.
   * @returns True if the given block can be focused.
   */
  isNavigable(current: BlockSvg): boolean {
    return current.canBeFocused();
  }

  /**
   * Returns whether the given object can be navigated from by this policy.
   *
   * @param current The object to check if this policy applies to.
   * @returns True if the object is a BlockSvg.
   */
  isApplicable(current: any): current is BlockSvg {
    return current instanceof BlockSvg;
  }

  /**
   * Checks whether an input is the first input on a row. This code is mostly
   * identical to RenderInfo.
   *
   * @param block The block these inputs are on.
   * @param currInput The current input.
   * @param prevInput The previous input.
   * @returns True if the current input is the start of a row.
   */
  protected isStartOfRow(
    block: BlockSvg,
    currInput: Input,
    prevInput?: Input,
  ): boolean {
    // First input is always the start of a row
    if (!prevInput) {
      return true;
    }
    // If the previous input was an end-row input, then any following input
    // should always be rendered on the next row.
    if (prevInput instanceof EndRowInput) {
      return true;
    }
    // A statement input or an input following one always gets a new row.
    if (
      currInput instanceof StatementInput ||
      prevInput instanceof StatementInput
    ) {
      return true;
    }
    // Value inputs, dummy inputs, and any input following an external value
    // input get a new row if inputs are not inlined.
    if (
      currInput instanceof ValueInput ||
      currInput instanceof DummyInput ||
      prevInput instanceof ValueInput
    ) {
      return !block.getInputsInline();
    }
    return false;
  }
}
