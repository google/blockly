/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {BlockSvg} from '../block_svg.js';
import type {Field} from '../field.js';
import type {INavigable} from '../interfaces/i_navigable.js';
import type {INavigationPolicy} from '../interfaces/i_navigation_policy.js';
import type {RenderedConnection} from '../rendered_connection.js';

/**
 * Set of rules controlling keyboard navigation from a field.
 */
export class FieldNavigationPolicy implements INavigationPolicy<Field<any>> {
  /**
   * Returns null since fields do not have children.
   *
   * @param _current The field to navigate from.
   * @returns Null.
   */
  getFirstChild(_current: Field<any>): INavigable<unknown> | null {
    return null;
  }

  /**
   * Returns the parent block of the given field.
   *
   * @param current The field to navigate from.
   * @returns The given field's parent block.
   */
  getParent(current: Field<any>): INavigable<unknown> | null {
    return current.getSourceBlock() as BlockSvg;
  }

  /**
   * Returns the next field or input following the given field.
   *
   * @param current The field to navigate from.
   * @returns The next field or input in the given field's block.
   */
  getNextSibling(current: Field<any>): INavigable<unknown> | null {
    const input = current.getParentInput();
    const block = current.getSourceBlock();
    if (!block) return null;

    const curIdx = block.inputList.indexOf(input);
    let fieldIdx = input.fieldRow.indexOf(current) + 1;
    for (let i = curIdx; i < block.inputList.length; i++) {
      const newInput = block.inputList[i];
      const fieldRow = newInput.fieldRow;
      if (fieldIdx < fieldRow.length) return fieldRow[fieldIdx];
      fieldIdx = 0;
      if (newInput.connection) {
        return newInput.connection as RenderedConnection;
      }
    }
    return null;
  }

  /**
   * Returns the field or input preceding the given field.
   *
   * @param current The field to navigate from.
   * @returns The preceding field or input in the given field's block.
   */
  getPreviousSibling(current: Field<any>): INavigable<unknown> | null {
    const parentInput = current.getParentInput();
    const block = current.getSourceBlock();
    if (!block) return null;

    const curIdx = block.inputList.indexOf(parentInput);
    let fieldIdx = parentInput.fieldRow.indexOf(current) - 1;
    for (let i = curIdx; i >= 0; i--) {
      const input = block.inputList[i];
      if (input.connection && input !== parentInput) {
        return input.connection as RenderedConnection;
      }
      const fieldRow = input.fieldRow;
      if (fieldIdx > -1) return fieldRow[fieldIdx];

      // Reset the fieldIdx to the length of the field row of the previous
      // input.
      if (i - 1 >= 0) {
        fieldIdx = block.inputList[i - 1].fieldRow.length - 1;
      }
    }
    return null;
  }

  /**
   * Returns whether or not the given field can be navigated to.
   *
   * @param current The instance to check for navigability.
   * @returns True if the given field can be focused and navigated to.
   */
  isNavigable(current: Field<any>): boolean {
    return (
      current.canBeFocused() &&
      current.isClickable() &&
      current.isCurrentlyEditable() &&
      !(
        current.getSourceBlock()?.isSimpleReporter() &&
        current.isFullBlockField()
      ) &&
      current.getParentInput().isVisible()
    );
  }
}
