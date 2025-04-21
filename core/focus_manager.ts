/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from './interfaces/i_focusable_node.js';
import type {IFocusableTree} from './interfaces/i_focusable_tree.js';
import * as dom from './utils/dom.js';
import {FocusableTreeTraverser} from './utils/focusable_tree_traverser.js';

/**
 * Type declaration for returning focus to FocusManager upon completing an
 * ephemeral UI flow (such as a dialog).
 *
 * See FocusManager.takeEphemeralFocus for more details.
 */
export type ReturnEphemeralFocus = () => void;

/**
 * A per-page singleton that manages Blockly focus across one or more
 * IFocusableTrees, and bidirectionally synchronizes this focus with the DOM.
 *
 * Callers that wish to explicitly change input focus for select Blockly
 * components on the page should use the focus functions in this manager.
 *
 * The manager is responsible for handling focus events from the DOM (which may
 * may arise from users clicking on page elements) and ensuring that
 * corresponding IFocusableNodes are clearly marked as actively/passively
 * highlighted in the same way that this would be represented with calls to
 * focusNode().
 */
export class FocusManager {
  /**
   * The CSS class assigned to IFocusableNode elements that presently have
   * active DOM and Blockly focus.
   *
   * This should never be used directly. Instead, rely on FocusManager to ensure
   * nodes have active focus (either automatically through DOM focus or manually
   * through the various focus* methods provided by this class).
   *
   * It's recommended to not query using this class name, either. Instead, use
   * FocusableTreeTraverser or IFocusableTree's methods to find a specific node.
   */
  static readonly ACTIVE_FOCUS_NODE_CSS_CLASS_NAME = 'blocklyActiveFocus';

  /**
   * The CSS class assigned to IFocusableNode elements that presently have
   * passive focus (that is, they were the most recent node in their relative
   * tree to have active focus--see ACTIVE_FOCUS_NODE_CSS_CLASS_NAME--and will
   * receive active focus again if their surrounding tree is requested to become
   * focused, i.e. using focusTree below).
   *
   * See ACTIVE_FOCUS_NODE_CSS_CLASS_NAME for caveats and limitations around
   * using this constant directly (generally it never should need to be used).
   */
  static readonly PASSIVE_FOCUS_NODE_CSS_CLASS_NAME = 'blocklyPassiveFocus';

  focusedNode: IFocusableNode | null = null;
  registeredTrees: Array<IFocusableTree> = [];

  private currentlyHoldsEphemeralFocus: boolean = false;
  private lockFocusStateChanges: boolean = false;

  constructor(
    addGlobalEventListener: (type: string, listener: EventListener) => void,
  ) {
    // Register root document focus listeners for tracking when focus leaves all
    // tracked focusable trees.
    addGlobalEventListener('focusin', (event) => {
      if (!(event instanceof FocusEvent)) return;

      // The target that now has focus.
      const activeElement = document.activeElement;
      let newNode: IFocusableNode | null | undefined = null;
      if (
        activeElement instanceof HTMLElement ||
        activeElement instanceof SVGElement
      ) {
        // If the target losing focus maps to any tree, then it should be
        // updated. Per the contract of findFocusableNodeFor only one tree
        // should claim the element.
        for (const tree of this.registeredTrees) {
          newNode = FocusableTreeTraverser.findFocusableNodeFor(
            activeElement,
            tree,
          );
          if (newNode) break;
        }
      }

      if (newNode) {
        const newTree = newNode.getFocusableTree();
        const oldTree = this.focusedNode?.getFocusableTree();
        if (newNode === newTree.getRootFocusableNode() && newTree !== oldTree) {
          // If the root of the tree is the one taking focus (such as due to
          // being tabbed), try to focus the whole tree explicitly to ensure the
          // correct node re-receives focus.
          this.focusTree(newTree);
        } else {
          this.focusNode(newNode);
        }
      } else {
        this.defocusCurrentFocusedNode();
      }
    });
  }

  /**
   * Registers a new IFocusableTree for automatic focus management.
   *
   * If the tree currently has an element with DOM focus, it will not affect the
   * internal state in this manager until the focus changes to a new,
   * now-monitored element/node.
   *
   * This function throws if the provided tree is already currently registered
   * in this manager. Use isRegistered to check in cases when it can't be
   * certain whether the tree has been registered.
   */
  registerTree(tree: IFocusableTree): void {
    this.ensureManagerIsUnlocked();
    if (this.isRegistered(tree)) {
      throw Error(`Attempted to re-register already registered tree: ${tree}.`);
    }
    this.registeredTrees.push(tree);
  }

  /**
   * Returns whether the specified tree has already been registered in this
   * manager using registerTree and hasn't yet been unregistered using
   * unregisterTree.
   */
  isRegistered(tree: IFocusableTree): boolean {
    return this.registeredTrees.findIndex((reg) => reg === tree) !== -1;
  }

