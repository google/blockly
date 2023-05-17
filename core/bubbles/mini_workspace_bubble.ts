/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Abstract as AbstractEvent} from '../events/events_abstract.js';
import type {BlocklyOptions} from '../blockly_options.js';
import {Bubble} from './bubble.js';
import type {Coordinate} from '../utils/coordinate.js';
import * as dom from '../utils/dom.js';
import {Options} from '../options.js';
import {Svg} from '../utils/svg.js';
import type {Rect} from '../utils/rect.js';
import {Size} from '../utils/size.js';
import {WorkspaceSvg} from '../workspace_svg.js';

export class MiniWorkspaceBubble extends Bubble {
  private svgDialog: SVGElement;
  private miniWorkspace: WorkspaceSvg;

  constructor(
    workspaceOptions: BlocklyOptions,
    protected readonly workspace: WorkspaceSvg,
    protected anchor: Coordinate,
    protected ownerRect?: Rect
  ) {
    super(workspace, anchor, ownerRect);
    const options = new Options(workspaceOptions);
    this.validateWorkspaceOptions(options);

    this.svgDialog = dom.createSvgElement(
      Svg.SVG,
      {
        'x': Bubble.BORDER_WIDTH,
        'y': Bubble.BORDER_WIDTH,
      },
      this.contentContainer
    );
    workspaceOptions.parentWorkspace = this.workspace;
    this.miniWorkspace = this.newWorkspaceSvg(new Options(workspaceOptions));
    const background = this.miniWorkspace.createDom('blocklyMutatorBackground');
    this.svgDialog.appendChild(background);
    if (options.languageTree) {
      background.insertBefore(
        this.miniWorkspace.addFlyout(Svg.G),
        this.miniWorkspace.getCanvas()
      );
      const flyout = this.miniWorkspace.getFlyout();
      flyout?.init(this.miniWorkspace);
      flyout?.show(options.languageTree);
    }

    this.addWorkspaceChangeListener(this.updateBubbleSize.bind(this));
    this.updateBubbleSize();
  }

  dispose() {
    this.miniWorkspace.dispose();
    super.dispose();
  }

  /** @internal */
  getWorkspace(): WorkspaceSvg {
    return this.miniWorkspace;
  }

  addWorkspaceChangeListener(listener: (e: AbstractEvent) => void) {
    this.miniWorkspace.addChangeListener(listener);
    this.miniWorkspace.getFlyout()?.getWorkspace().addChangeListener(listener);
  }

  private validateWorkspaceOptions(options: Options) {
    if (options.hasCategories) {
      throw new Error(
        'The miniworkspace bubble does not support toolboxes with categories'
      );
    }
    if (options.hasTrashcan) {
      throw new Error('The miniworkspace bubble does not support trashcans');
    }
    if (
      options.zoomOptions.controls ||
      options.zoomOptions.wheel ||
      options.zoomOptions.pinch
    ) {
      throw new Error('The miniworkspace bubble does not support zooming');
    }
    if (
      options.moveOptions.scrollbars ||
      options.moveOptions.wheel ||
      options.moveOptions.drag
    ) {
      throw new Error(
        'The miniworkspace bubble does not scrolling/moving the workspace'
      );
    }
    if (options.horizontalLayout) {
      throw new Error(
        'The miniworkspace bubble does not support horizontal layouts'
      );
    }
  }

  private updateBubbleSize() {
    if (this.miniWorkspace.isDragging()) return;

    const currSize = this.getSize();
    const newSize = this.calculateWorkspaceSize();
    if (
      Math.abs(currSize.width - newSize.width) < 10 &&
      Math.abs(currSize.height - newSize.height) < 10
    ) {
      // Only resize if the size has noticeably changed.
      return;
    }
    this.svgDialog.setAttribute('width', `${newSize.width}px`);
    this.svgDialog.setAttribute('height', `${newSize.height}px`);
    this.miniWorkspace.setCachedParentSvgSize(newSize.width, newSize.height);
    if (this.miniWorkspace.RTL) {
      this.miniWorkspace
        .getCanvas()
        .setAttribute('transform', `translate(${newSize.width}, 0)`);
    }
    this.setSize(
      new Size(
        newSize.width + Bubble.DOUBLE_BORDER,
        newSize.height + Bubble.DOUBLE_BORDER
      ),
      true
    );
    this.miniWorkspace.resize();
    this.miniWorkspace.recordDragTargets();
  }

  private calculateWorkspaceSize(): Size {
    const canvas = this.miniWorkspace.getCanvas();
    const bbox = canvas.getBBox();
    let width = this.miniWorkspace.RTL ? -bbox.x : bbox.width;
    let height = bbox.height + bbox.y + Bubble.DOUBLE_BORDER * 3;
    const flyout = this.miniWorkspace.getFlyout();
    if (flyout) {
      const flyoutScrollMetrics = flyout
        .getWorkspace()
        .getMetricsManager()
        .getScrollMetrics();
      height = Math.max(height, flyoutScrollMetrics.height + 20);
      if (this.miniWorkspace.RTL) {
        width = Math.max(width, flyout.getWidth());
      } else {
        width += flyout.getWidth();
      }
    }
    width += Bubble.DOUBLE_BORDER * 3;
    return new Size(width, height);
  }

  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  newWorkspaceSvg(options: Options): WorkspaceSvg {
    throw new Error(
      'The implementation of newWorkspaceSvg should be ' +
        'monkey-patched in by blockly.ts'
    );
  }
}
