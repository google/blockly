/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {IFlyoutInflater} from './interfaces/i_flyout_inflater.js';
import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import {FlyoutButton} from './flyout_button.js';
import {ButtonOrLabelInfo} from './utils/toolbox.js';
import * as registry from './registry.js';

/**
 * Class responsible for creating buttons for flyouts.
 */
export class ButtonFlyoutInflater implements IFlyoutInflater {
  /**
   * Inflates a flyout button from the given state and adds it to the flyout.
   *
   * @param state A JSON representation of a flyout button.
   * @param flyoutWorkspace The workspace to create the button on.
   * @returns A newly created FlyoutButton.
   */
  load(state: Object, flyoutWorkspace: WorkspaceSvg): IBoundedElement {
    const button = new FlyoutButton(
      flyoutWorkspace,
      flyoutWorkspace.targetWorkspace!,
      state as ButtonOrLabelInfo,
      false,
    );
    button.show();
    return button;
  }

  /**
   * Returns the amount of space that should follow this button.
   *
   * @param state A JSON representation of a flyout button.
   * @param defaultGap The default spacing for flyout items.
   * @returns The amount of space that should follow this button.
   */
  gapForElement(state: Object, defaultGap: number): number {
    return defaultGap;
  }

  /**
   * Disposes of the given button.
   *
   * @param element The flyout button to dispose of.
   */
  disposeElement(element: IBoundedElement): void {
    if (element instanceof FlyoutButton) {
      element.dispose();
    }
  }
}

registry.register(
  registry.Type.FLYOUT_INFLATER,
  'button',
  ButtonFlyoutInflater,
);
