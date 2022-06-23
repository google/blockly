/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a single row on a rendered block.
 */


/**
 * Object representing a single row on a rendered block.
 * @class
 */
goog.declareModuleId('Blockly.blockRendering.Row');

/* eslint-disable-next-line no-unused-vars */
import {ConstantProvider} from '../common/constants.js';

/* eslint-disable-next-line no-unused-vars */
import {Measurable} from './base.js';
/* eslint-disable-next-line no-unused-vars */
import {InRowSpacer} from './in_row_spacer.js';
/* eslint-disable-next-line no-unused-vars */
import {InputConnection} from './input_connection.js';
import {Types} from './types.js';


/**
 * An object representing a single row on a rendered block and all of its
 * subcomponents.
 * @alias Blockly.blockRendering.Row
 */
export class Row {
  type: number;

  /** An array of elements contained in this row. */
  elements: Measurable[] = [];

  /** The height of the row. */
  height = 0;

  /**
   * The width of the row, from the left edge of the block to the right.
   * Does not include child blocks unless they are inline.
   */
  width = 0;

  /** The minimum height of the row. */
  minHeight = 0;

  /**
   * The minimum width of the row, from the left edge of the block to the
   * right. Does not include child blocks unless they are inline.
   */
  minWidth = 0;

  /**
   * The width of the row, from the left edge of the block to the edge of the
   * block or any connected child blocks.
   */
  widthWithConnectedBlocks = 0;

  /**
   * The Y position of the row relative to the origin of the block's svg
   * group.
   */
  yPos = 0;

  /**
   * The X position of the row relative to the origin of the block's svg
   * group.
   */
  xPos = 0;

  /** Whether the row has any external inputs. */
  hasExternalInput = false;

  /** Whether the row has any statement inputs. */
  hasStatement = false;

  /**
   * Where the left edge of all of the statement inputs on the block should
   * be. This makes sure that statement inputs which are proceded by fields
   * of varius widths are all aligned.
   */
  statementEdge = 0;

  /** Whether the row has any inline inputs. */
  hasInlineInput = false;

  /** Whether the row has any dummy inputs. */
  hasDummyInput = false;

  /** Whether the row has a jagged edge. */
  hasJaggedEdge = false;
  notchOffset: number;

  /** Alignment of the row. */
  align: number|null = null;

  /** @param constants_ The rendering constants provider. */
  constructor(protected readonly constants_: ConstantProvider) {
    /** The type of this rendering object. */
    this.type = Types.ROW;

    this.notchOffset = this.constants.NOTCH_OFFSET_LEFT;
  }

  /**
   * Get the last input on this row, if it has one.
   * @return The last input on the row, or null.
   */
  getLastInput(): InputConnection {
    // TODO: Consider moving this to InputRow, if possible.
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const elem = this.elements[i];
      if (Types.isInput(elem)) {
        return elem as InputConnection;
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'InputConnection'.
    return null as AnyDuringMigration;
  }

  /**
   * Inspect all subcomponents and populate all size properties on the row.
   */
  measure() {
    throw Error('Unexpected attempt to measure a base Row.');
  }

  /**
   * Determines whether this row should start with an element spacer.
   * @return Whether the row should start with a spacer.
   */
  startsWithElemSpacer(): boolean {
    return true;
  }

  /**
   * Determines whether this row should end with an element spacer.
   * @return Whether the row should end with a spacer.
   */
  endsWithElemSpacer(): boolean {
    return true;
  }

  /**
   * Convenience method to get the first spacer element on this row.
   * @return The first spacer element on this row.
   */
  getFirstSpacer(): InRowSpacer {
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      if (Types.isSpacer(elem)) {
        return elem as InRowSpacer;
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'InRowSpacer'.
    return null as AnyDuringMigration;
  }

  /**
   * Convenience method to get the last spacer element on this row.
   * @return The last spacer element on this row.
   */
  getLastSpacer(): InRowSpacer {
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const elem = this.elements[i];
      if (Types.isSpacer(elem)) {
        return elem as InRowSpacer;
      }
    }
    // AnyDuringMigration because:  Type 'null' is not assignable to type
    // 'InRowSpacer'.
    return null as AnyDuringMigration;
  }
}
