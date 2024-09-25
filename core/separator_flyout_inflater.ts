import type {IFlyoutInflater} from './interfaces/i_flyout_inflater.js';
import type {IBoundedElement} from './interfaces/i_bounded_element.js';
import type {WorkspaceSvg} from './workspace_svg.js';
import {FlyoutSeparator} from './flyout_separator.js';
import type {SeparatorInfo} from './utils/toolbox.js';
import * as registry from './registry.js';

export class SeparatorFlyoutInflater implements IFlyoutInflater {
  load(_state: Object, _flyoutWorkspace: WorkspaceSvg): IBoundedElement {
    // This empty separator will be substituted by the one created by the
    // flyout based on the value returned from gapForElement().
    return new FlyoutSeparator(0);
  }

  gapForElement(state: Object, defaultGap: number): number {
    const separatorState = state as SeparatorInfo;
    const newGap = parseInt(String(separatorState['gap']));
    return newGap ?? defaultGap;
  }

  disposeElement(_element: IBoundedElement): void {}
}

registry.register(
  registry.Type.FLYOUT_INFLATER,
  'sep',
  SeparatorFlyoutInflater,
);
