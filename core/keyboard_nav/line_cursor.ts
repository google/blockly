/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing a line cursor.
 * A line cursor tries to traverse the blocks and connections on a block as if
 * they were lines of code in a text editor. Previous and next traverse previous
 * connections, next connections and blocks, while in and out traverse input
 * connections and fields.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

import {BlockSvg} from '../block_svg.js';
import {FieldCheckbox} from '../field_checkbox.js';
import {FieldDropdown} from '../field_dropdown.js';
import {FieldImage} from '../field_image.js';
import {FieldLabel} from '../field_label.js';
import {FieldNumber} from '../field_number.js';
import {FieldTextInput} from '../field_textinput.js';
import {FlyoutButton} from '../flyout_button.js';
import {FlyoutSeparator} from '../flyout_separator.js';
import {getFocusManager} from '../focus_manager.js';
import {isFocusableNode} from '../interfaces/i_focusable_node.js';
import type {INavigable} from '../interfaces/i_navigable.js';
import * as registry from '../registry.js';
import {RenderedConnection} from '../rendered_connection.js';
import {Renderer} from '../renderers/zelos/renderer.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {BlockNavigationPolicy} from './block_navigation_policy.js';
import {ConnectionNavigationPolicy} from './connection_navigation_policy.js';
import {FieldNavigationPolicy} from './field_navigation_policy.js';
import {FlyoutButtonNavigationPolicy} from './flyout_button_navigation_policy.js';
import {FlyoutNavigationPolicy} from './flyout_navigation_policy.js';
import {FlyoutSeparatorNavigationPolicy} from './flyout_separator_navigation_policy.js';
import {Marker} from './marker.js';
import {WorkspaceNavigationPolicy} from './workspace_navigation_policy.js';

/** Options object for LineCursor instances. */
export interface CursorOptions {
  /**
   * Can the cursor visit all stack connections (next/previous), or
   * (if false) only unconnected next connections?
   */
  stackConnections: boolean;
}

/** Default options for LineCursor instances. */
const defaultOptions: CursorOptions = {
  stackConnections: true,
};

/**
 * Class for a line cursor.
 */
export class LineCursor extends Marker {
  override type = 'cursor';

  /** Options for this line cursor. */
  private readonly options: CursorOptions;

  /** Locations to try moving the cursor to after a deletion. */
  private potentialNodes: INavigable<any>[] | null = null;

  /** Whether the renderer is zelos-style. */
  private isZelos = false;

  /**
   * @param workspace The workspace this cursor belongs to.
   * @param options Cursor options.
   */
  constructor(
    protected readonly workspace: WorkspaceSvg,
    options?: Partial<CursorOptions>,
  ) {
    super();
    // Regularise options and apply defaults.
    this.options = {...defaultOptions, ...options};

    this.isZelos = workspace.getRenderer() instanceof Renderer;

    this.registerNavigationPolicies();
  }

  /**
   * Registers default navigation policies for Blockly's built-in types with
   * this cursor's workspace.
   */
  protected registerNavigationPolicies() {
    const navigator = this.workspace.getNavigator();

    const blockPolicy = new BlockNavigationPolicy();
    if (this.workspace.isFlyout) {
      const flyout = this.workspace.targetWorkspace?.getFlyout();
      if (flyout) {
        navigator.set(
          BlockSvg,
          new FlyoutNavigationPolicy(blockPolicy, flyout),
        );

        const buttonPolicy = new FlyoutButtonNavigationPolicy();
        navigator.set(
          FlyoutButton,
          new FlyoutNavigationPolicy(buttonPolicy, flyout),
        );

        navigator.set(
          FlyoutSeparator,
          new FlyoutNavigationPolicy(
            new FlyoutSeparatorNavigationPolicy(),
            flyout,
          ),
        );
      }
    } else {
      navigator.set(BlockSvg, blockPolicy);
    }

    navigator.set(RenderedConnection, new ConnectionNavigationPolicy());
    navigator.set(WorkspaceSvg, new WorkspaceNavigationPolicy());

    const fieldPolicy = new FieldNavigationPolicy();
    navigator.set(FieldCheckbox, fieldPolicy);
    navigator.set(FieldDropdown, fieldPolicy);
    navigator.set(FieldImage, fieldPolicy);
    navigator.set(FieldLabel, fieldPolicy);
    navigator.set(FieldNumber, fieldPolicy);
    navigator.set(FieldTextInput, fieldPolicy);
  }

