/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IIcon} from '../interfaces/i_icon.js';

/**
 * Thrown when you try to append the same type of icon to a block
 * multiple times.
 */
export class DuplicateIconType extends Error {
  /**
   * @internal
   */
  constructor(public icon: IIcon) {
    super(
      `Tried to append an icon of type ${icon.getType()} when an icon of ` +
        `that type already exists on the block. ` +
        `Use getIcon to access the existing icon.`
    );
  }
}
