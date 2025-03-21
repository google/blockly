/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFocusableNode} from './interfaces/i_focusable_node.js';
import type {IFocusableTree} from './interfaces/i_focusable_tree.js';
import * as dom from './utils/dom.js';

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
  focusedNode: IFocusableNode | null = null;
  registeredTrees: Array<IFocusableTree> = [];

  private currentlyHoldsEphemeralFocus: boolean = false;

  constructor(
    addGlobalEventListener: (type: string, listener: EventListener) => void,
  ) {
    // Register root document focus listeners for tracking when focus leaves all
    // tracked focusable trees.
    addGlobalEventListener('focusin', (event) => {
      if (!(event instanceof FocusEvent)) return;

      // The target that now has focus.
      const activeElement = document.activeElement;
      let newNode: IFocusableNode | null = null;
      if (
        activeElement instanceof HTMLElement ||
        activeElement instanceof SVGElement
      ) {
        // If the target losing focus maps to any tree, then it should be
        // updated. Per the contract of findFocusableNodeFor only one tree
        // should claim the element.
        const matchingNodes = this.registeredTrees.map((tree) =>
          tree.findFocusableNodeFor(activeElement),
        );
        newNode = matchingNodes.find((node) => !!node) ?? null;
      }

      if (newNode) {
        this.focusNode(newNode);
      } else {
        // TODO: Set previous to passive if all trees are losing active focus.
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
    return this.registeredTrees.findIndex((reg) => reg == tree) !== -1;
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
    if (!this.isRegistered(tree)) {
      throw Error(`Attempted to unregister not registered tree: ${tree}.`);
    }
    const treeIndex = this.registeredTrees.findIndex((tree) => tree == tree);
    this.registeredTrees.splice(treeIndex, 1);

    const focusedNode = tree.getFocusedNode();
    const root = tree.getRootFocusableNode();
    if (focusedNode != null) this.removeHighlight(focusedNode);
    if (this.focusedNode == focusedNode || this.focusedNode == root) {
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
    if (!this.isRegistered(focusableTree)) {
      throw Error(`Attempted to focus unregistered tree: ${focusableTree}.`);
    }
    this.focusNode(
      focusableTree.getFocusedNode() ?? focusableTree.getRootFocusableNode(),
    );
  }

  /**
   * Focuses DOM input on the selected node, and marks it as actively focused.
   *
   * Any previously focused node will be updated to be passively highlighted (if
   * it's in a different focusable tree) or blurred (if it's in the same one).
   *
   * @param focusableNode The node that should receive active
   *     focus.
   */
  focusNode(focusableNode: IFocusableNode): void {
    const curTree = focusableNode.getFocusableTree();
    if (!this.isRegistered(curTree)) {
      throw Error(`Attempted to focus unregistered node: ${focusableNode}.`);
    }
    const prevNode = this.focusedNode;
    if (prevNode && prevNode.getFocusableTree() !== curTree) {
      this.setNodeToPassive(prevNode);
    }
    // If there's a focused node in the new node's tree, ensure it's reset.
    const prevNodeCurTree = curTree.getFocusedNode();
    const curTreeRoot = curTree.getRootFocusableNode();
    if (prevNodeCurTree) {
      this.removeHighlight(prevNodeCurTree);
    }
    // For caution, ensure that the root is always reset since getFocusedNode()
    // is expected to return null if the root was highlighted, if the root is
    // not the node now being set to active.
    if (curTreeRoot !== focusableNode) {
      this.removeHighlight(curTreeRoot);
    }
    if (!this.currentlyHoldsEphemeralFocus) {
      // Only change the actively focused node if ephemeral state isn't held.
      this.setNodeToActive(focusableNode);
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
    if (this.currentlyHoldsEphemeralFocus) {
      throw Error(
        `Attempted to take ephemeral focus when it's already held, ` +
          `with new element: ${focusableElement}.`,
      );
    }
    this.currentlyHoldsEphemeralFocus = true;

    if (this.focusedNode) {
      this.setNodeToPassive(this.focusedNode);
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
        this.setNodeToActive(this.focusedNode);
      }
    };
  }

  private setNodeToActive(node: IFocusableNode): void {
    const element = node.getFocusableElement();
    dom.addClass(element, 'blocklyActiveFocus');
    dom.removeClass(element, 'blocklyPassiveFocus');
    element.focus();
  }

  private setNodeToPassive(node: IFocusableNode): void {
    const element = node.getFocusableElement();
    dom.removeClass(element, 'blocklyActiveFocus');
    dom.addClass(element, 'blocklyPassiveFocus');
  }

  private removeHighlight(node: IFocusableNode): void {
    const element = node.getFocusableElement();
    dom.removeClass(element, 'blocklyActiveFocus');
    dom.removeClass(element, 'blocklyPassiveFocus');
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
