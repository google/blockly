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
import * as common from '../common.js';
import {ConnectionType} from '../connection_type.js';
import {Field} from '../field.js';
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
import type {MarkerSvg} from '../renderers/common/marker_svg.js';
import type {PathObject} from '../renderers/zelos/path_object.js';
import {Renderer} from '../renderers/zelos/renderer.js';
import * as dom from '../utils/dom.js';
import {WorkspaceSvg} from '../workspace_svg.js';
import {ASTNode} from './ast_node.js';
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
      this.workspace.isFlyout ? () => true : this.validLineNode.bind(this),
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
    const newNode = this.getNextNode(
      curNode,
      this.workspace.isFlyout ? () => true : this.validInLineNode.bind(this),
      true,
    );

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
      this.workspace.isFlyout ? () => true : this.validLineNode.bind(this),
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
    const newNode = this.getPreviousNode(
      curNode,
      this.workspace.isFlyout ? () => true : this.validInLineNode.bind(this),
      true,
    );

    if (newNode) {
      this.setCurNode(newNode);
    }
    return newNode;
  }

  /**
   * Returns true iff the node to which we would navigate if in() were
   * called, which will be a validInLineNode, is also a validLineNode
   * - in effect, if the LineCursor is at the end of the 'current
   * line' of the program.
   */
  atEndOfLine(): boolean {
    const curNode = this.getCurNode();
    if (!curNode) return false;
    const rightNode = this.getNextNode(
      curNode,
      this.validInLineNode.bind(this),
      false,
    );
    return this.validLineNode(rightNode);
  }

  /**
   * Returns true iff the given node represents the "beginning of a
   * new line of code" (and thus can be visited by pressing the
   * up/down arrow keys).  Specifically, if the node is for:
   *
   * - Any block that is not a value block.
   * - A top-level value block (one that is unconnected).
   * - An unconnected next statement input.
   * - An unconnected 'next' connection - the "blank line at the end".
   *   This is to facilitate connecting additional blocks to a
   *   stack/substack.
   *
   * If options.stackConnections is true (the default) then allow the
   * cursor to visit all (useful) stack connection by additionally
   * returning true for:
   *
   *   - Any next statement input
   *   - Any 'next' connection.
   *   - An unconnected previous statement input.
   *
   * @param node The AST node to check.
   * @returns True if the node should be visited, false otherwise.
   */
  protected validLineNode(node: INavigable<any> | null): boolean {
    if (!node) return false;

    if (node instanceof BlockSvg) {
      return !node.outputConnection?.isConnected();
    } else if (node instanceof RenderedConnection) {
      if (node.type === ConnectionType.NEXT_STATEMENT) {
        return this.options.stackConnections || !node.isConnected();
      } else if (node.type === ConnectionType.PREVIOUS_STATEMENT) {
        return this.options.stackConnections && !node.isConnected();
      }
    }

    return false;
  }

  /**
   * Returns true iff the given node can be visited by the cursor when
   * using the left/right arrow keys.  Specifically, if the node is
   * any node for which validLineNode would return true, plus:
   *
   * - Any block.
   * - Any field that is not a full block field.
   * - Any unconnected next or input connection.  This is to
   *   facilitate connecting additional blocks.
   *
   * @param node The AST node to check whether it is valid.
   * @returns True if the node should be visited, false otherwise.
   */
  protected validInLineNode(node: INavigable<any> | null): boolean {
    if (!node) return false;
    if (this.validLineNode(node)) return true;
    if (node instanceof BlockSvg) {
      return true;
    } else if (node instanceof Field) {
      return node.isNavigable();
    } else if (
      node instanceof RenderedConnection &&
      node.getParentInput() &&
      (node.type === ConnectionType.INPUT_VALUE ||
        node.type === ConnectionType.NEXT_STATEMENT)
    ) {
      return !node.isConnected();
    }

    return false;
  }

  /**
   * Returns true iff the given node can be visited by the cursor.
   * Specifically, if the node is any for which validInLineNode would
   * return true, or if it is a workspace node.
   *
   * @param node The AST node to check whether it is valid.
   * @returns True if the node should be visited, false otherwise.
   */
  protected validNode(node: INavigable<any> | null): boolean {
    return (
      !!node && (this.validInLineNode(node) || node instanceof WorkspaceSvg)
    );
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
    if (newNode?.isNavigable() && isValid(newNode)) return newNode;
    if (newNode) {
      visitedNodes.add(node);
      return this.getNextNodeImpl(newNode, isValid, visitedNodes);
    }

    newNode = this.findSiblingOrParentSibling(
      this.workspace.getNavigator().getParent(node),
    );
    if (newNode?.isNavigable() && isValid(newNode)) return newNode;
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
    let newNode: INavigable<any> | null = this.workspace
      .getNavigator()
      .getPreviousSibling(node);

    if (newNode) {
      newNode = this.getRightMostChild(newNode);
    } else {
      newNode = this.workspace.getNavigator().getParent(node);
    }

    if (newNode?.isNavigable() && isValid(newNode)) return newNode;
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
   * From the given node find either the next valid sibling or the parent's
   * next sibling.
   *
   * @param node The current position in the AST.
   * @returns The next sibling node, the parent's next sibling, or null.
   */
  private findSiblingOrParentSibling(
    node: INavigable<any> | null,
  ): INavigable<any> | null {
    if (!node) return null;
    const nextNode = this.workspace.getNavigator().getNextSibling(node);
    if (nextNode) return nextNode;
    return this.findSiblingOrParentSibling(
      this.workspace.getNavigator().getParent(node),
    );
  }

  /**
   * Get the right most child of a node.
   *
   * @param node The node to find the right most child of.
   * @returns The right most child of the given node, or the node if no child
   *     exists.
   */
  private getRightMostChild(node: INavigable<any>): INavigable<any> | null {
    let newNode = this.workspace.getNavigator().getFirstChild(node);
    if (!newNode) return node;
    for (
      let nextNode: INavigable<any> | null = newNode;
      nextNode;
      nextNode = this.workspace.getNavigator().getNextSibling(newNode)
    ) {
      newNode = nextNode;
    }
    return this.getRightMostChild(newNode);
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
      if (
        this.validNode(node) &&
        !this.toASTNode(node)?.getSourceBlock()?.disposed
      ) {
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
    if (!this.updateCurNodeFromFocus()) {
      // Fall back to selection if focus fails to sync. This can happen for
      // non-focusable nodes or for cases when focus may not properly propagate
      // (such as for mouse clicks).
      this.updateCurNodeFromSelection();
    }
    return super.getCurNode();
  }

  /**
   * Sets the object in charge of drawing the marker.
   *
   * We want to customize drawing, so rather than directly setting the given
   * object, we instead set a wrapper proxy object that passes through all
   * method calls and property accesses except for draw(), which it delegates
   * to the drawMarker() method in this class.
   *
   * @param drawer The object ~in charge of drawing the marker.
   */
  override setDrawer(drawer: MarkerSvg) {
    const altDraw = function (
      this: LineCursor,
      oldNode: ASTNode | null,
      curNode: ASTNode | null,
    ) {
      // Pass the unproxied, raw drawer object so that drawMarker can call its
      // `draw()` method without triggering infinite recursion.
      this.drawMarker(oldNode, curNode, drawer);
    }.bind(this);

    super.setDrawer(
      new Proxy(drawer, {
        get(target: typeof drawer, prop: keyof typeof drawer) {
          if (prop === 'draw') {
            return altDraw;
          }

          return target[prop];
        },
      }),
    );
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
   * Draw this cursor's marker.
   *
   * This is a wrapper around this.drawer.draw (usually implemented by
   * MarkerSvg.prototype.draw) that will, if newNode is a BLOCK node,
   * instead call `setSelected` to select it (if it's a regular block)
   * or `addSelect` (if it's a shadow block, since shadow blocks can't
   * be selected) instead of using the normal drawer logic.
   *
   * TODO(#142): The selection and fake-selection code was originally
   * a hack added for testing on October 28 2024, because the default
   * drawer (MarkerSvg) behaviour in Zelos was to draw a box around
   * the block and all attached child blocks, which was confusing when
   * navigating stacks.
   *
   * Since then we have decided that we probably _do_ in most cases
   * want navigating to a block to select the block, but more
   * particularly that we want navigation to move _focus_.  Replace
   * this selection hack with non-hacky changing of focus once that's
   * possible.
   *
   * @param oldNode The previous node.
   * @param curNode The current node.
   * @param realDrawer The object ~in charge of drawing the marker.
   */
  private drawMarker(
    oldNode: ASTNode | null,
    curNode: ASTNode | null,
    realDrawer: MarkerSvg,
  ) {
    // If old node was a block, unselect it or remove fake selection.
    if (oldNode?.getType() === ASTNode.types.BLOCK) {
      const block = oldNode.getLocation() as BlockSvg;
      if (!block.isShadow()) {
        // Selection should already be in sync.
      } else {
        block.removeSelect();
      }
    }

    if (this.isZelos && oldNode && this.isValueInputConnection(oldNode)) {
      this.hideAtInput(oldNode);
    }

    const curNodeType = curNode?.getType();
    const isZelosInputConnection =
      this.isZelos && curNode && this.isValueInputConnection(curNode);

    // If drawing can't be handled locally, just use the drawer.
    if (curNodeType !== ASTNode.types.BLOCK && !isZelosInputConnection) {
      realDrawer.draw(oldNode, curNode);
      return;
    }

    // Hide any visible marker SVG and instead do some manual rendering.
    realDrawer.hide();

    if (isZelosInputConnection) {
      this.showAtInput(curNode);
    } else if (curNode && curNodeType === ASTNode.types.BLOCK) {
      const block = curNode.getLocation() as BlockSvg;
      if (!block.isShadow()) {
        // Selection should already be in sync.
      } else {
        block.addSelect();
        block.getParent()?.removeSelect();
      }
    }

    // Call MarkerSvg.prototype.fireMarkerEvent like
    // MarkerSvg.prototype.draw would (even though it's private).
    (realDrawer as any)?.fireMarkerEvent?.(oldNode, curNode);
  }

  /**
   * Check whether the node represents a value input connection.
   *
   * @param node The node to check
   * @returns True if the node represents a value input connection.
   */
  private isValueInputConnection(node: ASTNode) {
    if (node?.getType() !== ASTNode.types.INPUT) return false;
    const connection = node.getLocation() as RenderedConnection;
    return connection.type === ConnectionType.INPUT_VALUE;
  }

  /**
   * Hide the cursor rendering at the given input node.
   *
   * @param node The input node to hide.
   */
  private hideAtInput(node: ASTNode) {
    const inputConnection = node.getLocation() as RenderedConnection;
    const sourceBlock = inputConnection.getSourceBlock() as BlockSvg;
    const input = inputConnection.getParentInput();
    if (input) {
      const pathObject = sourceBlock.pathObject as PathObject;
      const outlinePath = pathObject.getOutlinePath(input.name);
      dom.removeClass(outlinePath, 'inputActiveFocus');
    }
  }

  /**
   * Show the cursor rendering at the given input node.
   *
   * @param node The input node to show.
   */
  private showAtInput(node: ASTNode) {
    const inputConnection = node.getLocation() as RenderedConnection;
    const sourceBlock = inputConnection.getSourceBlock() as BlockSvg;
    const input = inputConnection.getParentInput();
    if (input) {
      const pathObject = sourceBlock.pathObject as PathObject;
      const outlinePath = pathObject.getOutlinePath(input.name);
      dom.addClass(outlinePath, 'inputActiveFocus');
    }
  }

  /**
   * Updates the current node to match the selection.
   *
   * Clears the current node if it's on a block but the selection is null.
   * Sets the node to a block if selected for our workspace.
   * For shadow blocks selections the parent is used by default (unless we're
   * already on the shadow block via keyboard) as that's where the visual
   * selection is.
   */
  private updateCurNodeFromSelection() {
    const curNode = super.getCurNode();
    const selected = common.getSelected();

    if (selected === null && curNode instanceof BlockSvg) {
      this.setCurNode(null);
      return;
    }
    if (selected?.workspace !== this.workspace) {
      return;
    }
    if (selected instanceof BlockSvg) {
      let block: BlockSvg | null = selected;
      if (selected.isShadow()) {
        // OK if the current node is on the parent OR the shadow block.
        // The former happens for clicks, the latter for keyboard nav.
        if (curNode && (curNode === block || curNode === block.getParent())) {
          return;
        }
        block = block.getParent();
      }
      if (block) {
        this.setCurNode(block);
      }
    }
  }

  /**
   * Updates the current node to match what's currently focused.
   *
   * @returns Whether the current node has been set successfully from the
   *     current focused node.
   */
  private updateCurNodeFromFocus(): boolean {
    const focused = getFocusManager().getFocusedNode();

    if (focused instanceof BlockSvg) {
      const block: BlockSvg | null = focused;
      if (block && block.workspace === this.workspace) {
        this.setCurNode(block);
        return true;
      }
    }

    return false;
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