  /**
   * Moves the cursor to the next previous connection, next connection or block
   * in the pre order traversal. Finds the next node in the pre order traversal.
   *
   * @returns The next node, or null if the current node is
   *     not set or there is no next value.
   */
  next(): INavigable<any> | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getNextNode(
      curNode,
      (candidate: INavigable<any> | null) => {
        return (
          candidate instanceof BlockSvg &&
          !candidate.outputConnection?.targetBlock()
        );
      },
      true,
    );

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Moves the cursor to the next input connection or field
   * in the pre order traversal.
   *
   * @returns The next node, or null if the current node is
   *     not set or there is no next value.
   */
  in(): INavigable<any> | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }

    const newNode = this.getNextNode(curNode, () => true, true);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }
  /**
   * Moves the cursor to the previous next connection or previous connection in
   * the pre order traversal.
   *
   * @returns The previous node, or null if the current node
   *     is not set or there is no previous value.
   */
  prev(): INavigable<any> | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }
    const newNode = this.getPreviousNode(
      curNode,
      (candidate: INavigable<any> | null) => {
        return (
          candidate instanceof BlockSvg &&
          !candidate.outputConnection?.targetBlock()
        );
      },
      true,
    );

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Moves the cursor to the previous input connection or field in the pre order
   * traversal.
   *
   * @returns The previous node, or null if the current node
   *     is not set or there is no previous value.
   */
  out(): INavigable<any> | null {
    const curNode = this.getCurNode();
    if (!curNode) {
      return null;
    }

    const newNode = this.getPreviousNode(curNode, () => true, true);

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Returns true iff the node to which we would navigate if in() were
   * called is the same as the node to which we would navigate if next() were
   * called - in effect, if the LineCursor is at the end of the 'current
   * line' of the program.
   */
  atEndOfLine(): boolean {
    const curNode = this.getCurNode();
    if (!curNode) return false;
    const inNode = this.getNextNode(curNode, () => true, true);
    const nextNode = this.getNextNode(
      curNode,
      (candidate: INavigable<any> | null) => {
        return (
          candidate instanceof BlockSvg &&
          !candidate.outputConnection?.targetBlock()
        );
      },
      true,
    );

    return inNode === nextNode;
  }

  /**
   * Uses pre order traversal to navigate the Blockly AST. This will allow
   * a user to easily navigate the entire Blockly AST without having to go in
   * and out levels on the tree.
   *
   * @param node The current position in the AST.
   * @param isValid A function true/false depending on whether the given node
   *     should be traversed.
   * @param visitedNodes A set of previously visited nodes used to avoid cycles.
   * @returns The next node in the traversal.
   */
  private getNextNodeImpl(
    node: INavigable<any> | null,
    isValid: (p1: INavigable<any> | null) => boolean,
    visitedNodes: Set<INavigable<any>> = new Set<INavigable<any>>(),
  ): INavigable<any> | null {
    if (!node || visitedNodes.has(node)) return null;
    let newNode =
      this.workspace.getNavigator().getFirstChild(node) ||
      this.workspace.getNavigator().getNextSibling(node);

    let target = node;
    while (target && !newNode) {
      const parent = this.workspace.getNavigator().getParent(target);
      if (!parent) break;
      newNode = this.workspace.getNavigator().getNextSibling(parent);
      target = parent;
    }

    if (isValid(newNode)) return newNode;
    if (newNode) {
      visitedNodes.add(node);
      return this.getNextNodeImpl(newNode, isValid, visitedNodes);
    }
    return null;
  }

  /**
   * Get the next node in the AST, optionally allowing for loopback.
   *
   * @param node The current position in the AST.
   * @param isValid A function true/false depending on whether the given node
   *     should be traversed.
   * @param loop Whether to loop around to the beginning of the workspace if no
   *     valid node was found.
   * @returns The next node in the traversal.
   */
  getNextNode(
    node: INavigable<any> | null,
    isValid: (p1: INavigable<any> | null) => boolean,
    loop: boolean,
  ): INavigable<any> | null {
    if (!node || (!loop && this.getLastNode() === node)) return null;

    return this.getNextNodeImpl(node, isValid);
  }

  /**
   * Reverses the pre order traversal in order to find the previous node. This
   * will allow a user to easily navigate the entire Blockly AST without having
   * to go in and out levels on the tree.
   *
   * @param node The current position in the AST.
   * @param isValid A function true/false depending on whether the given node
   *     should be traversed.
   * @param visitedNodes A set of previously visited nodes used to avoid cycles.
   * @returns The previous node in the traversal or null if no previous node
   *     exists.
   */
  private getPreviousNodeImpl(
    node: INavigable<any> | null,
    isValid: (p1: INavigable<any> | null) => boolean,
    visitedNodes: Set<INavigable<any>> = new Set<INavigable<any>>(),
  ): INavigable<any> | null {
    if (!node || visitedNodes.has(node)) return null;

    const newNode =
      this.getRightMostChild(
        this.workspace.getNavigator().getPreviousSibling(node),
        node,
      ) || this.workspace.getNavigator().getParent(node);

    if (isValid(newNode)) return newNode;
    if (newNode) {
      visitedNodes.add(node);
      return this.getPreviousNodeImpl(newNode, isValid, visitedNodes);
    }
    return null;
  }

  /**
   * Get the previous node in the AST, optionally allowing for loopback.
   *
   * @param node The current position in the AST.
   * @param isValid A function true/false depending on whether the given node
   *     should be traversed.
   * @param loop Whether to loop around to the end of the workspace if no valid
   *     node was found.
   * @returns The previous node in the traversal or null if no previous node
   *     exists.
   */
  getPreviousNode(
    node: INavigable<any> | null,
    isValid: (p1: INavigable<any> | null) => boolean,
    loop: boolean,
  ): INavigable<any> | null {
    if (!node || (!loop && this.getFirstNode() === node)) return null;

    return this.getPreviousNodeImpl(node, isValid);
  }

  /**
   * Get the right most child of a node.
   *
   * @param node The node to find the right most child of.
   * @returns The right most child of the given node, or the node if no child
   *     exists.
   */
  getRightMostChild(
    node: INavigable<any> | null,
    stopIfFound: INavigable<any>,
  ): INavigable<any> | null {
    if (!node) return node;
    let newNode = this.workspace.getNavigator().getFirstChild(node);
    if (!newNode || newNode === stopIfFound) return node;
    for (
      let nextNode: INavigable<any> | null = newNode;
      nextNode;
      nextNode = this.workspace.getNavigator().getNextSibling(newNode)
    ) {
      if (nextNode === stopIfFound) break;
      newNode = nextNode;
    }
    return this.getRightMostChild(newNode, stopIfFound);
  }

  /**
   * Prepare for the deletion of a block by making a list of nodes we
   * could move the cursor to afterwards and save it to
   * this.potentialNodes.
   *
   * After the deletion has occurred, call postDelete to move it to
   * the first valid node on that list.
   *
   * The locations to try (in order of preference) are:
   *
   * - The current location.
   * - The connection to which the deleted block is attached.
   * - The block connected to the next connection of the deleted block.
   * - The parent block of the deleted block.
   * - A location on the workspace beneath the deleted block.
   *
   * N.B.: When block is deleted, all of the blocks conneccted to that
   * block's inputs are also deleted, but not blocks connected to its
   * next connection.
   *
   * @param deletedBlock The block that is being deleted.
   */
  preDelete(deletedBlock: BlockSvg) {
    const curNode = this.getCurNode();

    const nodes: INavigable<any>[] = curNode ? [curNode] : [];
    // The connection to which the deleted block is attached.
    const parentConnection =
      deletedBlock.previousConnection?.targetConnection ??
      deletedBlock.outputConnection?.targetConnection;
    if (parentConnection) {
      nodes.push(parentConnection);
    }
    // The block connected to the next connection of the deleted block.
    const nextBlock = deletedBlock.getNextBlock();
    if (nextBlock) {
      nodes.push(nextBlock);
    }
    //  The parent block of the deleted block.
    const parentBlock = deletedBlock.getParent();
    if (parentBlock) {
      nodes.push(parentBlock);
    }
    // A location on the workspace beneath the deleted block.
    // Move to the workspace.
    nodes.push(this.workspace);
    this.potentialNodes = nodes;
  }

  /**
   * Move the cursor to the first valid location in
   * this.potentialNodes, following a block deletion.
   */
  postDelete() {
    const nodes = this.potentialNodes;
    this.potentialNodes = null;
    if (!nodes) throw new Error('must call preDelete first');
    for (const node of nodes) {
      if (!this.getSourceBlockFromNode(node)?.disposed) {
        this.setCurNode(node);
        return;
      }
    }
    throw new Error('no valid nodes in this.potentialNodes');
  }

  /**
   * Get the current location of the cursor.
   *
   * Overrides normal Marker getCurNode to update the current node from the
   * selected block. This typically happens via the selection listener but that
   * is not called immediately when `Gesture` calls
   * `Blockly.common.setSelected`. In particular the listener runs after showing
   * the context menu.
   *
   * @returns The current field, connection, or block the cursor is on.
   */
  override getCurNode(): INavigable<any> | null {
    this.updateCurNodeFromFocus();
    return super.getCurNode();
  }

  /**
   * Set the location of the cursor and draw it.
   *
   * Overrides normal Marker setCurNode logic to call
   * this.drawMarker() instead of this.drawer.draw() directly.
   *
   * @param newNode The new location of the cursor.
   */
  override setCurNode(newNode: INavigable<any> | null) {
    super.setCurNode(newNode);

    if (isFocusableNode(newNode)) {
      getFocusManager().focusNode(newNode);
    }

    // Try to scroll cursor into view.
    if (newNode instanceof BlockSvg) {
      newNode.workspace.scrollBoundsIntoView(
        newNode.getBoundingRectangleWithoutChildren(),
      );
    }
  }

  /**
   * Updates the current node to match what's currently focused.
   */
  private updateCurNodeFromFocus() {
    const focused = getFocusManager().getFocusedNode();

    if (focused instanceof BlockSvg) {
      const block: BlockSvg | null = focused;
      if (block && block.workspace === this.workspace) {
        this.setCurNode(block);
      }
    }
  }

  /**
   * Get the first navigable node on the workspace, or null if none exist.
   *
   * @returns The first navigable node on the workspace, or null.
   */
  getFirstNode(): INavigable<any> | null {
    return this.workspace.getNavigator().getFirstChild(this.workspace);
  }

  /**
   * Get the last navigable node on the workspace, or null if none exist.
   *
   * @returns The last navigable node on the workspace, or null.
   */
  getLastNode(): INavigable<any> | null {
    const first = this.getFirstNode();
    return this.getPreviousNode(first, () => true, true);
  }
}

registry.register(registry.Type.CURSOR, registry.DEFAULT, LineCursor);
