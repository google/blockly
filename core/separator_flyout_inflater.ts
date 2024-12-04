/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {FlyoutSeparator, SeparatorAxis} from './flyout_separator.js';
import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import type {IFlyoutInflater} from './interfaces/i_flyout_inflater.js';
import * as registry from './registry.js';
import type {SeparatorInfo} from './utils/toolbox.js';
import type {WorkspaceSvg} from './workspace_svg.js';

/**
 * Class responsible for creating separators for flyouts.
 */
export class SeparatorFlyoutInflater implements IFlyoutInflater {
  /**
   * Inflates a dummy flyout separator.
   *
   * The flyout automatically creates separators between every element with a
   * size determined by calling gapForElement on the relevant inflater.
   * Additionally, users can explicitly add separators in the flyout definition.
   * When separators (implicitly or explicitly created) follow one another, the
   * gap of the last one propagates backwards and flattens to one separator.
   * This flattening is not additive; if there are initially separators of 2, 3,
   * and 4 pixels, after normalization there will be one separator of 4 pixels.
   * Therefore, this method returns a zero-width separator, which will be
   * replaced by the one implicitly created by the flyout based on the value
   * returned by gapForElement, which knows the default gap, unlike this method.
   *
   * @param _state A JSON representation of a flyout separator.
   * @param flyoutWorkspace The workspace the separator belongs to.
   * @returns A newly created FlyoutSeparator.
   */
  load(_state: object, flyoutWorkspace: WorkspaceSvg): IBoundedElement {
    const flyoutAxis = flyoutWorkspace.targetWorkspace?.getFlyout()
      ?.horizontalLayout
      ? SeparatorAxis.X
      : SeparatorAxis.Y;
    return new FlyoutSeparator(0, flyoutAxis);
  }

  /**
   * Returns the size of the separator. See `load` for more details.
   *
   * @param state A JSON representation of a flyout separator.
   * @param defaultGap The default spacing for flyout items.
   * @returns The desired size of the separator.
   */
  gapForElement(state: object, defaultGap: number): number {
    const separatorState = state as SeparatorInfo;
    const newGap = parseInt(String(separatorState['gap']));
    return newGap ?? defaultGap;
  }

  /**
   * Disposes of the given separator. Intentional no-op.
   *
   * @param _element The flyout separator to dispose of.
   */
  disposeElement(_element: IBoundedElement): void {}
}

registry.register(
  registry.Type.FLYOUT_INFLATER,
  'sep',
  SeparatorFlyoutInflater,
);
