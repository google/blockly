/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import {Rect} from './utils/rect.js';

/**
 * Representation of a gap between elements in a flyout.
 */
export class FlyoutSeparator implements IBoundedElement {
  private x = 0;
  private y = 0;

  /**
   * Creates a new separator.
   *
   * @param gap The amount of space this separator should occupy.
   * @param axis The axis along which this separator occupies space.
   */
  constructor(
    private gap: number,
    private axis: SeparatorAxis,
  ) {}

  /**
   * Returns the bounding box of this separator.
   *
   * @returns The bounding box of this separator.
   */
  getBoundingRectangle(): Rect {
    switch (this.axis) {
      case SeparatorAxis.X:
        return new Rect(this.y, this.y, this.x, this.x + this.gap);
      case SeparatorAxis.Y:
        return new Rect(this.y, this.y + this.gap, this.x, this.x);
    }
  }

  /**
   * Repositions this separator.
   *
   * @param dx The distance to move this separator on the X axis.
   * @param dy The distance to move this separator on the Y axis.
   * @param _reason The reason this move was initiated.
   */
  moveBy(dx: number, dy: number, _reason?: string[]) {
    this.x += dx;
    this.y += dy;
  }
}

/**
 * Representation of an axis along which a separator occupies space.
 */
export const enum SeparatorAxis {
  X = 'x',
  Y = 'y',
}
