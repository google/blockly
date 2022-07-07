/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a flyout.
 */

/**
 * The interface for a flyout.
 * @namespace Blockly.IFlyout
 */


/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/toolbox';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../block_svg';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/coordinate';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/svg';

import type {WorkspaceSvg} from '../workspace_svg';

import type {IRegistrable} from './i_registrable';


/**
 * Interface for a flyout.
 * @alias Blockly.IFlyout
 */
export interface IFlyout extends IRegistrable {
  /** Whether the flyout is laid out horizontally or not. */
  horizontalLayout: boolean;

  /** Is RTL vs LTR. */
  RTL: boolean;

  /** The target workspace */
  targetWorkspace: WorkspaceSvg|null;

  /** Margin around the edges of the blocks in the flyout. */
  readonly MARGIN: number;

  /** Does the flyout automatically close when a block is created? */
  autoClose: boolean;

  /** Corner radius of the flyout background. */
  readonly CORNER_RADIUS: number;

  /**
   * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
   * either exist as its own svg element or be a g element nested inside a
   * separate svg element.
   * @param tagName The type of tag to put the flyout in. This should be <svg>
   *     or <g>.
   * @return The flyout's SVG group.
   */
  createDom: AnyDuringMigration;

  /**
   * Initializes the flyout.
   * @param targetWorkspace The workspace in which to create new blocks.
   */
  init: AnyDuringMigration;

  /**
   * Dispose of this flyout.
   * Unlink from all DOM elements to prevent memory leaks.
   */
  dispose: () => void;

  /**
   * Get the width of the flyout.
   * @return The width of the flyout.
   */
  getWidth: AnyDuringMigration;

  /**
   * Get the height of the flyout.
   * @return The width of the flyout.
   */
  getHeight: AnyDuringMigration;

  /**
   * Get the workspace inside the flyout.
   * @return The workspace inside the flyout.
   */
  getWorkspace: AnyDuringMigration;

  /**
   * Is the flyout visible?
   * @return True if visible.
   */
  isVisible: AnyDuringMigration;

  /**
   * Set whether the flyout is visible. A value of true does not necessarily
   * mean that the flyout is shown. It could be hidden because its container is
   * hidden.
   * @param visible True if visible.
   */
  setVisible: AnyDuringMigration;

  /**
   * Set whether this flyout's container is visible.
   * @param visible Whether the container is visible.
   */
  setContainerVisible: AnyDuringMigration;

  /** Hide and empty the flyout. */
  hide: () => void;

  /**
   * Show and populate the flyout.
   * @param flyoutDef Contents to display in the flyout. This is either an array
   *     of Nodes, a NodeList, a toolbox definition, or a string with the name
   *     of the dynamic category.
   */
  show: AnyDuringMigration;

  /**
   * Create a copy of this block on the workspace.
   * @param originalBlock The block to copy from the flyout.
   * @return The newly created block.
   * @throws {Error} if something went wrong with deserialization.
   */
  createBlock: AnyDuringMigration;

  /** Reflow blocks and their mats. */
  reflow: () => void;

  /**
   * @return True if this flyout may be scrolled with a scrollbar or by
   *     dragging.
   */
  isScrollable: AnyDuringMigration;

  /**
   * Calculates the x coordinate for the flyout position.
   * @return X coordinate.
   */
  getX: AnyDuringMigration;

  /**
   * Calculates the y coordinate for the flyout position.
   * @return Y coordinate.
   */
  getY: AnyDuringMigration;

  /** Position the flyout. */
  position: AnyDuringMigration;

  /**
   * Determine if a drag delta is toward the workspace, based on the position
   * and orientation of the flyout. This is used in determineDragIntention_ to
   * determine if a new block should be created or if the flyout should scroll.
   * @param currentDragDeltaXY How far the pointer has moved from the position
   *     at mouse down, in pixel units.
   * @return True if the drag is toward the workspace.
   */
  isDragTowardWorkspace: AnyDuringMigration;

  /**
   * Does this flyout allow you to create a new instance of the given block?
   * Used for deciding if a block can be "dragged out of" the flyout.
   * @param block The block to copy from the flyout.
   * @return True if you can create a new instance of the block, false
   *     otherwise.
   */
  isBlockCreatable: AnyDuringMigration;

  /** Scroll the flyout to the beginning of its contents. */
  scrollToStart: () => void;
}
