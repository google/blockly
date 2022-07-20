/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a toolbox.
 */

/**
 * The interface for a toolbox.
 * @namespace Blockly.IToolbox
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.IToolbox');

/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../utils/toolbox.js';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './i_flyout.js';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import './i_toolbox_item.js';
/* eslint-disable-next-line no-unused-vars */
// Unused import preserved for side-effects. Remove if unneeded.
import '../workspace_svg.js';

import type {IRegistrable} from './i_registrable.js';


/**
 * Interface for a toolbox.
 * @alias Blockly.IToolbox
 */
export interface IToolbox extends IRegistrable {
  /** Initializes the toolbox. */
  init: AnyDuringMigration;

  /**
   * Fills the toolbox with new toolbox items and removes any old contents.
   * @param toolboxDef Object holding information for creating a toolbox.
   */
  render: AnyDuringMigration;

  /**
   * Gets the width of the toolbox.
   * @return The width of the toolbox.
   */
  getWidth: AnyDuringMigration;

  /**
   * Gets the height of the toolbox.
   * @return The width of the toolbox.
   */
  getHeight: AnyDuringMigration;

  /**
   * Gets the toolbox flyout.
   * @return The toolbox flyout.
   */
  getFlyout: AnyDuringMigration;

  /**
   * Gets the workspace for the toolbox.
   * @return The parent workspace for the toolbox.
   */
  getWorkspace: AnyDuringMigration;

  /**
   * Gets whether or not the toolbox is horizontal.
   * @return True if the toolbox is horizontal, false if the toolbox is
   *     vertical.
   */
  isHorizontal: AnyDuringMigration;

  /**
   * Positions the toolbox based on whether it is a horizontal toolbox and
   * whether the workspace is in rtl.
   */
  position: AnyDuringMigration;

  /** Handles resizing the toolbox when a toolbox item resizes. */
  handleToolboxItemResize: AnyDuringMigration;

  /** Unhighlights any previously selected item. */
  clearSelection: AnyDuringMigration;

  /**
   * Updates the category colours and background colour of selected categories.
   */
  refreshTheme: AnyDuringMigration;

  /**
   * Updates the flyout's content without closing it.  Should be used in
   * response to a change in one of the dynamic categories, such as variables or
   * procedures.
   */
  refreshSelection: AnyDuringMigration;

  /**
   * Sets the visibility of the toolbox.
   * @param isVisible True if toolbox should be visible.
   */
  setVisible: AnyDuringMigration;

  /**
   * Selects the toolbox item by it's position in the list of toolbox items.
   * @param position The position of the item to select.
   */
  selectItemByPosition: AnyDuringMigration;

  /**
   * Gets the selected item.
   * @return The selected item, or null if no item is currently selected.
   */
  getSelectedItem: AnyDuringMigration;

  /** Disposes of this toolbox. */
  dispose: AnyDuringMigration;
}
