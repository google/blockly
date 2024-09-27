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

export class LabelFlyoutInflater implements IFlyoutInflater {
  load(state: Object, flyoutWorkspace: WorkspaceSvg): IBoundedElement {
    const label = new FlyoutButton(
      flyoutWorkspace,
      flyoutWorkspace.targetWorkspace!,
      state as ButtonOrLabelInfo,
      true,
    );
    label.show();
    return label;
  }

  gapForElement(state: Object, defaultGap: number): number {
    return defaultGap;
  }

  disposeElement(element: IBoundedElement): void {
    if (element instanceof FlyoutButton) {
      element.dispose();
    }
  }
}

registry.register(registry.Type.FLYOUT_INFLATER, 'label', LabelFlyoutInflater);