  /**
   * Unregisters a IFocusableTree from automatic focus management.
   *
   * If the tree had a previous focused node, it will have its highlight
   * removed. This function does NOT change DOM focus.
   *
   * This function throws if the provided tree is not currently registered in
   * this manager.
   */
  unregisterTree(tree: IFocusableTree): void {
    this.ensureManagerIsUnlocked();
    if (!this.isRegistered(tree)) {
      throw Error(`Attempted to unregister not registered tree: ${tree}.`);
    }
    const treeIndex = this.registeredTrees.findIndex((tree) => tree === tree);
    this.registeredTrees.splice(treeIndex, 1);

    const focusedNode = FocusableTreeTraverser.findFocusedNode(tree);
    const root = tree.getRootFocusableNode();
    if (focusedNode) this.removeHighlight(focusedNode);
    if (this.focusedNode === focusedNode || this.focusedNode === root) {
      this.focusedNode = null;
    }
    this.removeHighlight(root);
  }

  /**
   * Returns the current IFocusableTree that has focus, or null if none
   * currently do.
   *
   * Note also that if ephemeral focus is currently captured (e.g. using
   * takeEphemeralFocus) then the returned tree here may not currently have DOM
   * focus.
   */
  getFocusedTree(): IFocusableTree | null {
    return this.focusedNode?.getFocusableTree() ?? null;
  }

  /**
   * Returns the current IFocusableNode with focus (which is always tied to a
   * focused IFocusableTree), or null if there isn't one.
   *
   * Note that this function will maintain parity with
   * IFocusableTree.getFocusedNode(). That is, if a tree itself has focus but
   * none of its non-root children do, this will return null but
   * getFocusedTree() will not.
   *
   * Note also that if ephemeral focus is currently captured (e.g. using
   * takeEphemeralFocus) then the returned node here may not currently have DOM
   * focus.
   */
  getFocusedNode(): IFocusableNode | null {
    return this.focusedNode;
  }

  /**
   * Focuses the specific IFocusableTree. This either means restoring active
   * focus to the tree's passively focused node, or focusing the tree's root
   * node.
   *
   * Note that if the specified tree already has a focused node then this will
   * not change any existing focus (unless that node has passive focus, then it
   * will be restored to active focus).
   *
   * See getFocusedNode for details on how other nodes are affected.
   *
   * @param focusableTree The tree that should receive active
   *     focus.
   */
  focusTree(focusableTree: IFocusableTree): void {
    this.ensureManagerIsUnlocked();
    if (!this.isRegistered(focusableTree)) {
      throw Error(`Attempted to focus unregistered tree: ${focusableTree}.`);
    }
    const currNode = FocusableTreeTraverser.findFocusedNode(focusableTree);
    const nodeToRestore = focusableTree.getRestoredFocusableNode(currNode);
    const rootFallback = focusableTree.getRootFocusableNode();
    this.focusNode(nodeToRestore ?? currNode ?? rootFallback);
  }

  /**
   * Focuses DOM input on the selected node, and marks it as actively focused.
   *
   * Any previously focused node will be updated to be passively highlighted (if
   * it's in a different focusable tree) or blurred (if it's in the same one).
   *
   * @param focusableNode The node that should receive active focus.
   */
  focusNode(focusableNode: IFocusableNode): void {
    this.ensureManagerIsUnlocked();
    if (this.focusedNode == focusableNode) return; // State is unchanged.

    const nextTree = focusableNode.getFocusableTree();
    if (!this.isRegistered(nextTree)) {
      throw Error(`Attempted to focus unregistered node: ${focusableNode}.`);
    }

    // Safety check for ensuring focusNode() doesn't get called for a node that
    // isn't actually hooked up to its parent tree correctly (since this can
    // cause weird inconsistencies).
    const matchedNode = FocusableTreeTraverser.findFocusableNodeFor(
      focusableNode.getFocusableElement(),
      nextTree,
    );
    if (matchedNode !== focusableNode) {
      throw Error(
        `Attempting to focus node which isn't recognized by its parent tree: ` +
          `${focusableNode}.`);
    }

    const prevNode = this.focusedNode;
    const prevTree = prevNode?.getFocusableTree();
    if (prevNode && prevTree !== nextTree) {
      this.passivelyFocusNode(prevNode, nextTree);
    }

    // If there's a focused node in the new node's tree, ensure it's reset.
    const prevNodeNextTree = FocusableTreeTraverser.findFocusedNode(nextTree);
    const nextTreeRoot = nextTree.getRootFocusableNode();
    if (prevNodeNextTree) {
      this.removeHighlight(prevNodeNextTree);
    }
    // For caution, ensure that the root is always reset since getFocusedNode()
    // is expected to return null if the root was highlighted, if the root is
    // not the node now being set to active.
    if (nextTreeRoot !== focusableNode) {
      this.removeHighlight(nextTreeRoot);
    }

    if (!this.currentlyHoldsEphemeralFocus) {
      // Only change the actively focused node if ephemeral state isn't held.
      this.activelyFocusNode(focusableNode, prevTree ?? null);
    }
    this.focusedNode = focusableNode;
  }

