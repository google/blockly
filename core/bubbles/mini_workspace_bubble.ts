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

    this.svgDialog = dom.createSvgElement(
      Svg.SVG,
      {
        'x': Bubble.BORDER_WIDTH,
        'y': Bubble.BORDER_WIDTH,
      },
      this.contentContainer
    );
    this.miniWorkspace = this.newWorkspaceSvg(new Options(workspaceOptions));
    this.svgDialog.appendChild(
      this.miniWorkspace.createDom('blocklyMutatorBackground')
    );
    this.miniWorkspace.addChangeListener(this.updateBubbleSize.bind(this));
    this.updateBubbleSize();
  }

  /** @internal */
  getWorkspace(): WorkspaceSvg {
    return this.miniWorkspace;
  }

  addWorkspaceChangeListener(listener: (e: AbstractEvent) => void) {
    this.miniWorkspace.addChangeListener(listener);
  }

  private updateBubbleSize() {
    if (this.miniWorkspace.isDragging()) return;

    const currSize = this.getSize();
    const newSize = this.calculateWorkspaceSize();
    console.log(currSize, newSize);
    if (
      Math.abs(currSize.width - newSize.width) < 10 &&
      Math.abs(currSize.height - newSize.height) < 10
    ) {
      // Only resize if the size has noticeably changed.
      return;
    }
    this.svgDialog.setAttribute('width', `${newSize.width}px`);
    this.svgDialog.setAttribute('height', `${newSize.height}px`);
    this.setSize(
      new Size(
        newSize.width + Bubble.DOUBLE_BORDER,
        newSize.height + Bubble.DOUBLE_BORDER
      ),
      true
    );
    this.miniWorkspace.resize();
  }

  private calculateWorkspaceSize(): Size {
    const canvas = this.miniWorkspace.getCanvas();
    const workspaceSize = canvas.getBBox();
    let width = workspaceSize.width + workspaceSize.x;
    let height = workspaceSize.height + Bubble.DOUBLE_BORDER * 3;
    const flyout = this.miniWorkspace.getFlyout();
    if (flyout) {
      const flyoutScrollMetrics = flyout
        .getWorkspace()
        .getMetricsManager()
        .getScrollMetrics();
      height = Math.max(height, flyoutScrollMetrics.height + 20);
      width += flyout.getWidth();
    }
    const isRtl = this.miniWorkspace.RTL;
    if (isRtl) {
      width = -workspaceSize.x;
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
