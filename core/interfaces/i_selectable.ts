/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for an object that is selectable.
 */


/**
 * The interface for an object that is selectable.
 * @namespace Blockly.ISelectable
 */
import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.ISelectable');

// eslint-disable-next-line no-unused-vars
import {IDeletable} from './i_deletable.js';
// eslint-disable-next-line no-unused-vars
import {IMovable} from './i_movable.js';


/**
 * The interface for an object that is selectable.
 * @alias Blockly.ISelectable
 */
export interface ISelectable extends IDeletable, IMovable {
  id: string;

  /** Select this.  Highlight it visually. */
  select: AnyDuringMigration;

  /** Unselect this.  Unhighlight it visually. */
  unselect: AnyDuringMigration;
}