  /**
   * Ephemerally captures focus for a selected element until the returned lambda
   * is called. This is expected to be especially useful for ephemeral UI flows
   * like dialogs.
   *
   * IMPORTANT: the returned lambda *must* be called, otherwise automatic focus
   * will no longer work anywhere on the page. It is highly recommended to tie
   * the lambda call to the closure of the corresponding UI so that if input is
   * manually changed to an element outside of the ephemeral UI, the UI should
   * close and automatic input restored. Note that this lambda must be called
   * exactly once and that subsequent calls will throw an error.
   *
   * Note that the manager will continue to track DOM input signals even when
   * ephemeral focus is active, but it won't actually change node state until
   * the returned lambda is called. Additionally, only 1 ephemeral focus context
   * can be active at any given time (attempting to activate more than one
   * simultaneously will result in an error being thrown).
   */
  takeEphemeralFocus(
    focusableElement: HTMLElement | SVGElement,
  ): ReturnEphemeralFocus {
    this.ensureManagerIsUnlocked();
    if (this.currentlyHoldsEphemeralFocus) {
      throw Error(
        `Attempted to take ephemeral focus when it's already held, ` +
          `with new element: ${focusableElement}.`,
      );
    }
    this.currentlyHoldsEphemeralFocus = true;

    if (this.focusedNode) {
      this.passivelyFocusNode(this.focusedNode, null);
    }
    focusableElement.focus();

    let hasFinishedEphemeralFocus = false;
    return () => {
      if (hasFinishedEphemeralFocus) {
        throw Error(
          `Attempted to finish ephemeral focus twice for element: ` +
            `${focusableElement}.`,
        );
      }
      hasFinishedEphemeralFocus = true;
      this.currentlyHoldsEphemeralFocus = false;

      if (this.focusedNode) {
        this.activelyFocusNode(this.focusedNode, null);
      }
    };
  }

  private ensureManagerIsUnlocked(): void {
    if (this.lockFocusStateChanges) {
      throw Error(
        'FocusManager state changes cannot happen in a tree/node focus/blur '
          + 'callback.'
      );
    }
  }

  private defocusCurrentFocusedNode(): void {
    // The current node will likely be defocused while ephemeral focus is held,
    // but internal manager state shouldn't change since the node should be
    // restored upon exiting ephemeral focus mode.
    if (this.focusedNode && !this.currentlyHoldsEphemeralFocus) {
      this.passivelyFocusNode(this.focusedNode, null);
      this.focusedNode = null;
    }
  }

  private activelyFocusNode(
    node: IFocusableNode, prevTree: IFocusableTree | null
  ): void {
    // Note that order matters here. Focus callbacks are allowed to change
    // element visibility which can influence focusability, including for a
    // node's focusable element (which *is* allowed to be invisible until the
    // node needs to be focused).
    this.lockFocusStateChanges = true;
    node.getFocusableTree().onTreeFocus(node, prevTree);
    node.onNodeFocus();
    this.lockFocusStateChanges = false;

    this.setNodeToVisualActiveFocus(node);
    node.getFocusableElement().focus();
  }

  private passivelyFocusNode(
    node: IFocusableNode, nextTree: IFocusableTree | null
  ): void {
    this.lockFocusStateChanges = true;
    node.getFocusableTree().onTreeBlur(nextTree);
    node.onNodeBlur();
    this.lockFocusStateChanges = false;

    this.setNodeToVisualPassiveFocus(node);
  }

  private setNodeToVisualActiveFocus(node: IFocusableNode): void {
    const element = node.getFocusableElement();
    dom.addClass(element, FocusManager.ACTIVE_FOCUS_NODE_CSS_CLASS_NAME);
    dom.removeClass(element, FocusManager.PASSIVE_FOCUS_NODE_CSS_CLASS_NAME);
  }

  private setNodeToVisualPassiveFocus(node: IFocusableNode): void {
    const element = node.getFocusableElement();
    dom.removeClass(element, FocusManager.ACTIVE_FOCUS_NODE_CSS_CLASS_NAME);
    dom.addClass(element, FocusManager.PASSIVE_FOCUS_NODE_CSS_CLASS_NAME);
  }

  private removeHighlight(node: IFocusableNode): void {
    const element = node.getFocusableElement();
    dom.removeClass(element, FocusManager.ACTIVE_FOCUS_NODE_CSS_CLASS_NAME);
    dom.removeClass(element, FocusManager.PASSIVE_FOCUS_NODE_CSS_CLASS_NAME);
  }
}

let focusManager: FocusManager | null = null;

/**
 * Returns the page-global FocusManager.
 *
 * The returned instance is guaranteed to not change across function calls, but
 * may change across page loads.
 */
export function getFocusManager(): FocusManager {
  if (!focusManager) {
    focusManager = new FocusManager(document.addEventListener);
  }
  return focusManager;
}
